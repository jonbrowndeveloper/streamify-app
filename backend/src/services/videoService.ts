import fs from 'fs';
import path from 'path';
import { Response } from 'express';
import Video from '../models/Video';
import AppSettings from '../models/AppSettings';

const parseFilename = (filename: string) => {
  const nameEndIndex = filename.indexOf('[') !== -1 ? filename.indexOf('[') : filename.indexOf('(');
  const name = filename.substring(0, nameEndIndex).trim();

  let altName = null;
  if (filename.indexOf('[ALT ') !== -1) {
    const altNameStartIndex = filename.indexOf('[ALT ') + 5;
    const altNameEndIndex = filename.indexOf(']', altNameStartIndex);
    altName = filename.substring(altNameStartIndex, altNameEndIndex).trim();
  }

  const actorsStartIndex = filename.indexOf('(') + 1;
  const actorsEndIndex = filename.lastIndexOf(')');
  const actorsAndYear = filename.substring(actorsStartIndex, actorsEndIndex).trim();
  const yearMatch = actorsAndYear.match(/(\d{4})$/);
  const movieYear = yearMatch ? parseInt(yearMatch[0], 10) : null;
  const actors = actorsAndYear.substring(0, yearMatch ? yearMatch.index : actorsAndYear.length).split(',').map(actor => actor.trim());

  return {
    name,
    altName,
    actors,
    movieYear,
    filepath: filename,
  };
};

export const scanAndInsertVideos = async (res: Response, basePath: string) => {
  let totalVideosFound = 0;
  let totalVideosInserted = 0;
  const errors: { file: string; error: string }[] = [];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    let appSettings = await AppSettings.findOne();
    if (!appSettings) {
      appSettings = await AppSettings.create({ videoBasePath: 'E:/Video/Movies' });
    }

    const files = fs.readdirSync(basePath);
    totalVideosFound += files.length;

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!['.mp4', '.m4v', '.mkv', '.webm'].includes(ext)) {
        continue;
      }

      try {
        const videoData = parseFilename(file);
        const existingVideo = await Video.findOne({
          where: {
            name: videoData.name,
            altName: videoData.altName,
            movieYear: videoData.movieYear,
          },
        });

        if (!existingVideo) {
          await Video.create({ ...videoData, filepath: file });
          totalVideosInserted++;
        }
      } catch (error: any) {
        console.error(`Error processing file ${file}:`, error);
        errors.push({ file, error: error instanceof Error ? error.message : 'Unknown error' });
      }

      res.write(`data: ${JSON.stringify({ totalVideosFound, totalVideosInserted })}\n\n`);
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error('Directory not found:', basePath);
    } else {
      console.error('Error scanning videos:', error);
    }
  } finally {
    res.end();
  }
};
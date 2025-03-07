import fs from 'fs';
import path from 'path';
import Video from '../models/Video';

const VIDEO_DIRECTORIES = [
  'E:/Video/Movies',
  // 'E:/Video/Learning Videos',
  // 'E:/Video/TV Shows',
];

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

  // Use regex to extract the year and separate it from the actors
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

export const scanAndInsertVideos = async () => {
  let totalVideosFound = 0;
  let totalVideosInserted = 0;
  const errors: { file: string; error: string }[] = [];

  for (const dir of VIDEO_DIRECTORIES) {
    const files = fs.readdirSync(dir);
    totalVideosFound += files.length;

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!['.mp4', '.m4v', '.mkv', '.webm'].includes(ext)) {
        continue;
      }

      try {
        const videoData = parseFilename(file);
        if (videoData) {
          const existingVideo = await Video.findOne({
            where: {
              name: videoData.name,
              altName: videoData.altName,
              movieYear: videoData.movieYear,
            },
          });

          if (!existingVideo) {
            await Video.create(videoData);
            totalVideosInserted++;
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        console.error('Skipping file...');
        errors.push({ file, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  }

  return { totalVideosFound, totalVideosInserted, errors };
};
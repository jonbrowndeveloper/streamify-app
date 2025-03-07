import { Request, Response } from 'express';
import axios from 'axios';
import Video from '../models/Video';

interface OmdbApiResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
  Error?: string;
  ratings?: {
    source: string;
    value: string;
  }[];
}

export const getOmdbData = async (req: Request, res: Response) => {
  let updatedCount = 0;
  try {
    const videos = await Video.findAll({
      where: { omdbData: null },
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for (const video of videos) {
      const response = await axios.get<OmdbApiResponse>(
        `http://www.omdbapi.com/?t=${encodeURIComponent(video.name)}&apikey=23fb5088&r=json&y=${video.movieYear}`
      );



      await video.update({ omdbData: response.data });
      updatedCount++;
      res.write(`data: ${JSON.stringify({ updatedCount, total: videos.length })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ message: `OMDB data fetched and updated successfully for ${updatedCount} videos.` })}\n\n`);
    res.end();
  } catch (error : any) {
    if (error.response?.data?.Error === 'Request limit reached!') {
      res.write(`data: ${JSON.stringify({ message: `OMDB API request limit reached. Updated ${updatedCount} videos.` })}\n\n`);
      res.end();
      return;
    }else if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};
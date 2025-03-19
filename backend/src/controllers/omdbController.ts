import { Request, Response } from 'express';
import axios from 'axios';
import Video from '../models/Video';
import logger from '../logger';

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
    Source: string;
    Value: string;
  }[];
}

const transformOmdbData = (data: OmdbApiResponse) => ({
  title: data.Title,
  year: data.Year,
  rated: data.Rated,
  released: data.Released,
  runtime: data.Runtime,
  genre: data.Genre,
  director: data.Director,
  writer: data.Writer,
  actors: data.Actors,
  plot: data.Plot,
  language: data.Language,
  country: data.Country,
  awards: data.Awards,
  poster: data.Poster,
  metascore: data.Metascore,
  imdbRating: data.imdbRating,
  imdbVotes: data.imdbVotes,
  imdbID: data.imdbID,
  type: data.Type,
  dvd: data.DVD,
  boxOffice: data.BoxOffice,
  production: data.Production,
  website: data.Website,
  response: data.Response,
  error: data.Error,
  ratings: data.ratings?.map(rating => ({
    source: rating.Source,
    value: rating.Value,
  })),
});

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
        `http://www.omdbapi.com/?t=${encodeURIComponent(video.name)}&apikey=cef65fad&r=json&y=${video.movieYear}`
      );

      const transformedData = transformOmdbData(response.data);
      await video.update({ omdbData: transformedData });
      updatedCount++;
      res.write(`data: ${JSON.stringify({ updatedCount, total: videos.length })}\n\n`);
    }

    res.write(`event: end\ndata: ${JSON.stringify({ message: `OMDB data fetched and updated successfully for ${updatedCount} videos.` })}\n\n`);
    res.end();
  } catch (error: any) {
    if (error.response?.data?.Error === 'Request limit reached!') {
      logger.error('OMDB API request limit reached:', error.response.data.Error);
      res.write(`event: error\ndata: ${JSON.stringify({ error: `OMDB API request limit reached. Updated ${updatedCount} videos.` })}\n\n`);
      res.end();
      return;
    } else if (error instanceof Error) {
      logger.error('Error fetching OMDB data:', error.message);
      res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    } else {
      logger.error('An unknown error occurred:', error);
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'An unknown error occurred' })}\n\n`);
    }
    res.end();
  }
};
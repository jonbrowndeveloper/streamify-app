export interface Video {
    id: string;
    dateCreated: Date;
    name: string;
    altName?: string;
    actors: string[];
    movieYear: number;
    filepath: string;
    omdbData?: {
      title?: string;
      year?: string;
      rated?: string;
      released?: string;
      runtime?: string;
      genre?: string;
      director?: string;
      writer?: string;
      actors?: string;
      plot?: string;
      language?: string;
      country?: string;
      awards?: string;
      poster?: string;
      metascore?: string;
      imdbRating?: string;
      imdbVotes?: string;
      imdbID?: string;
      type?: string;
      dvd?: string;
      boxOffice?: string;
      production?: string;
      website?: string;
      response?: string;
      error?: string;
      ratings?: {
        source: string;
        value: string;
      }[];
    };
  }
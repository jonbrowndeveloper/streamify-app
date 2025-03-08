import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

class Video extends Model {
  public id!: string;
  public dateCreated!: Date;
  public name!: string;
  public altName?: string;
  public actors!: string[];
  public movieYear!: number;
  public filepath!: string;
  public omdbData?: {
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

Video.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    dateCreated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    altName: {
      type: DataTypes.STRING,
    },
    actors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    movieYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    filepath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    omdbData: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Video',
  }
);

export default Video;
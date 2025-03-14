import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

class AppSettings extends Model {
  public id!: number;
  public videoBasePath!: string;
}

AppSettings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    videoBasePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'AppSettings',
  }
);

export default AppSettings;
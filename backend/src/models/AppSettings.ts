import { DataTypes, Model, Sequelize } from 'sequelize';

class AppSettings extends Model {
  public id!: number;
  public videoBasePath!: string;

  static initialize(sequelize: Sequelize) {
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
  }
}

export default AppSettings;
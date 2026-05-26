import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './model';

interface UserSessionAttributes {
  id: number;
  userId: number;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  lastActivityAt: Date;
  createdAt?: Date;
}

interface UserSessionCreationAttributes extends Optional<UserSessionAttributes, 'id' | 'ipAddress' | 'userAgent' | 'createdAt'> {}

class UserSession extends Model<UserSessionAttributes, UserSessionCreationAttributes>
  implements UserSessionAttributes {
  public id!: number;
  public userId!: number;
  public sessionId!: string;
  public ipAddress?: string;
  public userAgent?: string;
  public lastActivityAt!: Date;
  public readonly createdAt!: Date;
}

UserSession.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    sessionId: { type: DataTypes.STRING(128), allowNull: false, unique: true },
    ipAddress: { type: DataTypes.STRING(45), allowNull: true },
    userAgent: { type: DataTypes.TEXT, allowNull: true },
    lastActivityAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'user_sessions', timestamps: true, updatedAt: false }
);

export default UserSession;

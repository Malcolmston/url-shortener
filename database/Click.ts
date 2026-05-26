import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './model';

interface ClickAttributes {
  id: number;
  linkId: number;
  ipHash?: string;       // HMAC-SHA256 of IP — never store raw IP
  country?: string;      // 2-char ISO 3166-1 alpha-2
  city?: string;
  device?: string;       // "mobile" | "tablet" | "desktop" | "bot"
  os?: string;           // "iOS" | "Android" | "Windows" | "macOS" | "Linux" | "Other"
  browser?: string;      // "Chrome" | "Firefox" | "Safari" | "Edge" | "Other"
  referrer?: string;     // normalised: scheme+host only
  createdAt?: Date;
}

interface ClickCreationAttributes
  extends Optional<ClickAttributes, 'id' | 'ipHash' | 'country' | 'city' | 'device' | 'os' | 'browser' | 'referrer' | 'createdAt'> {}

class Click extends Model<ClickAttributes, ClickCreationAttributes> implements ClickAttributes {
  public id!: number;
  public linkId!: number;
  public ipHash?: string;
  public country?: string;
  public city?: string;
  public device?: string;
  public os?: string;
  public browser?: string;
  public referrer?: string;
  public readonly createdAt!: Date;
}

Click.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    linkId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    ipHash: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    country: {
      type: DataTypes.CHAR(2),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    device: {
      type: DataTypes.ENUM('mobile', 'tablet', 'desktop', 'bot', 'unknown'),
      allowNull: true,
    },
    os: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    browser: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    referrer: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'clicks',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['linkId', 'createdAt'] },
      { fields: ['ipHash'] },
    ],
  }
);

export default Click;

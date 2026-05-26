import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './model';

interface LinkAttributes {
  id: number;
  slug: string;
  originalUrl: string;
  userId?: number;
  title?: string;
  description?: string;
  favicon?: string;
  redirectType: '301' | '302' | '307';
  clicks: number;
  isPasswordProtected: boolean;
  passwordHash?: string;
  hasPreview: boolean;
  expiresAt?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface LinkCreationAttributes extends Optional<LinkAttributes,
  'id' | 'userId' | 'title' | 'description' | 'favicon' |
  'redirectType' | 'clicks' | 'isPasswordProtected' | 'passwordHash' |
  'hasPreview' | 'expiresAt' | 'isActive' | 'createdAt' | 'updatedAt' | 'deletedAt'
> {}

class Link extends Model<LinkAttributes, LinkCreationAttributes> implements LinkAttributes {
  public id!: number;
  public slug!: string;
  public originalUrl!: string;
  public userId?: number;
  public title?: string;
  public description?: string;
  public favicon?: string;
  public redirectType!: '301' | '302' | '307';
  public clicks!: number;
  public isPasswordProtected!: boolean;
  public passwordHash?: string;
  public hasPreview!: boolean;
  public expiresAt?: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > new Date(this.expiresAt);
  }
}

Link.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 60],
        is: /^[a-zA-Z0-9_-]+$/,
      },
    },
    originalUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    favicon: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    redirectType: {
      type: DataTypes.ENUM('301', '302', '307'),
      allowNull: false,
      defaultValue: '302',
    },
    clicks: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    isPasswordProtected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasPreview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'links',
    paranoid: true, // soft delete
    timestamps: true,
  }
);

export default Link;

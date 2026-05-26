import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './model';

interface ApiKeyAttributes {
  id: number;
  userId: number;
  keyHash: string;
  keyPrefix: string; // first 8 chars for display e.g. "sk_snp_a"
  label: string;
  scopes: string; // JSON array: ["links:read","links:write","files:read"]
  lastUsedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface ApiKeyCreationAttributes extends Optional<ApiKeyAttributes, 'id' | 'lastUsedAt' | 'expiresAt' | 'isActive' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

class ApiKey extends Model<ApiKeyAttributes, ApiKeyCreationAttributes> implements ApiKeyAttributes {
  public id!: number;
  public userId!: number;
  public keyHash!: string;
  public keyPrefix!: string;
  public label!: string;
  public scopes!: string;
  public lastUsedAt?: Date;
  public expiresAt?: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;

  getScopesArray(): string[] {
    try { return JSON.parse(this.scopes); } catch { return []; }
  }

  hasScope(scope: string): boolean {
    return this.getScopesArray().includes(scope) || this.getScopesArray().includes('*');
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > new Date(this.expiresAt);
  }
}

ApiKey.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    keyHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    keyPrefix: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'API Key',
    },
    scopes: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '["*"]',
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'api_keys',
    paranoid: true,
    timestamps: true,
  }
);

export default ApiKey;

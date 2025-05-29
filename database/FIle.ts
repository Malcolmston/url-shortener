import {
    CreationOptional,
    DataTypes,
    HasOneGetAssociationMixin,
    HasOneSetAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
    ForeignKey
} from 'sequelize';
import sequelize from './model';
import { randomUUID } from 'node:crypto';
import User from './User';

class File extends Model<InferAttributes<File>, InferCreationAttributes<File>> {
    declare id: CreationOptional<number>;
    declare uuid: CreationOptional<string>;
    declare name: string;
    declare file: Buffer;
    declare visibility: boolean;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare deletedAt: CreationOptional<Date>;

    declare userId: ForeignKey<User['id']>;
    declare user?: NonAttribute<User>;

    declare getUser: HasOneGetAssociationMixin<User>;
    declare setUser: HasOneSetAssociationMixin<User, number>;
}

File.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        uuid: {
            type: DataTypes.UUID,
            defaultValue: () => randomUUID(),
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        file: {
            type: DataTypes.BLOB('long'),
            allowNull: false,
        },
        visibility: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'files',
        timestamps: true,
        paranoid: true,
    }
);

export default File;

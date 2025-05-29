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

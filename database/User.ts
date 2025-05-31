import {
    CreateOptions,
    CreationOptional,
    DataTypes,
    HasManyAddAssociationMixin,
    HasManyAddAssociationsMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManyHasAssociationsMixin,
    HasManyRemoveAssociationMixin,
    HasManyRemoveAssociationsMixin,
    HasManySetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute
} from "sequelize";
import sequelize from "./model";
import {hashSync, compareSync} from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

import File from "./File";

const SALT = process.env.SALT || 10;

export default class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>
    declare firstname: string
    declare lastname: string
    declare username: string
    declare password: string
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare deletedAt: CreationOptional<Date>;

    declare getFiles: HasManyGetAssociationsMixin<File>;
    declare addFile: HasManyAddAssociationMixin<File, number>;
    declare addFiles: HasManyAddAssociationsMixin<File, number>;
    declare setFiles: HasManySetAssociationsMixin<File, number>;
    declare removeFile: HasManyRemoveAssociationMixin<File, number>;
    declare removeFiles: HasManyRemoveAssociationsMixin<File, number>;
    declare hasFile: HasManyHasAssociationMixin<File, number>;
    declare hasFiles: HasManyHasAssociationsMixin<File, number>;
    declare countFiles: HasManyCountAssociationsMixin;
    declare createFile: HasManyCreateAssociationMixin<File>;

    declare files?: NonAttribute<File[]>; // For eager loading

    get fullName(): NonAttribute<string> {
        return `${this.firstname} ${this.lastname}`;
    }

    public isValidPassword(password: string): boolean {
        return compareSync(password, this.password);
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                is: /^[A-Z][a-z]+([ '-][A-Z][a-z]+)*$/i,
            },
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                is: /^[A-Z][a-z]+([ '-][A-Z][a-z]+)*$/i,
            },
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [4, 30],
                is: /^[a-zA-Z0-9_]+$/, // Typical username pattern
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
        paranoid: true,
        hooks: {
            beforeCreate(user) {
                user.password = hashSync(user.password, SALT);
            },
            beforeUpdate(user) {
                if (user.changed('password')) {
                    user.password = hashSync(user.password, SALT);
                }
            },
        },
    }
);

import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute} from "sequelize";
import sequelize from "./model";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>
    declare firstname: string
    declare lastname: string
    declare username: string
    declare password: string
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare deletedAt: CreationOptional<Date>;

    get fullName(): NonAttribute<string> {
        return `${this.firstname} ${this.lastname}`;
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
        paranoid: true, // Enables `deletedAt` tracking
    }
);

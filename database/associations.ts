import User from './User';
import File from './File';
import Link from './Link';
import sequelize from "./model";

// User → Files
User.hasMany(File, { foreignKey: 'userId', as: 'files' });
File.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User → Links
User.hasMany(Link, { foreignKey: 'userId', as: 'links' });
Link.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, File, Link, sequelize }

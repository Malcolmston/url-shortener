import User from './User';
import File from './File';
import Click from './Click';
import sequelize from './model';

// User → Files
User.hasMany(File, { foreignKey: 'userId', as: 'files' });
File.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Note: Link model is in feature/url-shortener-core — Click FK is enforced at DB level
// Link.hasMany(Click, { foreignKey: 'linkId', as: 'clicks' });
// Click.belongsTo(Link, { foreignKey: 'linkId', as: 'link' });

export { User, File, Click, sequelize };

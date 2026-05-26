import User from './User';
import File from './File';
import Link from './Link';
import PasswordResetToken from './PasswordResetToken';
import ApiKey from './ApiKey';
import UserSession from './UserSession';
import Click from './Click';
import sequelize from './model';

// User → Files
User.hasMany(File, { foreignKey: 'userId', as: 'files' });
File.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User → Links
User.hasMany(Link, { foreignKey: 'userId', as: 'links' });
Link.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Link → Clicks (analytics)
Link.hasMany(Click, { foreignKey: 'linkId', as: 'clicks' });
Click.belongsTo(Link, { foreignKey: 'linkId', as: 'link' });

// User → PasswordResetTokens
User.hasMany(PasswordResetToken, { foreignKey: 'userId', as: 'passwordResetTokens' });
PasswordResetToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User → ApiKeys
User.hasMany(ApiKey, { foreignKey: 'userId', as: 'apiKeys' });
ApiKey.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User → UserSessions
User.hasMany(UserSession, { foreignKey: 'userId', as: 'sessions' });
UserSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, File, Link, PasswordResetToken, ApiKey, UserSession, Click, sequelize };

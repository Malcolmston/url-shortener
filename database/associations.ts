import User from './User';
import File from './File';

// If each user has many files
User.hasMany(File, {
    foreignKey: 'userId',
    as: 'files'
});

File.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

export {User, File, sequelize}

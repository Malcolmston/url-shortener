/**
 * Central models entry point.
 * Imports the associations file which wires up all Sequelize models and
 * exports them for use in API routes.
 */
export {
  default as User,
} from '@/database/User';

export {
  default as File,
} from '@/database/File';

export {
  default as Link,
} from '@/database/Link';

export {
  default as Click,
} from '@/database/Click';

export {
  default as ApiKey,
} from '@/database/ApiKey';

export {
  default as PasswordResetToken,
} from '@/database/PasswordResetToken';

export {
  default as UserSession,
} from '@/database/UserSession';

export { sequelize } from '@/database/associations';

// Ensure associations are loaded when this module is imported
import '@/database/associations';

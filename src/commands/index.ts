import { GetUserAvatar } from './get-user-avatar.js';
import { GetUserInfo } from './get-user-info.js';
import { UpdateUserInfo } from './update-user-info.js';
import { VerifyUserCommand } from './verify-user.js';

export const commands = [VerifyUserCommand, GetUserInfo, GetUserAvatar, UpdateUserInfo];
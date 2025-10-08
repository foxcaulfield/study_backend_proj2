import { CustomDecorator, SetMetadata } from "@nestjs/common";
import { UserRoleEnum } from "src/users/user.model";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRoleEnum[]): CustomDecorator => SetMetadata(ROLES_KEY, roles);

export const IS_PUBLIC_KEY = "isPublic";
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);

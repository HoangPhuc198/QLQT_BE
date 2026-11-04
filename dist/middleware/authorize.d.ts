import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { Permission } from '../config/permissions';
/**
 * Authorize access based on Allowed User Roles
 */
export declare function authorize(...allowedRoles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Authorize access based on Specific Fine-Grained Permissions
 */
export declare function requirePermission(...permissions: Permission[]): (req: Request, res: Response, next: NextFunction) => void;

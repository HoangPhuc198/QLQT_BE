/**
 * EventFlow — Role-Based Access Control (RBAC) System
 * Defines fine-grained permissions and maps them to User Roles.
 */
import { UserRole } from '../types';
export declare enum Permission {
    EVENT_CREATE = "EVENT:CREATE",
    EVENT_VIEW_ALL = "EVENT:VIEW_ALL",
    EVENT_VIEW_OWN = "EVENT:VIEW_OWN",
    EVENT_VIEW_FACULTY = "EVENT:VIEW_FACULTY",
    EVENT_EDIT_DRAFT = "EVENT:EDIT_DRAFT",
    EVENT_EDIT_ANY = "EVENT:EDIT_ANY",
    EVENT_SUBMIT = "EVENT:SUBMIT",
    EVENT_CANCEL = "EVENT:CANCEL",
    EVENT_DELETE = "EVENT:DELETE",
    APPROVAL_KHOA_REVIEW = "APPROVAL:KHOA_REVIEW",
    APPROVAL_DOAN_REVIEW = "APPROVAL:DOAN_REVIEW",
    APPROVAL_ISSUE_PERMIT = "APPROVAL:ISSUE_PERMIT",
    APPROVAL_VIEW_AUDIT_LOG = "APPROVAL:VIEW_AUDIT_LOG",
    FACILITY_VIEW_CALENDAR = "FACILITY:VIEW_CALENDAR",
    FACILITY_REQUEST_BOOKING = "FACILITY:REQUEST_BOOKING",
    FACILITY_APPROVE_BOOKING = "FACILITY:APPROVE_BOOKING",
    FACILITY_REJECT_BOOKING = "FACILITY:REJECT_BOOKING",
    FACILITY_MANAGE_LIST = "FACILITY:MANAGE_LIST",
    HANDOVER_SIGN_PRE_EVENT = "HANDOVER:SIGN_PRE_EVENT",
    HANDOVER_RECEIVE_FACILITY = "HANDOVER:RECEIVE_FACILITY",
    HANDOVER_INSPECT_RETURN = "HANDOVER:INSPECT_RETURN",
    HANDOVER_LOG_INCIDENT = "HANDOVER:LOG_INCIDENT",
    SETTLEMENT_CREATE = "SETTLEMENT:CREATE",
    SETTLEMENT_SUBMIT = "SETTLEMENT:SUBMIT",
    SETTLEMENT_VERIFY_DOCS = "SETTLEMENT:VERIFY_DOCS",
    SETTLEMENT_APPROVE = "SETTLEMENT:APPROVE",
    SETTLEMENT_VIEW_ANY = "SETTLEMENT:VIEW_ANY",
    REPORT_SUBMIT = "REPORT:SUBMIT",
    REPORT_APPROVE = "REPORT:APPROVE",
    REPORT_VIEW_ANALYTICS = "REPORT:VIEW_ANALYTICS",
    USER_MANAGE = "USER:MANAGE",
    SYSTEM_CONFIG = "SYSTEM:CONFIG"
}
/**
 * Static Role-to-Permissions Matrix
 */
export declare const ROLE_PERMISSIONS: Record<UserRole, Permission[]>;
/**
 * Checks if a given role has a specific permission
 */
export declare function hasPermission(role: UserRole | string, permission: Permission): boolean;
/**
 * Checks if a given role has at least one of the specified permissions
 */
export declare function hasAnyPermission(role: UserRole | string, permissions: Permission[]): boolean;
/**
 * Checks if a given role has all of the specified permissions
 */
export declare function hasAllPermissions(role: UserRole | string, permissions: Permission[]): boolean;
/**
 * Returns all permissions granted to a role
 */
export declare function getPermissionsForRole(role: UserRole | string): Permission[];

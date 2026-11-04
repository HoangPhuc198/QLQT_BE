"use strict";
/**
 * EventFlow — Role-Based Access Control (RBAC) System
 * Defines fine-grained permissions and maps them to User Roles.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.Permission = void 0;
exports.hasPermission = hasPermission;
exports.hasAnyPermission = hasAnyPermission;
exports.hasAllPermissions = hasAllPermissions;
exports.getPermissionsForRole = getPermissionsForRole;
const types_1 = require("../types");
var Permission;
(function (Permission) {
    // Event Management
    Permission["EVENT_CREATE"] = "EVENT:CREATE";
    Permission["EVENT_VIEW_ALL"] = "EVENT:VIEW_ALL";
    Permission["EVENT_VIEW_OWN"] = "EVENT:VIEW_OWN";
    Permission["EVENT_VIEW_FACULTY"] = "EVENT:VIEW_FACULTY";
    Permission["EVENT_EDIT_DRAFT"] = "EVENT:EDIT_DRAFT";
    Permission["EVENT_EDIT_ANY"] = "EVENT:EDIT_ANY";
    Permission["EVENT_SUBMIT"] = "EVENT:SUBMIT";
    Permission["EVENT_CANCEL"] = "EVENT:CANCEL";
    Permission["EVENT_DELETE"] = "EVENT:DELETE";
    // Approvals & Permits
    Permission["APPROVAL_KHOA_REVIEW"] = "APPROVAL:KHOA_REVIEW";
    Permission["APPROVAL_DOAN_REVIEW"] = "APPROVAL:DOAN_REVIEW";
    Permission["APPROVAL_ISSUE_PERMIT"] = "APPROVAL:ISSUE_PERMIT";
    Permission["APPROVAL_VIEW_AUDIT_LOG"] = "APPROVAL:VIEW_AUDIT_LOG";
    // Facilities & Equipment
    Permission["FACILITY_VIEW_CALENDAR"] = "FACILITY:VIEW_CALENDAR";
    Permission["FACILITY_REQUEST_BOOKING"] = "FACILITY:REQUEST_BOOKING";
    Permission["FACILITY_APPROVE_BOOKING"] = "FACILITY:APPROVE_BOOKING";
    Permission["FACILITY_REJECT_BOOKING"] = "FACILITY:REJECT_BOOKING";
    Permission["FACILITY_MANAGE_LIST"] = "FACILITY:MANAGE_LIST";
    // Handover & Inspection
    Permission["HANDOVER_SIGN_PRE_EVENT"] = "HANDOVER:SIGN_PRE_EVENT";
    Permission["HANDOVER_RECEIVE_FACILITY"] = "HANDOVER:RECEIVE_FACILITY";
    Permission["HANDOVER_INSPECT_RETURN"] = "HANDOVER:INSPECT_RETURN";
    Permission["HANDOVER_LOG_INCIDENT"] = "HANDOVER:LOG_INCIDENT";
    // Settlement & Finance
    Permission["SETTLEMENT_CREATE"] = "SETTLEMENT:CREATE";
    Permission["SETTLEMENT_SUBMIT"] = "SETTLEMENT:SUBMIT";
    Permission["SETTLEMENT_VERIFY_DOCS"] = "SETTLEMENT:VERIFY_DOCS";
    Permission["SETTLEMENT_APPROVE"] = "SETTLEMENT:APPROVE";
    Permission["SETTLEMENT_VIEW_ANY"] = "SETTLEMENT:VIEW_ANY";
    // Reports & Analytics
    Permission["REPORT_SUBMIT"] = "REPORT:SUBMIT";
    Permission["REPORT_APPROVE"] = "REPORT:APPROVE";
    Permission["REPORT_VIEW_ANALYTICS"] = "REPORT:VIEW_ANALYTICS";
    // Administration
    Permission["USER_MANAGE"] = "USER:MANAGE";
    Permission["SYSTEM_CONFIG"] = "SYSTEM:CONFIG";
})(Permission || (exports.Permission = Permission = {}));
/**
 * Static Role-to-Permissions Matrix
 */
exports.ROLE_PERMISSIONS = {
    [types_1.UserRole.ADMIN]: Object.values(Permission),
    [types_1.UserRole.BTC]: [
        Permission.EVENT_CREATE,
        Permission.EVENT_VIEW_OWN,
        Permission.EVENT_EDIT_DRAFT,
        Permission.EVENT_SUBMIT,
        Permission.EVENT_CANCEL,
        Permission.APPROVAL_VIEW_AUDIT_LOG,
        Permission.FACILITY_VIEW_CALENDAR,
        Permission.FACILITY_REQUEST_BOOKING,
        Permission.HANDOVER_RECEIVE_FACILITY,
        Permission.SETTLEMENT_CREATE,
        Permission.SETTLEMENT_SUBMIT,
        Permission.REPORT_SUBMIT,
    ],
    [types_1.UserRole.BCN_KHOA]: [
        Permission.EVENT_VIEW_FACULTY,
        Permission.APPROVAL_KHOA_REVIEW,
        Permission.APPROVAL_VIEW_AUDIT_LOG,
        Permission.FACILITY_VIEW_CALENDAR,
        Permission.REPORT_VIEW_ANALYTICS,
    ],
    [types_1.UserRole.DOAN_TRUONG]: [
        Permission.EVENT_VIEW_ALL,
        Permission.APPROVAL_DOAN_REVIEW,
        Permission.APPROVAL_ISSUE_PERMIT,
        Permission.APPROVAL_VIEW_AUDIT_LOG,
        Permission.FACILITY_VIEW_CALENDAR,
        Permission.REPORT_APPROVE,
        Permission.REPORT_VIEW_ANALYTICS,
    ],
    [types_1.UserRole.CSVC]: [
        Permission.EVENT_VIEW_ALL,
        Permission.APPROVAL_VIEW_AUDIT_LOG,
        Permission.FACILITY_VIEW_CALENDAR,
        Permission.FACILITY_APPROVE_BOOKING,
        Permission.FACILITY_REJECT_BOOKING,
        Permission.FACILITY_MANAGE_LIST,
        Permission.HANDOVER_SIGN_PRE_EVENT,
        Permission.HANDOVER_INSPECT_RETURN,
        Permission.HANDOVER_LOG_INCIDENT,
        Permission.REPORT_VIEW_ANALYTICS,
    ],
    [types_1.UserRole.KHTC]: [
        Permission.EVENT_VIEW_ALL,
        Permission.APPROVAL_VIEW_AUDIT_LOG,
        Permission.SETTLEMENT_VIEW_ANY,
        Permission.SETTLEMENT_VERIFY_DOCS,
        Permission.SETTLEMENT_APPROVE,
        Permission.REPORT_VIEW_ANALYTICS,
    ],
};
/**
 * Checks if a given role has a specific permission
 */
function hasPermission(role, permission) {
    const roleEnum = role;
    const permissions = exports.ROLE_PERMISSIONS[roleEnum];
    if (!permissions)
        return false;
    return permissions.includes(permission);
}
/**
 * Checks if a given role has at least one of the specified permissions
 */
function hasAnyPermission(role, permissions) {
    return permissions.some((perm) => hasPermission(role, perm));
}
/**
 * Checks if a given role has all of the specified permissions
 */
function hasAllPermissions(role, permissions) {
    return permissions.every((perm) => hasPermission(role, perm));
}
/**
 * Returns all permissions granted to a role
 */
function getPermissionsForRole(role) {
    return exports.ROLE_PERMISSIONS[role] || [];
}
//# sourceMappingURL=permissions.js.map
import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/requirePermission.js";
import { internalApiKeyMiddleware } from "../../middlewares/internalApiKeyMiddleware.js";

export function createUserRoutes(userController) {
  const router = Router();

  router.get("/health", (req, res) => { res.json({ service: "user-service", status: "up", timestamp: new Date() }); });

  router.post("/users", authMiddleware, requirePermission("CREATE_USER"), userController.createUser);
  router.get("/users", authMiddleware, userController.listUsers);

  router.post("/sectors", authMiddleware, userController.createSector);
  router.get("/sectors", authMiddleware, userController.listSectors);

  router.post("/roles", authMiddleware, requirePermission("CREATE_ROLE"), userController.createRole);
  router.get("/roles", authMiddleware, userController.listRoles);

  router.post("/permissions", authMiddleware, userController.createPermission);
  router.get("/permissions", authMiddleware, userController.listPermissions);

  router.post("/roles/:roleId/permissions", authMiddleware, userController.assignPermissionToRole);
  router.get("/roles/:roleId/permissions", authMiddleware, userController.listRolePermissions);

  router.post("/internal/users/sync-from-ldap", internalApiKeyMiddleware, userController.syncUserFromLdap);

  router.get("/users/by-external-id/:externalId", authMiddleware, userController.getUserByExternalId);

  router.put("/users/:userId/sector", authMiddleware, userController.assignUserToSector);

  router.put("/sectors/:sectorId", authMiddleware, userController.updateSector);

  router.delete("/sectors/:sectorId", authMiddleware, userController.deleteSector);

  router.put("/users/:userId/role", authMiddleware, userController.assignUserToRole);

  router.put("/users/:userId/status", authMiddleware, userController.updateUserStatus);

  router.post("/internal/hr/sync", internalApiKeyMiddleware,userController.syncFromHr);

  return router;
}
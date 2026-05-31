import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

export function createAuthRoutes(authController) {
  const router = Router();

  router.get("/health", (req, res) => { res.json({ service: "auth-service", status: "up", timestamp: new Date() }); });
  router.post("/login-google", authController.loginGoogle);
  router.post("/google/link-tenant", authMiddleware, authController.linkGoogleTenant);
  router.post("/ldap/test-connection", authController.testLdapConnection);
  router.post("/ldap/config", authMiddleware, authController.createLdapConfig);

  router.post("/register-tenant-admin", authController.registerTenantAdmin);
  router.post("/login-admin", authController.loginAdmin);
  router.post("/login-employee", authController.loginEmployee);

  router.get("/me", authMiddleware, authController.me);
  router.get("/dashboard", authMiddleware, authController.dashboard);

  router.post("/hr/config", authMiddleware, authController.createHrConfig);
  router.get("/hr/config", authMiddleware, authController.getHrConfig);
  router.post("/hr/sync", authMiddleware, authController.syncHr);
  return router;
}
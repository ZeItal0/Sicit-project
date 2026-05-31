import { prisma } from "../database/prismaClient.js";

export class PrismaGoogleUserRepository {
    async findByGoogleId(googleId) {
        return prisma.googleUser.findUnique({
            where: { googleId }
        });
    }

    async findByEmail(email) {
        return prisma.googleUser.findUnique({
            where: { email }
        });
    }

    async upsert({ googleId, name, email, picture }) {
        return prisma.googleUser.upsert({
            where: { googleId },
            update: {
                name,
                email,
                picture
            },
            create: {
                googleId,
                name,
                email,
                picture
            }
        });
    }

    async linkToTenant({ googleUserId, tenantId }) {
        return prisma.googleUser.update({
            where: { id: googleUserId },
            data: { tenantId }
        });
    }

    async linkToTenantAsAdmin({ googleUserId, tenantId }) {
        return prisma.googleUser.update({
            where: { id: googleUserId },
            data: {
                tenantId,
                role: "TENANT_ADMIN"
            }
        });
    }
}
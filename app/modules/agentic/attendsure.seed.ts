import bcrypt from "bcryptjs";
import { createLogger } from "~/lib/logger";
import { UserModel } from "~/modules/authentication/authentication.model";
import { UserRole } from "~/modules/authentication/authentication.types";

const logger = createLogger("AttendSureSeed");

/**
 * Seed a demo employee so the app is usable on first boot. HR (admin) is
 * seeded by the authentication module. Idempotent: skips if the user exists.
 */
export async function seedDemoEmployee(): Promise<void> {
  try {
    const email = process.env.SEED_EMPLOYEE_EMAIL ?? "employee@example.com";
    const username = process.env.SEED_EMPLOYEE_USERNAME ?? "employee";
    const password = process.env.SEED_EMPLOYEE_PASSWORD ?? "Employee123!";

    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      logger.info("Demo employee already exists, skipping seed.");
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);
    await UserModel.create({
      username,
      email,
      password_hash,
      role: UserRole.Authenticated,
      is_active: true,
      email_verified: true,
    });

    logger.info(`✅ Demo employee '${username}' seeded successfully.`);
  } catch (error) {
    logger.error("❌ Failed to seed demo employee:", error);
  }
}

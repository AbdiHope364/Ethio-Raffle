import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { AuthSession, UserRole, DEMO_ACCOUNTS } from "./auth-types";

export * from "./auth-types";

export async function getCurrentUser(): Promise<AuthSession | null> {
  try {
    const cookieStore = cookies();
    const sessionPhone = cookieStore.get("raffle_session_phone")?.value || "+251933445566"; // Default to customer

    const user = await prisma.user.findUnique({
      where: { phone: sessionPhone },
      include: { agentProfile: true },
    });

    if (!user) return null;

    return {
      userId: user.id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role as UserRole,
      agentProfileId: user.agentProfile?.id,
      agentStatus: user.agentProfile?.status,
      floatBalance: user.agentProfile?.floatBalance,
    };
  } catch (error) {
    console.error("Error retrieving user session:", error);
    return null;
  }
}

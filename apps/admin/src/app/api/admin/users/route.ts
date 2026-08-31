import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";
import { logAuditEvent, AdminRole, ROLE_PERMISSIONS } from "@raffle/shared";

const VALID_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "FINANCE_ADMIN",
  "RAFFLE_ADMIN",
  "SELLER_ADMIN",
  "COMPLIANCE_ADMIN",
  "SUPPORT_ADMIN",
  "AUDITOR",
];

// GET /api/admin/users - List all admin personnel
export async function GET() {
  try {
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN", "RAFFLE_ADMIN", "SELLER_ADMIN", "COMPLIANCE_ADMIN", "SUPPORT_ADMIN", "AUDITOR"],
        },
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      users: adminUsers,
      availableRoles: VALID_ROLES,
      roleMatrix: ROLE_PERMISSIONS,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch admin personnel" }, { status: 500 });
  }
}

// POST /api/admin/users - Create new Sub-Admin
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, role } = body;

    if (!fullName || !phone || !role) {
      return NextResponse.json({ error: "Full Name, Phone, and Role are required." }, { status: 400 });
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: `Invalid role: ${role}. Allowed: ${VALID_ROLES.join(", ")}` }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { phone },
    });

    if (existing) {
      return NextResponse.json({ error: "User with this phone number already exists." }, { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        fullName,
        phone,
        role,
        status: "ACTIVE",
        isVerified: true,
        kycStatus: "VERIFIED",
      },
    });

    await logAuditEvent(prisma, {
      actorType: "ADMIN",
      action: "SUB_ADMIN_CREATED",
      entityType: "USER",
      entityId: newUser.id,
      afterState: { fullName, phone, role },
    });

    return NextResponse.json({
      success: true,
      message: `Sub-admin created successfully with role ${role}`,
      user: newUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create sub-admin" }, { status: 500 });
  }
}

// PATCH /api/admin/users - Grant / Update Sub-Admin Role
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, newRole, status } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    if (newRole && !VALID_ROLES.includes(newRole)) {
      return NextResponse.json({ error: `Invalid role. Allowed: ${VALID_ROLES.join(", ")}` }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Admin user not found." }, { status: 404 });
    }

    const previousRole = user.role;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(newRole ? { role: newRole } : {}),
        ...(status ? { status } : {}),
      },
    });

    await logAuditEvent(prisma, {
      actorType: "ADMIN",
      action: "ADMIN_ROLE_GRANTED",
      entityType: "USER",
      entityId: userId,
      beforeState: { role: previousRole, status: user.status },
      afterState: { role: updated.role, status: updated.status },
    });

    return NextResponse.json({
      success: true,
      message: `Role updated from ${previousRole} to ${updated.role}`,
      user: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update sub-admin role" }, { status: 500 });
  }
}


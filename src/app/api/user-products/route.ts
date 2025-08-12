import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth";
import { ProductStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// Map from frontend/backend string status to Prisma enum
const statusMap: Record<string, ProductStatus> = {
  currentRoutine: ProductStatus.CURRENT,
  tried: ProductStatus.TRIED,
  wantToTry: ProductStatus.WANT_TO_TRY,
};

// Helper to convert Prisma enum back to backend string
function toBackendStatus(prismaStatus: ProductStatus): string {
  return (
    Object.entries(statusMap).find(([, v]) => v === prismaStatus)?.[0] || "wantToTry"
  );
}

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userProducts = await prisma.userProduct.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    const transformed = userProducts.map((up) => ({
      ...up,
      status: toBackendStatus(up.status),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("GET /api/user-products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, status } = body;

    if (!name || !status || !(status in statusMap)) {
      return NextResponse.json(
        {
          error: `Missing or invalid fields. Status must be one of: ${Object.keys(
            statusMap
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const prismaStatus = statusMap[status];

    let product = await prisma.product.findFirst({ where: { name: name.trim() } });
    if (!product) {
      product = await prisma.product.create({ data: { name: name.trim() } });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingUserProduct = await prisma.userProduct.findUnique({
      where: { userId_productId: { userId: user.id, productId: product.id } },
      include: { product: true },
    });

    let userProduct;
    if (existingUserProduct) {
      userProduct = await prisma.userProduct.update({
        where: { userId_productId: { userId: user.id, productId: product.id } },
        data: { status: prismaStatus },
        include: { product: true },
      });
    } else {
      userProduct = await prisma.userProduct.create({
        data: { userId: user.id, productId: product.id, status: prismaStatus },
        include: { product: true },
      });
    }

    const transformedUserProduct = {
      ...userProduct,
      status: toBackendStatus(userProduct.status),
    };

    return NextResponse.json(transformedUserProduct, { status: 201 });
  } catch (error) {
    console.error("POST /api/user-products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status || !(status in statusMap)) {
      return NextResponse.json(
        {
          error: `Missing or invalid fields. Status must be one of: ${Object.keys(
            statusMap
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const prismaStatus = statusMap[status];

    const userProduct = await prisma.userProduct.update({
      where: { id },
      data: { status: prismaStatus },
      include: { product: true },
    });

    const transformedUserProduct = {
      ...userProduct,
      status: toBackendStatus(userProduct.status),
    };

    return NextResponse.json(transformedUserProduct);
  } catch (error) {
    console.error("PATCH /api/user-products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

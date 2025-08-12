import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function currentMonthFirstDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function currentMonthLastDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userProducts = await prisma.userProduct.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: { id: true, name: true },
        },
      },
    });

    const entries = await prisma.entry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: currentMonthFirstDate(),
          lte: currentMonthLastDate(),
        },
      },
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { date: "asc" },
    });

    const habitTrackers = userProducts.map(({ product }) => {
      const usageDates = entries
        .filter(entry =>
          entry.products.some(ep => ep.productId === product.id)
        )
        .map(entry => ({
          date: entry.date.toISOString(), // format date explicitly
          entryId: entry.id,
          details: entry.products
            .filter(ep => ep.productId === product.id)
            .map(ep => ({
              area: ep.area,
              timeOfDay: ep.timeOfDay,
            })),
        }));

      return {
        product: {
          id: product.id,
          name: product.name,
        },
        usageDates,
        totalUsages: usageDates.length,
      };
    });

    return NextResponse.json(habitTrackers);
  } catch (error) {
    console.error("Error fetching habit trackers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

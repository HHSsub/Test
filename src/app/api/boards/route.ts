import { NextResponse } from "next/server";
import { getBoards } from "@/lib/boards";

export async function GET() {
  try {
    const data = await getBoards();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}

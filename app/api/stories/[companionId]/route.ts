import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { companionId: string } }
) {
  try {
    const result = await pool.query(
      `SELECT id, companion_id as "companionId", media_type as "type", media_url as "mediaUrl",
              caption, viewed, order_index as "orderIndex", expires_at as "expiresAt",
              created_at as "createdAt"
       FROM stories
       WHERE companion_id = $1 AND expires_at > NOW()
       ORDER BY order_index ASC`,
      [params.companionId]
    );

    return NextResponse.json({ data: result.rows }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

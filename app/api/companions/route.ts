import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  const page = parseInt(searchParams.get("page") || "1");
  const offset = (page - 1) * pageSize;

  try {
    let query = `
      SELECT id, name, category, bio, avatar_url as avatar, personality_json as personality,
             tags, age, status
      FROM companions
    `;
    const params: (string | number)[] = [];

    if (category && category !== "all") {
      query += " WHERE category = $1";
      params.push(category);
    }

    query += " ORDER BY name";
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM companions";
    const countParams: string[] = [];
    if (category && category !== "all") {
      countQuery += " WHERE category = $1";
      countParams.push(category);
    }
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      data: result.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch companions" },
      { status: 500 }
    );
  }
}

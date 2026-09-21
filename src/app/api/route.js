import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const query = body.query || body.QUERY || "";
    const apiUrl = process.env.ADIRA_API_URL || process.env.NEXT_PUBLIC_ADIRA_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    return NextResponse.json({ ...data, RESULT: data.message });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to reach Adira backend" }, { status: 500 });
  }
}

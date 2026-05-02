import { NextResponse } from "next/server";
import { withAPILogging } from "@/utils/logger";

async function getNotificationsHandler(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  let authToken = bearerMatch ? bearerMatch[1] : null;

  if (!authToken) {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookieMatch = cookieHeader.match(/auth_token=([^;]+)/);
    authToken = cookieMatch ? cookieMatch[1] : null;
  }

  if (!authToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const qStr = searchParams.toString();
  const fetchUrl = `http://20.207.122.201/evaluation-service/notifications${qStr ? `?${qStr}` : ""}`;

  const evalResponse = await fetch(fetchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!evalResponse.ok) {
    let errorMsg = `Failed to fetch from evaluation service (${evalResponse.status})`;
    try {
      const errorData = await evalResponse.json();
      errorMsg = errorData?.message || errorMsg;
    } catch (e) {}

    return NextResponse.json(
      { error: errorMsg },
      { status: evalResponse.status },
    );
  }

  const data = await evalResponse.json();
  return NextResponse.json(data);
}

export const GET = withAPILogging(getNotificationsHandler);

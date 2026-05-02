import { NextResponse } from "next/server";
import { withAPILogging } from "@/utils/logger";

async function authHandler(request: Request) {
  const body = await request.json();
  const { email, rollNo } = body;

  const authPayload = {
    email,
    name: "Nikhil Bhosale",
    rollNo,
    accessCode: "QkbpxH",
    clientID: "d122f414-6e79-4360-854c-ecf15e5ce333",
    clientSecret: "gfyubPGqddeyXjPB",
  };

  const evalResponse = await fetch(
    "http://20.207.122.201/evaluation-service/auth",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(authPayload),
    },
  );

  if (!evalResponse.ok) {
    let errorMsg = `Eval auth failed with status ${evalResponse.status}`;
    try {
      const errorData = await evalResponse.json();
      if (errorData?.message) {
        errorMsg = errorData.message;
      }
    } catch (e) {}

    return NextResponse.json(
      { error: errorMsg },
      { status: evalResponse.status },
    );
  }

  const evalData = await evalResponse.json();
  const access_token = evalData.access_token;

  const response = NextResponse.json({ success: true });
  response.cookies.set("auth_token", access_token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: evalData.expires_in || 3600,
  });

  return response;
}

export const POST = withAPILogging(authHandler);

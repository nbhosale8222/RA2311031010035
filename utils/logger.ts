import { NextResponse } from "next/server";

export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";
export type Package =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style"
  | "auth"
  | "config"
  | "middleware"
  | "utils";

let cachedToken: string | null = null;

async function getAuthToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken;
  }

  const response = await fetch(
    "http://20.207.122.201/evaluation-service/auth",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "nb3816@srmist.edu.in",
        name: "Nikhil Bhosale",
        rollNo: "RA2311031010035",
        accessCode: "QkbpxH",
        clientID: "d122f414-6e79-4360-854c-ecf15e5ce333",
        clientSecret: "gfyubPGqddeyXjPB",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Auth failed with status ${response.status}`);
  }

  const data = await response.json();

  cachedToken = data.access_token;

  if (!cachedToken) {
    throw new Error(
      "Failed to extract token from response: " + JSON.stringify(data),
    );
  }

  return cachedToken;
}

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string,
) {
  try {
    const token = await getAuthToken();
    console.log(
      `[${stack.toUpperCase()}] [${level.toUpperCase()}] [${pkg}] ${message}`,
    );
    const response = await fetch(
      "http://20.207.122.201/evaluation-service/logs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stack,
          level,
          package: pkg,
          message,
        }),
      },
    );

    if (response.status === 401 || response.status === 403) {
      cachedToken = null;
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Logging failed [${response.status}]: ${errText}`);
    }
  } catch (error) {
    console.error("Error during logging:", error);
  }
}

export function withAPILogging(
  handler: (request: Request, context: any) => Promise<Response> | Response,
) {
  return async (request: Request, context: any) => {
    const { method, url } = request;
    const { pathname } = new URL(url);

    try {
      const response: Response = await handler(request, context);
      const level = response.ok ? "info" : "error";

      let errorSuffix = "";
      if (!response.ok) {
        try {
          // Clone the response so we don't consume the client's body stream
          const resClone = response.clone();
          const errData = await resClone.json();
          if (errData?.error) {
            errorSuffix = ` - ${errData.error}`;
          } else if (errData?.message) {
            errorSuffix = ` - ${errData.message}`;
          }
        } catch (e) {}
      }

      await Log(
        "frontend",
        level,
        "api",
        `${method} ${pathname} ${response.status}${errorSuffix}`,
      );

      return response;
    } catch (error: any) {
      await Log(
        "frontend",
        "error",
        "api",
        `${method} ${pathname} 500 - ${error.message || "Internal Server Error"}`,
      );
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}

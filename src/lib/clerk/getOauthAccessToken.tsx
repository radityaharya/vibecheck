/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest } from "next";

export interface OauthAccessToken {
  object: string;
  token: string;
  provider: string;
  public_metadata: Record<string, unknown>;
  label: string | null;
  scopes: string[];
}

export const getOauthAccessToken = async (
  req: NextApiRequest, provider: string
): Promise<OauthAccessToken | undefined> => {
  const user = getAuth(req);
  const userId = user.userId as string;

  const response = await fetch(
    `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/${provider}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY as string}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (Array.isArray(data) && data.length > 0) {
    const oauthToken = data[0] as OauthAccessToken;
    return oauthToken;
  }

  return undefined;
};
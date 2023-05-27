/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "src/lib/supabase/client";
import Page from "src/layouts/Page";
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
  NextPage,
} from "next";

import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { RegisterUser } from "~/lib/supabase/registerUser";
import { log } from "next-axiom";
import { PrismaClient } from "@prisma/client";
import { useState, useEffect } from "react";

const prisma = new PrismaClient();

type customPageType = NextPage & {
  showGradient?: boolean;
};

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext | { req: NextApiRequest; res: NextApiResponse }
) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx);
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  log.info(JSON.stringify(session));

  if (session) {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });
    if (user) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
    await RegisterUser(session).then(() => {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    });
  }

  return {
    props: {},
  };
};

const AuthPage: customPageType = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#register") {
      setIsRegistering(true);
    }
  }, []);

  return (
    <Page>
      <div className="flex h-full flex-col items-start gap-5 bg-[#09080f]/80 px-5">
        <div className="flex h-full w-full flex-col items-center justify-center overflow-auto">
          <div className="flex flex-col items-center justify-center rounded-lg p-10">
            {isRegistering ? (
              <div className="flex flex-col items-center justify-center rounded-lg">
                <h1 className="text-3xl font-bold text-white">
                  Registering...
                </h1>
              </div>
            ) : (
              <></>
            )}
            <Auth
              supabaseClient={supabase}
              theme="light"
              appearance={{
                theme: ThemeSupa,
                extend: true,
                className: {
                  container:
                    "flex flex-col items-center justify-center rounded-lg",
                  message: "text-white",
                },
                style: {
                  button: {
                    backgroundColor: "#fff",
                    color: "#000",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1rem",
                    fontSize: "1rem",
                    outline: "none",
                    border: "none",
                    fontWeight: "500",
                  },
                  container: {
                    width: "300px",
                  },
                  input: {
                    width: "300px",
                    backgroundColor: "#fff",
                    color: "#000",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1rem",
                    fontWeight: "500",
                  },
                  label: {
                    fontWeight: "500",
                    color: "#fff",
                  },
                },
              }}
              redirectTo="/api/user/register"
              providers={["spotify"]}
              providerScopes={{
                spotify:
                  "playlist-read-collaborative playlist-modify-private user-follow-modify user-library-modify user-read-private app-remote-control user-top-read user-read-recently-played user-read-email user-library-read user-follow-read user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-modify-public user-read-playback-position",
              }}
              magicLink={true}
              view="magic_link"
              showLinks={false}
            />
          </div>
        </div>
      </div>
    </Page>
  );
};

export default AuthPage;

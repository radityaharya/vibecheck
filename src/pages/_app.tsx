/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { Session } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import { useEffect, useRef, useState } from "react";
import { Gradient } from "~/components/gradients";

import "~/styles/globals.css";

const gradient = new Gradient();

interface CustomAppProps extends AppProps<CustomPageProps> {
  Component: CustomPageType;
}

interface CustomPageProps {
  initialSession: Session;
}

interface CustomPageType extends React.FC<CustomPageProps> {
  showGradient?: boolean;
}

function Vibecheck({ Component, pageProps }: CustomAppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  const showGradient = Component.showGradient ?? false;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && showGradient) {
      gradient.initGradient("#gradient-canvas");
    }

    return () => {
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
    };
  }, [showGradient]);

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component initialSession={pageProps.initialSession} />
      {showGradient && (
        <canvas
          ref={canvasRef}
          id="gradient-canvas"
          data-transition-in
          className="absolute left-0 top-0 z-[-1]"
        ></canvas>
      )}
    </SessionContextProvider>
  );
}

export default Vibecheck;

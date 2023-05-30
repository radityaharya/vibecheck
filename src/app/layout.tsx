export const dynamic = "auto";
export const dynamicParams = true;
export const revalidate = 60;
export const fetchCache = "auto";
export const runtime = "nodejs";
export const preferredRegion = "all";
import { Inter } from "next/font/google";

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import "~/app/styles/globals.css";
import { GradientBackground } from "~/components/GradientBackground";

export interface Props {
  children?: React.ReactNode;
  showGradient?: boolean;
}

export default function RootLayout({ children, showGradient = true }: Props) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {children}
        <GradientBackground showGradient={showGradient} />
      </body>
    </html>
  );
}

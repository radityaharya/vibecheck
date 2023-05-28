/* eslint-disable @typescript-eslint/no-unsafe-call */
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Page from "~/layouts/Page";
import PeopleUsing from "~/components/Home/peopleUsing";
import { ChevronRight } from "lucide-react";

import localFont from "next/font/local";
const chillax = localFont({
  src: "./Chillax-Variable.woff",
  variable: "--font-chillax",
});

type customPageType = NextPage & {
  showGradient?: boolean;
};

const Home: customPageType = () => {
  const people = [
    {
      image_src:
        "https://i.scdn.co/image/ab6775700000ee85bfdd3efe20104d4e538070f2",
      image_alt: "avatar",
    },
    {
      image_src:
        "https://i.scdn.co/image/ab6775700000ee85bfdd3efe20104d4e538070f2",
      image_alt: "avatar",
    },
    {
      image_src:
        "https://i.scdn.co/image/ab6775700000ee85bfdd3efe20104d4e538070f2",
      image_alt: "avatar",
    },
  ];

  return (
    <Page>
      <Head>
        <title>Vibecheck</title>
        <meta name="description" content="Vibecheck" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="items-left flex max-h-screen min-h-screen w-full flex-col overflow-auto">
        <div className="flex min-h-screen flex-col items-start justify-center py-2 pt-10 drop-shadow-md">
          <div className="flex flex-col items-start gap-5 px-5 md:gap-10 md:px-20">
            <div className="flex flex-col items-start gap-4">
              <PeopleUsing people={people} numberOfPeople={20} />
              <div className="flex flex-col items-start gap-5">
                <span className="w-350px text-left text-6xl text-gray-100">
                  <span className={`font-display font-normal`}>Get Your</span>
                  <br />
                  <span
                    className={`${chillax.className} font-display font-semibold`}
                  >
                    Vibe&nbsp;
                  </span>
                  <br className="md:hidden"></br>
                  <span className="font-normal">Checked</span>
                </span>
                <span className="max-w-[270px] text-left text-sm text-white">
                  <span>
                    Take charge of the music and keep the party going. The
                    ultimate music companion for any occasion!
                  </span>
                </span>
              </div>
            </div>
            <span className="flex flex-col items-center justify-center gap-4 md:flex-row">
              <Link
                className="flex items-center justify-center gap-5 rounded-2xl border-2 border-white bg-white px-4 py-3"
                href="/join"
              >
                <span className="font-medium text-black">Join a Session</span>
                <ChevronRight size={24} color="black" />
              </Link>
              <Link
                className="flex items-center justify-center gap-5 rounded-2xl border-2 border-white bg-transparent px-4 py-3"
                href="/host"
              >
                <span className="font-medium text-white">Host a Session</span>
                <ChevronRight size={24} color="white" />
              </Link>
            </span>
          </div>
        </div>
      </div>
    </Page>
  );
};

Home.showGradient = true;

export default Home;
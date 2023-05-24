/* eslint-disable @typescript-eslint/no-unsafe-call */
import { type NextPage } from "next";
import Head from "next/head";
import Page from "~/layouts/Page";
import JoinForm from "~/components/Join/JoinForm";

type customPageType = NextPage & {
  showGradient?: boolean;
};

const Join: customPageType = () => {
  return (
    <Page>
      <Head>
        <title>Vibecheck</title>
        <meta name="description" content="Vibecheck" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-full flex-col items-start gap-5 px-5 md:gap-10 md:px-20">
        <div className="flex h-full w-full flex-col items-center justify-center overflow-auto">
          <JoinForm />
        </div>
      </div>
    </Page>
  );
};

Join.showGradient = true;

export default Join;

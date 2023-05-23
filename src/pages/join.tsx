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
      <div className="items-left flex max-h-screen min-h-screen w-full flex-col overflow-auto">
        <JoinForm />
      </div>
    </Page>
  );
};

Join.showGradient = true;

export default Join;

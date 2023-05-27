import { faker } from "@faker-js/faker";
import { type NextPage } from "next";
import dynamic from "next/dynamic";
import { NowPlaying } from "~/components/Room/NowPlaying";
import Page from "~/layouts/Page";

const QueueTable = dynamic(
  () => import("~/components/Room/QueueTable").then((mod) => mod.QueueTable),
  { ssr: false }
);

import React, { useEffect, useState } from "react";

import type { DataProps } from "~/components/Room/QueueTable";

// TODO Remove random data generation

// eslint-disable-next-line @typescript-eslint/require-await
async function randomVoters() {
  const voters = Math.floor(Math.random() * 10) + 1;
  const votersArray = Array.from({ length: voters }, () => ({
    id: faker.string.uuid(),
    username: faker.person.firstName(),
    image: faker.image.urlLoremFlickr(),
  }));
  return votersArray;
}

// eslint-disable-next-line @typescript-eslint/require-await
async function randomData(): Promise<DataProps[]> {
  return [
    {
      queueId: faker.string.uuid(),
      image: faker.image.urlLoremFlickr(),
      trackTitle: faker.lorem.words(),
      artist: faker.person.firstName(),
      album: faker.lorem.words(),
      duration: `${Math.floor(Math.random() * 10)}:${Math.floor(
        Math.random() * 60
      )}`,
      votedBy: await randomVoters(),
    },
  ];
}

const Room: NextPage = () => {
  const [data, setData] = useState<DataProps[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      const oldData = data;
      console.log("fetching data");
      randomData()
        .then((newData: DataProps[]) => setData([...oldData, ...newData]))
        .catch((error: Error) => console.error(error));
    }, 500);
    return () => clearInterval(interval);
  });

  return (
    <Page>
      <div className="flex h-full max-h-screen flex-col items-start gap-5 overflow-hidden bg-[#09080f]/80 pt-[110px] md:gap-10">
        <div className="flex h-full w-full flex-row items-center justify-center">
          <div className="left-col flex h-full w-[40%] max-w-[450px] flex-col items-start gap-5 pl-20">
            <NowPlaying />
            <div>TODO:SEARCH</div>
          </div>
          <div className="right-col flex h-full w-full flex-col items-start rounded-tl-xl border-l-2 border-r  border-t-2 border-[#C9C5CA]/10 bg-[#09080f]/10 p-5 pr-20">
            <QueueTable data={data} />
          </div>
        </div>
      </div>
    </Page>
  );
};

export default Room;

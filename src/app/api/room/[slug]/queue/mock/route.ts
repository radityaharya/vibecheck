import { faker } from "@faker-js/faker";
import type { DataProps } from "~/components/Room/QueueTable";
import { NextResponse } from "next/server";

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

export async function GET() {
  const data = await randomData();
  return NextResponse.json(data);
}

"use client"

import { type NextPage } from "next";
import Page from "~/layouts/Page";
import Image from "next/image";

import { DataTable } from "src/components/Room/queueTable"
import dynamic from 'next/dynamic'


import { ColumnDef } from "@tanstack/react-table"
import { useEffect, useState } from "react";
import React from "react";
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}
 
export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
]

// eslint-disable-next-line @typescript-eslint/require-await
async function randomData(): Promise<Payment[]> {
  return [
    {
      id: `${Math.random().toString(36).slice(2)}`,
      amount: Math.random() * 100,
      status: "pending",
      email: ""
    }
  ]
}


type customPageType = NextPage & {
  showGradient?: boolean;
};


const Room: NextPage = () => {

  const [data, setData] = useState<Payment[]>([]) 
    // append data to data every 5 seconds
    useEffect(() => {
      const interval = setInterval(() => {
        const oldData = data
        console.log("fetching data")
        randomData().then((newData: Payment[]) => setData([...oldData, ...newData])).catch((error: Error) => console.error(error))
      }, 500)
      return () => clearInterval(interval)
    })
    

  return (
    <Page>
      <div className="flex h-full flex-col items-start gap-5 bg-[#09080fb6] px-5 pt-[110px] md:gap-10 md:px-20 overflow-hidden max-h-screen">
        <div className="flex h-full w-full flex-row items-center justify-center">
          <div className="left-col flex h-full w-[30%] max-w-[450px] flex-col items-start gap-5">
            <div className="now-playing flex flex-col items-start gap-5">
              {/* nowplaying */}
              <div className="now-playing-title flex flex-row items-center">
                <span className="text-lg font-bold text-white">
                  Now Playing
                </span>
              </div>
              <div className="now-playing flex flex-row items-start gap-2">
                <Image
                  src="https://i.scdn.co/image/ab6775700000ee85bfdd3efe20104d4e538070f2"
                  alt="lala"
                  height={80}
                  width={80}
                  className="rounded-lg"
                />
                <div className="track-info flex flex-col items-start gap-1">
                  <div className="track-title font-inter flex flex-col items-start gap-1 font-semibold text-white">
                    그곳에 닿아줘 There There
                  </div>
                  <div className="track-artist flex flex-col items-start gap-1 text-sm font-normal text-[rgba(255,255,255,0.5)]">
                    Crystal Tea
                  </div>
                </div>
              </div>
            </div>
            <div>
              SEARCH
            </div>
          </div>
          <div className="right-col flex h-full w-full flex-col items-start gap-5 flex-grow">
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </Page>
  );
}

export default dynamic(() => Promise.resolve(Room), {ssr: false})

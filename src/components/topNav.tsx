import React from "react";
import { Search } from "lucide-react";
import { Music } from "lucide-react";
import Image from "next/image";

const TopNav = () => {
  return (
    <header
      className={
        "absolute left-0 right-0 top-0 z-10 flex w-full flex-row items-center justify-between px-5 py-8 md:px-20 md:py-6"
      }
    >
      <div className="flex w-full flex-row items-center justify-between gap-10 md:max-w-[384px]">
        <Image
          className="drop-shadow-xl"
          src="https://iwhksjsfesopygewmtaw.supabase.co/storage/v1/object/public/public/vibecheck.svg"
          alt="vibecheck logo"
          width={134}
          height={20}
        />
        <button className="flex hidden items-center justify-center gap-10 rounded-xl bg-white bg-opacity-20 p-2 px-3">
          <span className="text-xs font-medium leading-4 text-white">
            <span>@titik.temu</span>
          </span>
        </button>
      </div>
      <nav className="hidden items-center justify-end md:flex">
        <div className="rounded-10 flex w-28 items-center justify-center p-2">
          <Search width={24} height={24} color="white" />
        </div>
        <div className="flex w-28 flex-shrink-0 items-center justify-center gap-14 p-2">
          <Music width={24} height={24} color="white" />
        </div>
        <div className="rounded-20 flex w-36 flex-shrink-0 items-center justify-center gap-10 overflow-hidden rounded-xl bg-white p-3">
          <span className="text-sm font-medium leading-5 text-black">
            <span>radityaharya</span>
          </span>
        </div>
      </nav>
    </header>
  );
};

export default TopNav;

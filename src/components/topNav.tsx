import Image from "next/image";
import Link from "next/link";
import { useUser } from "@supabase/auth-helpers-react";

const TopNav = () => {
  const user = useUser();
  const userName = user?.email?.split("@")[0];

  return (
    <header
      className={
        "absolute left-0 right-0 top-0 z-10 flex w-full flex-row items-center justify-between px-5 py-8 md:px-20 md:py-6"
      }
    >
      <div className="flex w-full flex-row items-center justify-between gap-10 md:max-w-[384px]">
        <Link href="/">
          <Image
            className="drop-shadow-xl"
            src="https://iwhksjsfesopygewmtaw.supabase.co/storage/v1/object/public/public/vibecheck.svg"
            alt="vibecheck logo"
            width={134}
            height={20}
          />
        </Link>
        <button className="hidden items-center justify-center gap-10 rounded-xl bg-white bg-opacity-20 p-2 px-3">
          <span className="text-xs font-medium leading-4 text-white">
            <span>@titik.temu</span>
          </span>
        </button>
      </div>
      <nav className="hidden items-center justify-end md:flex">
        {user ? (
          <Link href="/profile">
            <div className="rounded-20 flex w-36 flex-shrink-0 items-center justify-center gap-10 overflow-hidden rounded-xl bg-white p-3">
              <span className="text-sm font-medium leading-5 text-black">
                {userName}
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/auth">
            <div className="rounded-20 flex w-36 flex-shrink-0 items-center justify-center gap-10 overflow-hidden rounded-xl bg-white p-3">
              <span className="text-sm font-medium leading-5 text-black">
                Login
              </span>
            </div>
          </Link>
        )}
      </nav>
    </header>
  );
};

export default TopNav;

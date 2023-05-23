/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { useEffect, useRef, useMemo } from "react";
import TopNav from "~/components/topNav";

export interface Props {
  children?: React.ReactNode;
}

const Page: React.FC<Props> = (props) => {

  return (
    <div className="flex h-full w-full flex-col">
      <TopNav />
      <div className="relative min-h-screen overflow-x-hidden">
        {props.children}
      </div>
    </div>
  );
};

export default Page;

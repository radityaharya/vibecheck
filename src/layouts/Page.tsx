/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import TopNav from "~/components/topNav";
// import { useEffect, useRef, useState } from "react";
// import { GradientBackground } from "~/components/GradientBackground";

// import { Gradient } from "~/components/gradients";

export interface Props {
  children?: React.ReactNode;
  // showGradient?: boolean;
}

const Page: React.FC<Props> = (props) => {
  // const showGradient = props.showGradient ?? true;
  return (
    <div className="flex h-full w-full flex-col">
      <TopNav />
      <div className="dark h-screen overflow-x-hidden text-white">
        {props.children}
      </div>
      {/* <GradientBackground showGradient={showGradient} /> */}
    </div>
  );
};

export default Page;

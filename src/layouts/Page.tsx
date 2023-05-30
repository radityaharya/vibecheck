/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import TopNav from "~/components/topNav";

export interface Props {
  children?: React.ReactNode;
}

const Page: React.FC<Props> = (props) => {
  return (
    <div className="flex h-full w-full flex-col">
      <TopNav />
      <div className="dark overflow-x-hidden text-white">{props.children}</div>
    </div>
  );
};

export default Page;

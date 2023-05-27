import TopNav from "~/components/topNav";

export interface Props {
  children?: React.ReactNode;
}

const Page: React.FC<Props> = (props) => {
  return (
    <div className="flex h-full w-full flex-col">
      <TopNav />
      <div className="dark h-screen overflow-x-hidden text-white">
        {props.children}
      </div>
    </div>
  );
};

export default Page;

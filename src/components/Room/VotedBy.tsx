import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";

export interface UserProps {
  id: string;
  username: string;
  image: string;
}

export interface VotedByProps {
  users: UserProps[];
}

export const VotedBy = ({ users }: VotedByProps) => {
  // max 2 users to show
  const usersToShow = users.slice(0, 2);

  return (
    <div className="flex flex-row items-start gap-1">
      {usersToShow.map((user) => (
        <Avatar key={user.id} className="h-5 w-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AvatarImage src={user.image} alt={user.username} />
                <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </TooltipTrigger>
              <TooltipContent>{user.username}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Avatar>
      ))}
      {users.length > 2 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-600 text-[8px] font-semibold text-white">
                +{users.length - 2}
              </div>
            </TooltipTrigger>
            <TooltipContent>{users.length - 2} more</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

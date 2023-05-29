"use client";

import { Search as LucideSearch } from "lucide-react";
interface searchResultsProps {
  trackId: string;
  image: string;
  trackTitle: string;
  artist: string;
}

interface searchProps {
  search: string;
  searchResults: searchResultsProps[];
}

export const Search: React.FC = () => {
  return (
    <div className="search flex w-full flex-col items-start pr-20">
      <div className="search-input flex w-full flex-row items-center">
        <input
          placeholder="Search"
          className="h-10 w-full border-white/20 bg-transparent py-3 text-white outline-none focus:border-b"
        />
        <LucideSearch className="text-white/50" />
      </div>
    </div>
  );
};

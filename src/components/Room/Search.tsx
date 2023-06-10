"use client";

import { Search as LucideSearch } from "lucide-react";
import { SearchResults } from "./SearchResults";
interface searchResultsProps {
  trackId: string;
  image: string;
  trackTitle: string;
  artist: string;
}
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface searchProps {
  search: string;
  searchResults: searchResultsProps[];
}

async function initSearchResults(
  roomId: string
): Promise<searchResultsProps[]> {
  const response = await fetch(`/api/room/${roomId}/search/recommendations`);
  const data = (await response.json()) as searchResultsProps[];
  return data;
}

export function Search() {
  const [searchResults, setSearchResults] = useState<searchResultsProps[]>([]);

  const { slug } = useParams();

  useEffect(() => {
    if (slug) {
      initSearchResults(slug)
        .then((data) => {
          setSearchResults(data);
          console.log(data);
        })
        .catch((error: Error) => console.error(error));
    }
  }, [slug]);

  return (
    <div className="search flex w-full flex-col items-start gap-1 md:pr-10">
      <div className="search-input flex w-full flex-row items-center">
        <input
          placeholder="Search"
          className="h-10 w-full border-white/20 bg-transparent py-3 text-white outline-none focus:border-b"
        />
        <LucideSearch className="text-white/50" />
      </div>
      <div className="search-results mt-4 flex w-full flex-col gap-2">
        <SearchResults searchResults={searchResults} />
      </div>
    </div>
  );
}

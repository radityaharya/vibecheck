import { Search as LucideSearch } from "lucide-react";
import { SearchResults } from "./SearchResults";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

interface SearchResult {
  trackId: string;
  image: string;
  trackTitle: string;
  artist: string;
}

async function fetchSearchResults(
  slug: string,
  search: string
): Promise<SearchResult[]> {
  const response = await fetch(
    `/api/room/${slug}/search?q=${encodeURIComponent(search)}`
  );
  const data = (await response.json()) as SearchResult[];
  return data;
}

async function fetchRecommendations(slug: string): Promise<SearchResult[]> {
  const response = await fetch(`/api/room/${slug}/search/recommendations`);
  const data = (await response.json()) as SearchResult[];
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useMemo(() => {
    const debouncedCallback = (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    };
    return debouncedCallback as T;
  }, [callback, delay]);
}

export function Search() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { slug } = useParams() as { slug: string };
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (slug) {
      fetchRecommendations(slug)
        .then((data) => {
          setSearchResults(data);
        })
        .catch((error: Error) => console.error(error));
    }
  }, [slug]);

  const handleSearch = useDebouncedCallback(() => {
    const searchInput = searchInputRef.current;
    if (searchInput) {
      const search = searchInput.value.trim();
      if (search) {
        setIsSearching(true);
        fetchSearchResults(slug, search)
          .then((data) => {
            setSearchResults(data);
          })
          .catch((error: Error) => console.error(error))
          .finally(() => setIsSearching(false));
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }
  }, 300);

  const results = isSearching || searchResults.length > 0 ? searchResults : [];

  return (
    <div className="search flex w-full flex-col items-start gap-1 md:pr-10">
      <div className="search-input flex w-full flex-row items-center">
        <input
          placeholder="Search"
          className="h-10 w-full border-white/20 bg-transparent py-3 text-white outline-none focus:border-b"
          ref={searchInputRef}
          onChange={handleSearch}
        />
        <LucideSearch className="text-white/50" />
      </div>
      <div className="search-results mt-4 flex w-full flex-col gap-2">
        <SearchResults searchResults={results} />
      </div>
    </div>
  );
}

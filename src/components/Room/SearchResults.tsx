import {
  SearchResultItem,
  type SearchResultItemProps,
} from "./SearchResultItem";

export interface SearchResultsProps {
  searchResults: SearchResultItemProps[];
}

export const SearchResults = ({ searchResults }: SearchResultsProps) => {
  if (!Array.isArray(searchResults)) {
    return null; // or render an error message
  }

  return (
    <div className="search-results-container scrollbar flex  max-h-[calc(100vh-20rem)] w-full flex-col overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col gap-4">
        {searchResults.map(function ({
          image,
          trackTitle,
          artist,
          trackId,
        }: SearchResultItemProps) {
          return (
            <SearchResultItem
              key={trackId}
              image={image}
              trackTitle={trackTitle}
              artist={artist}
              trackId={trackId}
            />
          );
        })}
      </div>
    </div>
  );
};

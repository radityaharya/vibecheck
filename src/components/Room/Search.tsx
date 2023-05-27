

interface searchResultsProps {
  trackId: string;
  image: string;
  trackTitle: string;
  artist: string;
}

interface searchProps {
  search: string;
  searchResults: searchResultsProps[];
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setSearchResults: React.Dispatch< React.SetStateAction<searchResultsProps[]> >;
}


import React, { useState } from "react";

interface SearchFormProps {
  onSearch: (query: string) => void; // Delegate search logic to parent
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(searchQuery); // Pass the search query to the parent component
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex items-center space-x-4">
      <input
        type="text"
        name="search"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Search..."
        className="border border-gray-300 rounded px-4 py-2 w-full"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Search
      </button>
    </form>
  );
};

export default SearchForm;
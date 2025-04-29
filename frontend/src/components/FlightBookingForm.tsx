import React, { useState, useMemo } from "react";
import Select, { StylesConfig } from "react-select";
import Fuse from "fuse.js"; // Import Fuse.js

// Define type for airport options
type AirportOption = {
  value: string;
  label: string;
};

// Sample airport options (replace with actual data later)
const airportOptions: AirportOption[] = [
  { value: "JFK", label: "New York - JFK" },
  { value: "LAX", label: "Los Angeles - LAX" },
  { value: "LHR", label: "London - Heathrow" },
  { value: "CDG", label: "Paris - Charles de Gaulle" },
  { value: "HND", label: "Tokyo - Haneda" },
  { value: "DXB", label: "Dubai - International" },
];

// Configure Fuse.js with more effective fuzzy search settings
const fuseOptions = {
  keys: ["label", "value"], // Search by both label and code
  includeScore: true,
  threshold: 0.3, // Lower threshold for stricter matching (0 is exact match, 1 matches everything)
  findAllMatches: true,
  ignoreLocation: true, // Ignore where in the string the pattern appears
  location: 0,
  distance: 100,
  minMatchCharLength: 1,
  shouldSort: true,
  tokenize: true,
  matchAllTokens: false, // Allow partial token matches
};
const fuse = new Fuse(airportOptions, fuseOptions);

// Define custom styles for react-select
const customStyles: StylesConfig = {
  control: (provided) => ({
    ...provided,
    // Add any specific control styles if needed
  }),
  input: (provided) => ({
    ...provided,
    color: "black", // Ensure input text is black
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "black", // Ensure selected value text is black
  }),
  option: (provided, state) => ({
    ...provided,
    color: "black", // Ensure option text is black
    backgroundColor: state.isFocused ? "#eee" : "white", // Optional: style for focused option
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#aaa", // Make placeholder text a bit lighter
  }),
};

const FlightBookingForm: React.FC = () => {
  const [sourceAirport, setSourceAirport] = useState<AirportOption | null>(
    null
  );
  const [destinationAirport, setDestinationAirport] =
    useState<AirportOption | null>(null);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Separate input states for source and destination
  const [sourceInputValue, setSourceInputValue] = useState("");
  const [destInputValue, setDestInputValue] = useState("");

  // Filter source airport options
  const filteredSourceOptions = useMemo(() => {
    if (!sourceInputValue) {
      return airportOptions;
    }

    // Use Fuse.js for fuzzy search with scores
    const results = fuse.search(sourceInputValue);

    // If no results found with fuzzy search, return all options
    if (results.length === 0) {
      return airportOptions;
    }

    return results.map((result) => result.item);
  }, [sourceInputValue]);

  // Filter destination airport options
  const filteredDestOptions = useMemo(() => {
    if (!destInputValue) {
      return airportOptions;
    }

    // Use Fuse.js for fuzzy search with scores
    const results = fuse.search(destInputValue);

    // If no results found with fuzzy search, return all options
    if (results.length === 0) {
      return airportOptions;
    }

    return results.map((result) => result.item);
  }, [destInputValue]);

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "20px", margin: "20px 0" }}
    >
      <h2>Book a Flight</h2>
      <form>
        <div style={{ marginBottom: "10px" }}>
          <label
            htmlFor="sourceAirport"
            style={{ marginRight: "10px", display: "block" }}
          >
            Source Airport:
          </label>
          <Select<AirportOption>
            id="sourceAirport"
            options={filteredSourceOptions}
            value={sourceAirport}
            onChange={(option) => setSourceAirport(option)}
            onInputChange={setSourceInputValue}
            isClearable
            placeholder="Type to search..."
            styles={customStyles}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label
            htmlFor="destinationAirport"
            style={{ marginRight: "10px", display: "block" }}
          >
            Destination Airport:
          </label>
          <Select<AirportOption>
            id="destinationAirport"
            options={filteredDestOptions}
            value={destinationAirport}
            onChange={(option) => setDestinationAirport(option)}
            onInputChange={setDestInputValue}
            isClearable
            placeholder="Type to search..."
            styles={customStyles}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="departureDate" style={{ marginRight: "10px" }}>
            Departure Date:
          </label>
          <input
            type="date"
            id="departureDate"
            name="departureDate"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="returnDate" style={{ marginRight: "10px" }}>
            Return Date:
          </label>
          <input
            type="date"
            id="returnDate"
            name="returnDate"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>
        <button type="submit">Search Flights</button>
      </form>
    </div>
  );
};

export default FlightBookingForm;

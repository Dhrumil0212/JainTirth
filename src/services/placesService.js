import placesData from "../data/places_db.places.json";
export const getStates = () => {
  return Promise.resolve(
    placesData.states.reduce((acc, state) => {
      const existingState = acc.find((s) => s.name === state.name);
      if (existingState) {
        existingState.places = [...existingState.places, ...state.places];
        // console.log(existingState.places);
      } else {
        // console.log(state.places);
        acc.push({
          name: state.name,
          image: state.image,
          places: state.places,
        });
      }
      return acc;
    }, [])
  );
};

// Ensure getPlacesByState is also exported correctly
export const getPlacesByState = (stateName) => {
  // console.log("Fetching places for state:", stateName); // Add this log to verify state name

  // Find all states with the given state name (in case there are multiple entries)
  const states = placesData.states.filter((s) => s.name === stateName);
  // console.log("Found states:", states); // Log all matching states

  // Flatten the places from all states with the same name
  const allPlaces = states.reduce((acc, state) => {
    return [...acc, ...state.places];
  }, []);

  // console.log("Total places found:", allPlaces); // Log the combined places
  return Promise.resolve(allPlaces); // Return the combined list of places
};

export const getPlaceByName = (placeName) => {
  for (const state of placesData.states) {
    const place = state.places.find((p) => p.name === placeName);
    if (place) return Promise.resolve(place);
  }
  return Promise.reject(new Error("Place not found"));
};

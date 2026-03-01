import { useActor } from '../hooks/useActor';

export interface GoogleMapsPlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  types?: string[];
}

export interface GoogleMapsAutocompleteResponse {
  predictions: Array<{
    place_id: string;
    description: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
    types: string[];
  }>;
  status: string;
}

export interface GoogleMapsPlaceDetailsResponse {
  result: GoogleMapsPlace;
  status: string;
}

export function useGoogleMapsService() {
  const { actor } = useActor();

  const searchPlaces = async (query: string): Promise<GoogleMapsAutocompleteResponse> => {
    if (!actor || !query.trim()) {
      return { predictions: [], status: 'ZERO_RESULTS' };
    }

    try {
      const response = await actor.autocomplete(query);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error searching places:', error);
      return { predictions: [], status: 'ERROR' };
    }
  };

  const getPlaceDetails = async (placeId: string): Promise<GoogleMapsPlaceDetailsResponse> => {
    if (!actor || !placeId) {
      throw new Error('Invalid place ID or actor not available');
    }

    try {
      const response = await actor.getPlaceDetails(placeId);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error getting place details:', error);
      throw error;
    }
  };

  const textSearch = async (query: string): Promise<any> => {
    if (!actor || !query.trim()) {
      return { results: [], status: 'ZERO_RESULTS' };
    }

    try {
      const response = await actor.textSearch(query);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error in text search:', error);
      return { results: [], status: 'ERROR' };
    }
  };

  const findPlaceFromText = async (input: string): Promise<any> => {
    if (!actor || !input.trim()) {
      return { candidates: [], status: 'ZERO_RESULTS' };
    }

    try {
      const response = await actor.findPlaceFromText(input);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error finding place from text:', error);
      return { candidates: [], status: 'ERROR' };
    }
  };

  return {
    searchPlaces,
    getPlaceDetails,
    textSearch,
    findPlaceFromText,
  };
}

export function parseAddressComponents(addressComponents: GoogleMapsPlace['address_components']) {
  if (!addressComponents) return {};

  const components: { [key: string]: string } = {};

  addressComponents.forEach(component => {
    const types = component.types;
    
    if (types.includes('country')) {
      components.country = component.long_name;
    }
    if (types.includes('administrative_area_level_1')) {
      components.stateRegion = component.long_name;
    }
    if (types.includes('locality') || types.includes('administrative_area_level_2')) {
      components.city = component.long_name;
    }
    if (types.includes('sublocality') || types.includes('neighborhood')) {
      components.attraction = component.long_name;
    }
  });

  return components;
}

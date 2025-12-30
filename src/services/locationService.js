// src/services/locationService.js - Location & Geolocation Services

/**
 * Get user's current location using browser Geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Reverse geocode coordinates to get address details including pincode
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<{pincode: string, city: string, state: string, address: string}>}
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'FUDORO-WebApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await response.json();
    
    if (!data || !data.address) {
      throw new Error('Unable to determine address from location');
    }

    const address = data.address;
    
    return {
      pincode: address.postcode || '',
      city: address.city || address.town || address.village || '',
      state: address.state || '',
      district: address.state_district || '',
      country: address.country || 'India',
      fullAddress: data.display_name || '',
      coordinates: {
        latitude,
        longitude
      }
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

/**
 * Get pincode from coordinates (simplified version)
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>}
 */
export const getPincodeFromCoordinates = async (latitude, longitude) => {
  try {
    const locationData = await reverseGeocode(latitude, longitude);
    return locationData.pincode || '';
  } catch (error) {
    console.error('Error getting pincode:', error);
    return '';
  }
};

/**
 * Check if location services are available
 * @returns {boolean}
 */
export const isGeolocationAvailable = () => {
  return 'geolocation' in navigator;
};

/**
 * Request location permission (for better UX)
 * @returns {Promise<PermissionState>}
 */
export const checkLocationPermission = async () => {
  if (!navigator.permissions) {
    return 'prompt';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state; // 'granted', 'denied', or 'prompt'
  } catch (error) {
    return 'prompt';
  }
};

/**
 * Get user location with pincode (combined function)
 * @returns {Promise<{pincode: string, city: string, state: string, coordinates: object}>}
 */
export const detectLocationWithPincode = async () => {
  try {
    // Step 1: Get coordinates
    const position = await getCurrentPosition();
    
    // Step 2: Reverse geocode to get pincode
    const locationData = await reverseGeocode(
      position.latitude,
      position.longitude
    );
    
    return locationData;
  } catch (error) {
    console.error('Location detection failed:', error);
    throw error;
  }
};

/**
 * Validate Indian pincode format
 * @param {string} pincode 
 * @returns {boolean}
 */
export const isValidPincode = (pincode) => {
  if (!pincode) return false;
  // Indian pincodes are 6 digits, first digit cannot be 0
  return /^[1-9]\d{5}$/.test(pincode);
};

/**
 * Check delivery availability for a pincode
 * This is a placeholder - you can expand this with actual service area logic
 * @param {string} pincode 
 * @returns {Promise<{available: boolean, message: string, estimatedTime?: string}>}
 */
export const checkDeliveryAvailability = async (pincode) => {
  try {
    // Validate pincode format
    if (!isValidPincode(pincode)) {
      return {
        available: false,
        message: 'Invalid pincode format'
      };
    }

    // Hyderabad metro area only (500xxx)
    // Includes Secunderabad, Gachibowli, Hitech City, Madhapur, Banjara Hills, etc.
    if (pincode.startsWith('500')) {
      return {
        available: true,
        message: 'Great! We deliver to your area in Hyderabad metro.',
        estimatedTime: '60-90 minutes',
        serviceArea: 'Hyderabad Metro'
      };
    }

    // Outside service area
    return {
      available: false,
      message: 'Sorry, we currently deliver only in Hyderabad metro area. We\'re expanding to more locations soon!',
      serviceArea: 'Outside Service Area'
    };
  } catch (error) {
    console.error('Error checking delivery:', error);
    return {
      available: false,
      message: 'Unable to verify delivery availability. Please try again.'
    };
  }
};

/**
 * Format address for display
 * @param {object} locationData 
 * @returns {string}
 */
export const formatAddress = (locationData) => {
  const parts = [
    locationData.city,
    locationData.district,
    locationData.state,
    locationData.pincode
  ].filter(Boolean);
  
  return parts.join(', ');
};

const locationService = {
  getCurrentPosition,
  reverseGeocode,
  getPincodeFromCoordinates,
  isGeolocationAvailable,
  checkLocationPermission,
  detectLocationWithPincode,
  isValidPincode,
  checkDeliveryAvailability,
  formatAddress
};

export default locationService;

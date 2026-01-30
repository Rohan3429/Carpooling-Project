export const MAPBOX_ACCESS_TOKEN =
    'pk.eyJ1IjoiaWFtamFpbWluZGFtb3IiLCJhIjoiY200NnB1M3R1MTRmZjJxb2JrYmkweDV6ayJ9.5IkuF_yDP5fPgoVYEJGIFA';

// Mapbox raster tiles for use with react-native-maps UrlTile
export const MAPBOX_TILE_SIZE = 256;
export const MAPBOX_TILE_URL = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/${MAPBOX_TILE_SIZE}/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`;
export const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
export const MAPBOX_DIRECTIONS_URL = 'https://api.mapbox.com/directions/v5/mapbox/driving';

// Default map center: Gandhinagar, Gujarat, India
export const DEFAULT_MAP_CENTER = {
    latitude: 23.2156,
    longitude: 72.6369,
};


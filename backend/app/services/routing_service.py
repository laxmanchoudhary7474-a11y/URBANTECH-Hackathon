import logging
import requests
from typing import Dict, Any, Tuple, List

logger = logging.getLogger(__name__)

class RoutingUnavailableError(Exception):
    """Raised when the routing provider is unavailable or fails."""
    pass

class OSRMRoutingProvider:
    """External routing provider using Open Source Routing Machine (OSRM)."""
    
    def __init__(self):
        self.base_url = "http://router.project-osrm.org"
        self._route_cache: Dict[str, Dict[str, Any]] = {}
        self._matrix_cache: Dict[str, Dict[str, Any]] = {}
        
    def _generate_cache_key(self, origin: Tuple[float, float], destination: Tuple[float, float]) -> str:
        return f"{origin[0]:.5f},{origin[1]:.5f}|{destination[0]:.5f},{destination[1]:.5f}"

    def get_route(self, origin: Tuple[float, float], destination: Tuple[float, float]) -> Dict[str, Any]:
        """
        Fetches route from OSRM. Note OSRM takes coordinates as longitude,latitude.
        origin / destination tuples are (lat, lon).
        """
        cache_key = self._generate_cache_key(origin, destination)
        if cache_key in self._route_cache:
            return self._route_cache[cache_key]

        lat1, lon1 = origin
        lat2, lon2 = destination
        
        # OSRM format: /route/v1/driving/lon1,lat1;lon2,lat2
        url = f"{self.base_url}/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false"
        
        try:
            logger.info(f"Making real OSRM request for route")
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            if data.get("code") != "Ok" or not data.get("routes"):
                logger.error(f"OSRM returned non-Ok code or no routes: {data.get('code')}")
                raise RoutingUnavailableError("Routing engine returned an error or no routes.")
                
            route = data["routes"][0]
            dist_meters = route.get("distance", 0)
            duration_seconds = route.get("duration", 0)
            
            dist_km = dist_meters / 1000.0
            dur_mins = duration_seconds / 60.0
            
            result = {
                "distance_km": dist_km,
                "duration_minutes": dur_mins,
                "route_summary": "OSRM Optimized Route",
                "provider": "OSRM"
            }
            logger.info(f"Provider: OSRM, Distance: {dist_km:.2f} km, Duration: {dur_mins:.2f} min")
            self._route_cache[cache_key] = result
            return result
        except requests.exceptions.Timeout:
            logger.error("OSRM request timed out.")
            raise RoutingUnavailableError("OSRM provider timeout")
        except requests.exceptions.RequestException as e:
            logger.error(f"OSRM request failed: {type(e).__name__}")
            raise RoutingUnavailableError(f"Routing provider unavailable: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error parsing OSRM response: {type(e).__name__}")
            raise RoutingUnavailableError(f"Routing data error: {str(e)}")

    def get_route_matrix(self, coordinates: List[Tuple[float, float]]) -> Dict[str, Any]:
        """
        Fetches a distance and duration matrix for a list of coordinates.
        Coordinates are (lat, lon) pairs.
        Returns a dict with 'distances' and 'durations' matrices.
        """
        # Create a cache key from all coordinates
        coords_str = ";".join([f"{lat:.4f},{lon:.4f}" for lat, lon in coordinates])
        import hashlib
        cache_key = hashlib.md5(coords_str.encode()).hexdigest()
        
        if cache_key in self._matrix_cache:
            return self._matrix_cache[cache_key]

        # OSRM takes lon,lat
        osrm_coords = ";".join([f"{lon},{lat}" for lat, lon in coordinates])
        url = f"{self.base_url}/table/v1/driving/{osrm_coords}?annotations=distance,duration"
        
        try:
            logger.info(f"Making real OSRM request for matrix ({len(coordinates)} points)")
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get("code") != "Ok":
                logger.error(f"OSRM returned non-Ok code for matrix: {data.get('code')}")
                raise RoutingUnavailableError("OSRM Matrix engine returned an error.")
                
            # Convert distances from meters to km, durations from seconds to minutes
            distances = [[val / 1000.0 if val is not None else float('inf') for val in row] for row in data.get("distances", [])]
            durations = [[val / 60.0 if val is not None else float('inf') for val in row] for row in data.get("durations", [])]
            
            result = {
                "distances_km": distances,
                "durations_min": durations,
                "provider": "OSRM"
            }
            logger.info("OSRM Matrix successfully computed.")
            self._matrix_cache[cache_key] = result
            return result
            
        except requests.exceptions.Timeout:
            logger.error("OSRM matrix request timed out.")
            raise RoutingUnavailableError("OSRM provider timeout")
        except requests.exceptions.RequestException as e:
            logger.error(f"OSRM matrix request failed: {type(e).__name__}")
            raise RoutingUnavailableError(f"Routing provider unavailable: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error parsing OSRM matrix response: {type(e).__name__}")
            raise RoutingUnavailableError(f"Routing data error: {str(e)}")


class RoutingService:
    def __init__(self):
        # Strictly enforce OSRM. No local fallback.
        self.provider = OSRMRoutingProvider()
        
    def get_route(self, origin: Tuple[float, float], destination: Tuple[float, float]) -> Dict[str, Any]:
        return self.provider.get_route(origin, destination)

    def get_distance(self, origin: Tuple[float, float], destination: Tuple[float, float]) -> float:
        route = self.get_route(origin, destination)
        return route["distance_km"]
        
    def get_route_matrix(self, coordinates: List[Tuple[float, float]]) -> Dict[str, Any]:
        return self.provider.get_route_matrix(coordinates)

routing_service = RoutingService()

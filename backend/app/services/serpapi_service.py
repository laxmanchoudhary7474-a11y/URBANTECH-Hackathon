import requests
import logging
from typing import Dict, Any, Optional

from app.config import settings

logger = logging.getLogger(__name__)

class SerpApiService:
    def __init__(self):
        self.api_key = settings.SERPAPI_API_KEY
        self.base_url = "https://serpapi.com/search"
        self._cache: Dict[str, Any] = {}
        
    def _generate_cache_key(self, origin: tuple[float, float], destination: tuple[float, float]) -> str:
        return f"{origin[0]},{origin[1]}|{destination[0]},{destination[1]}"

    def get_directions(self, origin: tuple[float, float], destination: tuple[float, float]) -> Optional[Dict[str, Any]]:
        """
        Securely calls SerpApi to get directions between two coordinates.
        Uses in-memory caching to reduce API calls.
        """
        if not self.api_key:
            # Should not be called if key is missing (routing_service will handle fallback),
            # but safeguard just in case.
            logger.warning("SerpApi key not configured. Using local fallback routing provider.")
            return None

        cache_key = self._generate_cache_key(origin, destination)
        if cache_key in self._cache:
            logger.info("SerpApi cache hit for %s", cache_key)
            return self._cache[cache_key]
            
        logger.info("SerpApi cache miss. Requesting route for %s", cache_key)
        
        params = {
            "engine": "google_maps_directions",
            "api_key": self.api_key,
            "start_addr": f"{origin[0]},{origin[1]}",
            "end_addr": f"{destination[0]},{destination[1]}"
        }
        
        try:
            # We never log the full URL to avoid leaking the API key
            logger.info(f"Making request to SerpApi google_maps_directions provider")
            response = requests.get(self.base_url, params=params, timeout=10)
            
            if response.status_code == 401 or response.status_code == 403:
                logger.error(f"SerpApi Authentication Error ({response.status_code}). Check API key.")
                return None
            elif response.status_code == 429:
                logger.error("SerpApi Rate Limit Exceeded (429).")
                return None
            
            response.raise_for_status()
            data = response.json()
            
            if "error" in data:
                logger.error("SerpApi returned an error: %s", data["error"])
                return None
                
            # Store in cache
            self._cache[cache_key] = data
            return data
            
        except requests.exceptions.Timeout:
            logger.error("SerpApi request timed out.")
            return None
        except requests.exceptions.RequestException as e:
            logger.error("SerpApi network request failed: %s", type(e).__name__)
            return None
        except Exception as e:
            logger.error("Unexpected error during SerpApi call: %s", type(e).__name__)
            return None
            
serpapi_service = SerpApiService()

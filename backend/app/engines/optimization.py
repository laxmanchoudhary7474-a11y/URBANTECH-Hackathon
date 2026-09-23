import networkx as nx
from typing import List, Dict, Tuple
from app.models.domain import Bin, Vehicle, Depot, RouteSchema, RouteStopSchema, PredictionSchema, SystemSettings
import math

from app.services.routing_service import routing_service

def calculate_distance(lat1, lon1, lat2, lon2):
    return routing_service.get_distance((lat1, lon1), (lat2, lon2))

def generate_routes(
    bins: List[Bin], 
    vehicles: List[Vehicle], 
    depots: List[Depot], 
    predictions: Dict[str, PredictionSchema],
    settings: SystemSettings
) -> List[RouteSchema]:
    
    # Filter high-priority bins that need collection
    eligible_bins = [b for b in bins if predictions[b.id].priority_score >= 50 or b.current_fill_percent >= 70]
    
    # Sort bins by priority
    eligible_bins.sort(key=lambda b: predictions[b.id].priority_score, reverse=True)
    
    available_vehicles = [v for v in vehicles if v.status == "Available"]
    
    if not available_vehicles or not eligible_bins:
        return []

    # Gather all unique coordinates for the matrix request
    coords = []
    coord_to_idx = {}
    
    def add_coord(lat, lon):
        coord = (lat, lon)
        if coord not in coord_to_idx:
            coord_to_idx[coord] = len(coords)
            coords.append(coord)
            
    for v in available_vehicles:
        add_coord(v.latitude, v.longitude)
    for d in depots:
        add_coord(d.latitude, d.longitude)
    for b in eligible_bins:
        add_coord(b.latitude, b.longitude)
        
    matrix_data = routing_service.get_route_matrix(coords)
    distances_matrix = matrix_data["distances_km"]
    
    def get_matrix_dist(lat1, lon1, lat2, lon2):
        i1 = coord_to_idx[(lat1, lon1)]
        i2 = coord_to_idx[(lat2, lon2)]
        dist = distances_matrix[i1][i2]
        return dist if dist != float('inf') else 9999.0

    routes = []
    unassigned_bins = eligible_bins.copy()
    
    for vehicle in available_vehicles:
        if not unassigned_bins:
            break
            
        current_load = 0.0
        route_stops = []
        current_lat, current_lon = vehicle.latitude, vehicle.longitude
        total_distance = 0.0
        
        assigned_to_this_vehicle = []
        
        # Greedy assignment based on priority and distance
        while unassigned_bins and current_load < vehicle.capacity_kg * 0.9:
            # Find best next bin (heuristic: priority * (1/distance))
            best_bin = None
            best_score = -1
            best_dist = 0
            
            for b in unassigned_bins:
                if current_load + b.current_weight_kg > vehicle.capacity_kg:
                    continue
                    
                dist = get_matrix_dist(current_lat, current_lon, b.latitude, b.longitude)
                # Avoid division by zero
                dist = max(dist, 0.001)
                
                # Apply traffic multiplier
                effective_dist = dist * settings.traffic_multiplier
                
                score = predictions[b.id].priority_score / effective_dist
                
                if score > best_score:
                    best_score = score
                    best_bin = b
                    best_dist = effective_dist
                    
            if best_bin:
                route_stops.append(
                    RouteStopSchema(
                        bin_id=best_bin.id,
                        latitude=best_bin.latitude,
                        longitude=best_bin.longitude,
                        expected_collection_kg=best_bin.current_weight_kg
                    )
                )
                current_load += best_bin.current_weight_kg
                total_distance += best_dist
                current_lat, current_lon = best_bin.latitude, best_bin.longitude
                assigned_to_this_vehicle.append(best_bin)
                unassigned_bins.remove(best_bin)
            else:
                break # No more bins fit in this vehicle
                
        # Return to depot
        if route_stops:
            depot = next((d for d in depots if d.id == vehicle.depot_id), depots[0])
            total_distance += get_matrix_dist(current_lat, current_lon, depot.latitude, depot.longitude) * settings.traffic_multiplier
            
            fuel = total_distance / vehicle.fuel_efficiency
            co2 = fuel * settings.co2_factor
            
            routes.append(
                RouteSchema(
                    vehicle_id=vehicle.id,
                    stops=route_stops,
                    total_distance_km=total_distance,
                    expected_total_load_kg=current_load,
                    estimated_fuel_l=fuel,
                    estimated_co2_kg=co2,
                    explanation=f"Truck {vehicle.id} assigned to high-priority cluster. Servicing {len(route_stops)} bins with capacity utilization of {(current_load/vehicle.capacity_kg)*100:.1f}%. Traffic multiplier applied."
                )
            )
            
    return routes

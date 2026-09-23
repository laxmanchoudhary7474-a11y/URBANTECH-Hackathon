from typing import List, Dict
from app.models.domain import Bin, Vehicle, RouteSchema, ImpactMetricsSchema, SystemSettings
from app.engines.optimization import calculate_distance

def calculate_impact(
    routes: List[RouteSchema], 
    all_bins: List[Bin], 
    vehicles: List[Vehicle],
    settings: SystemSettings
) -> ImpactMetricsSchema:
    
    # Calculate baseline (Fixed Schedule scenario: visit all bins, naive routing)
    # Heuristic: Visiting all bins takes approx 3x the distance of an average optimized route 
    # that only visits high priority bins.
    
    optimized_distance = sum(r.total_distance_km for r in routes)
    optimized_fuel = sum(r.estimated_fuel_l for r in routes)
    optimized_co2 = sum(r.estimated_co2_kg for r in routes)
    optimized_cost = optimized_fuel * settings.fuel_cost_per_liter
    
    # Baseline estimation
    baseline_trips = len(all_bins) // 20 + 1 # fixed trucks
    # Assume naive distance is visiting all bins + depot return
    baseline_distance = len(all_bins) * 1.2 # average 1.2km between all bins sequentially
    
    # Calculate average fleet efficiency
    avg_efficiency = sum(v.fuel_efficiency for v in vehicles) / len(vehicles) if vehicles else 3.0
    
    baseline_fuel = baseline_distance / avg_efficiency
    baseline_co2 = baseline_fuel * settings.co2_factor
    baseline_cost = baseline_fuel * settings.fuel_cost_per_liter
    
    return ImpactMetricsSchema(
        baseline_distance_km=baseline_distance,
        baseline_fuel_l=baseline_fuel,
        baseline_co2_kg=baseline_co2,
        baseline_cost=baseline_cost,
        
        optimized_distance_km=optimized_distance,
        optimized_fuel_l=optimized_fuel,
        optimized_co2_kg=optimized_co2,
        optimized_cost=optimized_cost,
        
        distance_saved_km=max(0, baseline_distance - optimized_distance),
        co2_saved_kg=max(0, baseline_co2 - optimized_co2),
        cost_saved=max(0, baseline_cost - optimized_cost),
        trips_reduced=max(0, baseline_trips - len(routes))
    )

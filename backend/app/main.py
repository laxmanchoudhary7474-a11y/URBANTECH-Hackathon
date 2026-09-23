from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict
from pydantic import BaseModel

from app.database import engine, get_db, init_db, reset_db
from app.models.domain import (
    Base, Zone, Bin, Vehicle, Depot, SystemSettings,
    ZoneSchema, BinSchema, VehicleSchema, DepotSchema,
    PredictionSchema, RouteSchema, ImpactMetricsSchema,
    DashboardKpiSchema, SystemSettingsSchema, AlertSchema
)
from app.data.seed import seed_data
from app.engines.prediction import run_prediction
from app.engines.optimization import generate_routes
from app.engines.impact import calculate_impact
from app.engines.simulation import apply_scenario, run_simulation_tick, generate_sensor_update
from app.services.routing_service import RoutingUnavailableError

import os
from datetime import datetime

app = FastAPI(title="WasteWiseAI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def do_seed_data():
    db = next(get_db())
    seed_data(db)

@app.on_event("startup")
def on_startup():
    init_db()
    do_seed_data()

# --- GET ENDPOINTS ---

@app.get("/api/dashboard", response_model=DashboardKpiSchema)
def get_dashboard(db: Session = Depends(get_db)):
    bins = db.query(Bin).all()
    vehicles = db.query(Vehicle).all()
    settings = db.query(SystemSettings).first()
    
    predictions = run_prediction(bins, settings)
    
    critical_bins = sum(1 for p in predictions.values() if p.risk_level == "CRITICAL")
    predicted_overflows = sum(1 for p in predictions.values() if p.overflow_probability > 0.8)
    
    forecasted_waste = sum(p.predicted_fill / 100.0 * b.capacity_kg for b, p in zip(bins, predictions.values()))
    
    active_v = sum(1 for v in vehicles if v.status != "Maintenance")
    
    try:
        depots = db.query(Depot).all()
        routes = generate_routes(bins, vehicles, depots, predictions, settings)
        impact = calculate_impact(routes, bins, vehicles, settings)
        
        return DashboardKpiSchema(
            total_bins=len(bins),
            critical_bins=critical_bins,
            predicted_overflows=predicted_overflows,
            active_vehicles=active_v,
            forecasted_waste_kg=forecasted_waste,
            estimated_co2_saved_kg=impact.co2_saved_kg,
            estimated_cost_saved=impact.cost_saved,
            estimated_fuel_saved_l=impact.baseline_fuel_l - impact.optimized_fuel_l
        )
    except RoutingUnavailableError:
        return DashboardKpiSchema(
            total_bins=len(bins),
            critical_bins=critical_bins,
            predicted_overflows=predicted_overflows,
            active_vehicles=active_v,
            forecasted_waste_kg=forecasted_waste,
            estimated_co2_saved_kg=None,
            estimated_cost_saved=None,
            estimated_fuel_saved_l=None
        )

@app.get("/api/zones", response_model=List[ZoneSchema])
def get_zones(db: Session = Depends(get_db)):
    return db.query(Zone).all()

@app.get("/api/bins", response_model=List[BinSchema])
def get_bins(db: Session = Depends(get_db)):
    return db.query(Bin).all()

@app.get("/api/bins/{bin_id}", response_model=BinSchema)
def get_bin(bin_id: str, db: Session = Depends(get_db)):
    bin_entity = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin_entity:
        raise HTTPException(status_code=404, detail="Bin not found")
    return bin_entity

@app.get("/api/vehicles", response_model=List[VehicleSchema])
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).all()

@app.get("/api/depots", response_model=List[DepotSchema])
def get_depots(db: Session = Depends(get_db)):
    return db.query(Depot).all()

@app.get("/api/settings", response_model=SystemSettingsSchema)
def get_settings(db: Session = Depends(get_db)):
    return db.query(SystemSettings).first()

@app.get("/api/predictions", response_model=Dict[str, PredictionSchema])
def get_predictions(db: Session = Depends(get_db)):
    bins = db.query(Bin).all()
    settings = db.query(SystemSettings).first()
    return run_prediction(bins, settings)

@app.get("/api/optimization/run", response_model=List[RouteSchema])
def run_optimization(db: Session = Depends(get_db)):
    bins = db.query(Bin).all()
    vehicles = db.query(Vehicle).all()
    depots = db.query(Depot).all()
    settings = db.query(SystemSettings).first()
    predictions = run_prediction(bins, settings)
    try:
        routes = generate_routes(bins, vehicles, depots, predictions, settings)
        return routes
    except RoutingUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))

@app.get("/api/impact", response_model=ImpactMetricsSchema)
def get_impact(db: Session = Depends(get_db)):
    bins = db.query(Bin).all()
    vehicles = db.query(Vehicle).all()
    depots = db.query(Depot).all()
    settings = db.query(SystemSettings).first()
    predictions = run_prediction(bins, settings)
    try:
        routes = generate_routes(bins, vehicles, depots, predictions, settings)
        return calculate_impact(routes, bins, vehicles, settings)
    except RoutingUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))

@app.get("/api/alerts", response_model=List[AlertSchema])
def get_alerts(db: Session = Depends(get_db)):
    bins = db.query(Bin).all()
    settings = db.query(SystemSettings).first()
    predictions = run_prediction(bins, settings)
    
    alerts = []
    
    # Check for critical bins
    critical_bins = [b for b in bins if predictions[b.id].risk_level == "CRITICAL"]
    if critical_bins:
        for cb in critical_bins[:5]: # Max 5 alerts for UI brevity
            eta = predictions[cb.id].overflow_eta_hours
            alerts.append(AlertSchema(
                id=f"alert-bin-{cb.id}",
                type="CRITICAL",
                message=f"Bin {cb.id} predicted to overflow in {eta:.1f} hours.",
                timestamp=datetime.utcnow()
            ))
            
    # Check fleet
    vehicles = db.query(Vehicle).all()
    available_v = sum(1 for v in vehicles if v.status == "Available")
    if available_v < len(critical_bins) / 5:
        alerts.append(AlertSchema(
            id="alert-fleet-01",
            type="FLEET",
            message=f"Only {available_v} vehicles available for {len(critical_bins)} high-priority bins.",
            timestamp=datetime.utcnow()
        ))
        
    if settings.scenario_mode != "NORMAL":
        alerts.append(AlertSchema(
            id=f"alert-scenario-{settings.scenario_mode}",
            type="SCENARIO",
            message=f"{settings.scenario_mode} mode active. Waste demand is at {settings.waste_generation_multiplier}x.",
            timestamp=datetime.utcnow()
        ))
        
    return alerts

# --- POST ENDPOINTS ---

@app.post("/api/simulation/start")
def start_simulation(db: Session = Depends(get_db)):
    run_simulation_tick(db)
    return {"status": "success", "message": "Simulation tick executed."}

@app.post("/api/simulation/sensor-update")
def sensor_update(db: Session = Depends(get_db)):
    generate_sensor_update(db)
    return {"status": "success", "message": "Sensor data jumped."}

@app.post("/api/scenario/run")
def run_scenario(scenario_name: str, db: Session = Depends(get_db)):
    settings = db.query(SystemSettings).first()
    apply_scenario(db, scenario_name, settings)
    return {"status": "success", "message": f"Scenario {scenario_name} applied."}

@app.post("/api/simulation/reset")
def reset_simulation():
    reset_db()
    return {"status": "success", "message": "Database reset to empty state."}

@app.post("/api/simulation/load-demo")
def load_demo():
    reset_db()
    do_seed_data()
    return {"status": "success", "message": "Demo city data loaded deterministically."}

class AssistantQuerySchema(BaseModel):
    query: str

@app.post("/api/assistant/query")
def assistant_query(body: AssistantQuerySchema, db: Session = Depends(get_db)):
    query = body.query.lower()
    
    bins = db.query(Bin).all()
    settings = db.query(SystemSettings).first()
    predictions = run_prediction(bins, settings)
    
    critical_bins = [b for b in bins if predictions[b.id].risk_level == "CRITICAL"]
    
    # Deterministic fallback logic
    if "immediate collection" in query or "need collection" in query:
        if critical_bins:
            b_ids = ", ".join([b.id for b in critical_bins[:3]])
            return {"answer": f"The following bins need immediate collection: {b_ids}. There are {len(critical_bins)} total critical bins."}
        else:
            return {"answer": "No bins currently require immediate collection. All bins are within safe operational limits."}
            
    if "highest risk" in query or "zone" in query:
        # aggregate risk by zone
        zone_risk = {}
        for b in bins:
            zone_risk[b.zone_id] = zone_risk.get(b.zone_id, 0) + predictions[b.id].priority_score
        if zone_risk:
            highest_zone = max(zone_risk, key=zone_risk.get)
            return {"answer": f"Zone {highest_zone} currently has the highest aggregate collection risk based on predictive scoring."}
            
    if "scenario" in query or "changed" in query or "mode" in query:
        return {"answer": f"The current scenario is {settings.scenario_mode}. The waste generation multiplier is {settings.waste_generation_multiplier}x and traffic is {settings.traffic_multiplier}x."}
        
    if "fuel" in query or "co2" in query or "savings" in query:
        vehicles = db.query(Vehicle).all()
        depots = db.query(Depot).all()
        try:
            routes = generate_routes(bins, vehicles, depots, predictions, settings)
            impact = calculate_impact(routes, bins, vehicles, settings)
            return {"answer": f"By using optimized routes, we estimate a fuel saving of {impact.optimized_fuel_l:.1f} liters and a CO2 reduction of {impact.co2_saved_kg:.1f} kg compared to fixed schedules."}
        except RoutingUnavailableError:
            return {"answer": "I'm currently unable to calculate routes and fuel savings because the routing provider is unavailable. Please try again later."}
        
    return {"answer": "Based on current system state, all operations are proceeding as expected. Is there a specific bin, route, or zone you would like me to analyze?"}

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import enum
from pydantic import BaseModel
from typing import List, Optional

Base = declarative_base()

# --- ENUMS ---
class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class VehicleStatus(str, enum.Enum):
    AVAILABLE = "Available"
    COLLECTING = "Collecting"
    RETURNING = "Returning"
    MAINTENANCE = "Maintenance"

class TrafficLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    SEVERE = "SEVERE"

# --- SQLALCHEMY MODELS ---
class Zone(Base):
    __tablename__ = "zones"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    demand_multiplier = Column(Float, default=1.0)
    type = Column(String) # Residential, Commercial, etc.

class Bin(Base):
    __tablename__ = "bins"
    id = Column(String, primary_key=True, index=True)
    zone_id = Column(String, ForeignKey("zones.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    capacity_kg = Column(Float)
    current_fill_percent = Column(Float)
    current_weight_kg = Column(Float)
    fill_rate = Column(Float) # percent per hour
    status = Column(String, default="Active")
    last_updated = Column(DateTime, default=datetime.utcnow)

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    capacity_kg = Column(Float)
    current_load_kg = Column(Float, default=0.0)
    fuel_efficiency = Column(Float) # km per liter
    status = Column(String, default=VehicleStatus.AVAILABLE)
    latitude = Column(Float)
    longitude = Column(Float)
    depot_id = Column(String)

class Depot(Base):
    __tablename__ = "depots"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)

class SystemSettings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    overflow_threshold = Column(Float, default=90.0)
    prediction_horizon_hours = Column(Integer, default=24)
    co2_factor = Column(Float, default=2.68) # kg CO2 per liter of fuel
    fuel_cost_per_liter = Column(Float, default=1.5)
    scenario_mode = Column(String, default="NORMAL")
    traffic_multiplier = Column(Float, default=1.0)
    waste_generation_multiplier = Column(Float, default=1.0)

# --- PYDANTIC SCHEMAS ---
class ZoneSchema(BaseModel):
    id: str
    name: str
    demand_multiplier: float
    type: str

    class Config:
        from_attributes = True

class BinSchema(BaseModel):
    id: str
    zone_id: str
    latitude: float
    longitude: float
    capacity_kg: float
    current_fill_percent: float
    current_weight_kg: float
    fill_rate: float
    status: str
    last_updated: datetime

    class Config:
        from_attributes = True

class PredictionSchema(BaseModel):
    bin_id: str
    predicted_fill: float
    overflow_probability: float
    overflow_eta_hours: float
    confidence: float
    risk_level: str
    priority_score: float
    risk_explanation: str

class VehicleSchema(BaseModel):
    id: str
    name: str
    capacity_kg: float
    current_load_kg: float
    fuel_efficiency: float
    status: str
    latitude: float
    longitude: float
    depot_id: str
    assigned_route: Optional[str] = None

    class Config:
        from_attributes = True

class DepotSchema(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True

class Telemetry(Base):
    __tablename__ = "telemetry"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bin_id = Column(String, ForeignKey("bins.id"), index=True)
    fill_percent = Column(Float)
    temperature = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class TelemetrySchema(BaseModel):
    id: int
    bin_id: str
    fill_percent: float
    temperature: float
    timestamp: datetime

    class Config:
        from_attributes = True

class AlertSchema(BaseModel):
    id: str
    type: str # CRITICAL, HIGH, FLEET, ROUTE, SCENARIO
    message: str
    timestamp: datetime

class ImpactMetricsSchema(BaseModel):
    baseline_distance_km: float
    baseline_fuel_l: float
    baseline_co2_kg: float
    baseline_cost: float
    optimized_distance_km: float
    optimized_fuel_l: float
    optimized_co2_kg: float
    optimized_cost: float
    distance_saved_km: float
    co2_saved_kg: float
    cost_saved: float
    trips_reduced: int

class RouteStopSchema(BaseModel):
    bin_id: str
    latitude: float
    longitude: float
    expected_collection_kg: float

class RouteSchema(BaseModel):
    vehicle_id: str
    stops: List[RouteStopSchema]
    total_distance_km: float
    expected_total_load_kg: float
    estimated_fuel_l: float
    estimated_co2_kg: float
    explanation: str

class DashboardKpiSchema(BaseModel):
    total_bins: int
    critical_bins: int
    predicted_overflows: int
    active_vehicles: int
    forecasted_waste_kg: float
    estimated_co2_saved_kg: Optional[float] = None
    estimated_cost_saved: Optional[float] = None
    estimated_fuel_saved_l: Optional[float] = None

class SystemSettingsSchema(BaseModel):
    overflow_threshold: float
    prediction_horizon_hours: int
    co2_factor: float
    fuel_cost_per_liter: float
    scenario_mode: str
    traffic_multiplier: float
    waste_generation_multiplier: float

    class Config:
        from_attributes = True

from sqlalchemy.orm import Session
from app.models.domain import Zone, Bin, SystemSettings
import random

def apply_scenario(db: Session, scenario_name: str, settings: SystemSettings):
    settings.scenario_mode = scenario_name
    
    # Reset multipliers
    settings.waste_generation_multiplier = 1.0
    settings.traffic_multiplier = 1.0
    
    if scenario_name == "NORMAL":
        pass
    elif scenario_name == "FESTIVAL":
        settings.waste_generation_multiplier = 1.8
        settings.traffic_multiplier = 1.5
    elif scenario_name == "MARKET DAY":
        settings.waste_generation_multiplier = 1.3
        settings.traffic_multiplier = 1.2
    elif scenario_name == "WEEKEND":
        settings.waste_generation_multiplier = 1.1
        settings.traffic_multiplier = 0.8
    elif scenario_name == "HEAVY RAIN":
        settings.waste_generation_multiplier = 0.9
        settings.traffic_multiplier = 2.0
    elif scenario_name == "HOLIDAY":
        settings.waste_generation_multiplier = 1.5
        settings.traffic_multiplier = 0.7
    elif scenario_name == "WASTE SURGE":
        settings.waste_generation_multiplier = 2.5
        settings.traffic_multiplier = 1.3
        
    db.commit()

def run_simulation_tick(db: Session):
    bins = db.query(Bin).all()
    settings = db.query(SystemSettings).first()
    
    for b in bins:
        # Increase fill percent based on fill_rate and scenario multiplier
        # Simulate 1 hour passing per tick
        hourly_increase = b.fill_rate * settings.waste_generation_multiplier
        b.current_fill_percent += hourly_increase
        
        # Add random noise
        b.current_fill_percent += random.uniform(-0.5, 1.5)
        
        if b.current_fill_percent > 100.0:
            b.current_fill_percent = 100.0
            
        b.current_weight_kg = (b.current_fill_percent / 100.0) * b.capacity_kg
        
    db.commit()

def generate_sensor_update(db: Session):
    bins = db.query(Bin).all()
    
    # Randomly jump fill levels for 5 bins to simulate sensor updates
    jump_bins = random.sample(bins, min(5, len(bins)))
    for b in jump_bins:
        jump = random.uniform(5.0, 15.0)
        b.current_fill_percent = min(100.0, b.current_fill_percent + jump)
        b.current_weight_kg = (b.current_fill_percent / 100.0) * b.capacity_kg
        
    db.commit()

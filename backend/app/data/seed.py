import random
from sqlalchemy.orm import Session
from app.models.domain import Zone, Bin, Vehicle, Depot, SystemSettings, VehicleStatus

CITY_CENTER_LAT = 17.4350
CITY_CENTER_LON = 78.4058
LAT_RANGE = 0.05
LON_RANGE = 0.05

def get_random_coord():
    return (
        CITY_CENTER_LAT + random.uniform(-LAT_RANGE, LAT_RANGE),
        CITY_CENTER_LON + random.uniform(-LON_RANGE, LON_RANGE)
    )

SPECIFIC_BINS = [
    {"id": "BIN038", "ward": "Ward-7 Ameerpet", "type": "Bus Stand", "name": "Ameerpet Bus Stand", "fill": 14.9},
    {"id": "BIN068", "ward": "Ward-17 Miyapur", "type": "Residential", "name": "Kollur Road Junction", "fill": 14.9},
    {"id": "BIN085", "ward": "Ward-3B Malkajgiri", "type": "Commercial", "name": "Malkajgiri Circle", "fill": 14.7},
    {"id": "BIN088", "ward": "Ward-20 Shamshabad", "type": "Market", "name": "Shamshabad Market", "fill": 14.2},
    {"id": "BIN097", "ward": "Ward-5B Maredpally", "type": "Market", "name": "Maredpally Market", "fill": 13.9},
    {"id": "BIN065", "ward": "Ward-4 Nampally", "type": "Commercial", "name": "Gandhi Bhavan Road", "fill": 13.7},
    {"id": "BIN079", "ward": "Ward-18 Kompally", "type": "Bus Stand", "name": "Alwal Bus Stand", "fill": 13.4},
    {"id": "BIN083", "ward": "Ward-3B Tarnaka", "type": "Commercial", "name": "Tarnaka Junction", "fill": 13.1},
    {"id": "BIN004", "ward": "Ward-10 Banjara Hills", "type": "Hospital", "name": "Care Hospital Junction", "fill": 13.0},
    {"id": "BIN036", "ward": "Ward-7 Ameerpet", "type": "Commercial", "name": "Ameerpet Metro Station", "fill": 12.8},
    {"id": "BIN053", "ward": "Ward-3 Uppal", "type": "Residential", "name": "NGRI Colony Road", "fill": 12.7},
    
    {"id": "BIN001", "ward": "Ward-10 Banjara Hills", "type": "Residential", "name": "Road No.12, Banjara Hills", "fill": 2.2},
    {"id": "BIN006", "ward": "Ward-9 Jubilee Hills", "type": "Commercial", "name": "Road No.36, Jubilee Hills", "fill": 10.3},
    {"id": "BIN008", "ward": "Ward-9 Jubilee Hills", "type": "Market", "name": "People's Plaza Road", "fill": 3.4},
    {"id": "BIN013", "ward": "Ward-13 Madhapur", "type": "Mall", "name": "Inorbit Mall Road", "fill": 2.7},
    {"id": "BIN014", "ward": "Ward-13 Madhapur", "type": "Industrial", "name": "DLF Cybercity Gate 1", "fill": 3.5},
    {"id": "BIN020", "ward": "Ward-14 Kondapur", "type": "Bus Stand", "name": "Kondapur Bus Depot", "fill": 3.8},
    {"id": "BIN024", "ward": "Ward-15 Hitech City", "type": "Commercial", "name": "Mind Space Junction", "fill": 8.7},
    {"id": "BIN025", "ward": "Ward-15 Hitech City", "type": "School", "name": "University of Hyderabad Gate", "fill": 4.0},
    {"id": "BIN027", "ward": "Ward-5 Mehdipatnam", "type": "Hospital", "name": "Sarojini Devi Hospital", "fill": 9.5},
    {"id": "BIN033", "ward": "Ward-1 Charminar", "type": "Market", "name": "Mecca Masjid Road", "fill": 8.5},
]

def seed_data(db: Session):
    if db.query(Zone).first():
        return

    print("Generating Hyderabad seed data...")
    settings = SystemSettings()
    db.add(settings)

    depots = []
    for i in range(2):
        lat, lon = get_random_coord()
        depot = Depot(id=f"D-0{i+1}", name=f"GHMC Depot {i+1}", latitude=lat, longitude=lon)
        db.add(depot)
        depots.append(depot)

    # We will use the ward string as the zone ID for simplicity, and encode the name in it.
    created_zones = {}
    
    # Create Specific Bins
    for sb in SPECIFIC_BINS:
        if sb["ward"] not in created_zones:
            zone = Zone(id=sb["ward"], name=sb["ward"], demand_multiplier=1.2, type=sb["type"])
            db.add(zone)
            created_zones[sb["ward"]] = zone
            
        lat, lon = get_random_coord()
        capacity = 500 if sb["type"] in ["Market", "Commercial", "Bus Stand"] else 200
        weight = (sb["fill"] / 100) * capacity
        # We need these bins to have very high fill rate so they overflow tomorrow!
        # The AI Prediction logic in main.py: fill_rate is % per hour. 
        # So to overflow (reach 100%) in <24h from e.g. 10%, we need (100 - 10)/24 = ~3.75% per hour.
        # Let's set a high fill rate for these so they show up on the prediction screen.
        fill_rate = 4.0 if sb["fill"] < 15 else 1.5

        # We will pack the location name into the bin ID temporarily? 
        # Actually the frontend uses "BIN ID" and "LOCATION". I will have frontend map it or use the Zone id.
        # I'll just save it as is.
        
        bin_entity = Bin(
            id=sb["id"],
            zone_id=sb["ward"],
            latitude=lat,
            longitude=lon,
            capacity_kg=capacity,
            current_fill_percent=sb["fill"],
            current_weight_kg=weight,
            fill_rate=fill_rate,
            status="Active"
        )
        db.add(bin_entity)
        
    # Generate remaining bins up to 100
    existing_ids = set(sb["id"] for sb in SPECIFIC_BINS)
    zone_types = ["Residential", "Commercial", "Park", "Restaurant", "Industrial"]
    
    for i in range(1, 101):
        bin_id = f"BIN{str(i).zfill(3)}"
        if bin_id in existing_ids:
            continue
            
        ward = f"Ward-{random.randint(1, 30)} General"
        z_type = random.choice(zone_types)
        if ward not in created_zones:
            zone = Zone(id=ward, name=ward, demand_multiplier=1.0, type=z_type)
            db.add(zone)
            created_zones[ward] = zone
            
        lat, lon = get_random_coord()
        fill = random.uniform(5.0, 70.0)
        
        bin_entity = Bin(
            id=bin_id,
            zone_id=ward,
            latitude=lat,
            longitude=lon,
            capacity_kg=200,
            current_fill_percent=fill,
            current_weight_kg=(fill/100)*200,
            fill_rate=random.uniform(0.5, 2.0),
            status="Active"
        )
        db.add(bin_entity)

    # Vehicles
    for i in range(4):
        depot = random.choice(depots)
        lat, lon = depot.latitude + random.uniform(-0.01, 0.01), depot.longitude + random.uniform(-0.01, 0.01)
        vehicle = Vehicle(
            id=f"TRK-{i+1}",
            name=f"Fleet Truck {i+1}",
            capacity_kg=5000,
            fuel_efficiency=4.0,
            status=VehicleStatus.AVAILABLE,
            latitude=lat,
            longitude=lon,
            depot_id=depot.id
        )
        db.add(vehicle)

    db.commit()
    print("Seed data generated successfully.")

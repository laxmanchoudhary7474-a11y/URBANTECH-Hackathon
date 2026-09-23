# EcoBin AI: UrbanTech Hackathon 🚀

EcoBin AI is an advanced, AI-powered smart waste management platform and digital twin built for the **Greater Hyderabad Municipal Corporation (GHMC)**. It leverages predictive intelligence to transition city waste collection from a reactive, static schedule to a proactive, dynamic system.

## 🌟 Key Features

1. **Live GIS Map & Digital Twin** 🗺️
   - Real-time monitoring of IoT-enabled smart bins across Hyderabad using OpenStreetMap.
   - Live telemetry for fill levels, battery status, and signal strength.

2. **AI Prediction Engine (XGBoost Forecast)** 🧠
   - 24-hour predictive forecasting for bin fill levels.
   - Real-time calculation of overflow risk probability and priority scoring.
   - Automated "Collect Tomorrow" recommendations for high-risk bins.

3. **What-If City Simulator** 🌦️
   - Test AI routing intelligence against dynamic, real-world city events.
   - Simulate conditions like **Festivals** (+50% waste), **Heavy Rain** (+40% traffic delay), and **Weekends**.
   - Watch the AI dynamically reroute fleets in real-time to avoid critical overflows.

4. **Dynamic Fleet Routing & Optimization** 🚚
   - Calculates the most efficient routes for collection vehicles.
   - Measures and tracks exact fuel savings (Liters) and CO₂ emission reductions (kg) compared to traditional baseline routing.

5. **Smart Bins Dashboard** 📊
   - Detailed, sortable tabular view of all network nodes.
   - Rapid filtering by zone area type (Commercial, Residential, Hospital, etc.).
   - Visual progress bars for current vs. predicted fill levels.

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** (for responsive, modern UI)
- **Leaflet & React-Leaflet** (for mapping and GIS)
- **Lucide React** (for iconography)

### Backend
- **FastAPI** (Python framework for high-performance API)
- **SQLAlchemy** (ORM)
- **SQLite** (Database)
- **Uvicorn** (ASGI server)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (3.9+)

### 1. Start the Backend
Navigate to the `backend` directory, install dependencies, and run the server:
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
*(The backend runs on `http://localhost:8000`)*

### 2. Start the Frontend
Navigate to the `frontend` directory, install dependencies, and run the dev server:
```bash
cd frontend
npm install
npm run dev
```
*(The frontend runs on `http://localhost:5173`)*

## 🌍 Hackathon Details
Built for the **URBANTECH Hackathon**. EcoBin AI aims to make modern cities cleaner, greener, and significantly more resource-efficient by harnessing the power of predictive ML models and real-time operations.

const API_BASE = "http://localhost:8000/api";

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchBins() {
  const res = await fetch(`${API_BASE}/bins`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchVehicles() {
  const res = await fetch(`${API_BASE}/vehicles`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchDepots() {
  const res = await fetch(`${API_BASE}/depots`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchPredictions() {
  const res = await fetch(`${API_BASE}/predictions`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function runOptimization() {
  const res = await fetch(`${API_BASE}/optimization/run`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchImpact() {
  const res = await fetch(`${API_BASE}/impact`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function runSimulationTick() {
  const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
  return res.json();
}

export async function triggerSensorUpdate() {
  const res = await fetch(`${API_BASE}/simulation/sensor-update`, { method: 'POST' });
  return res.json();
}

export async function runScenario(scenario: string) {
  const res = await fetch(`${API_BASE}/scenario/run?scenario_name=${encodeURIComponent(scenario)}`, { method: 'POST' });
  return res.json();
}

export async function resetSimulation() {
  const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
  return res.json();
}

export async function loadDemo() {
  const res = await fetch(`${API_BASE}/simulation/load-demo`, { method: 'POST' });
  return res.json();
}

export async function askAssistant(query: string) {
  const res = await fetch(`${API_BASE}/assistant/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return res.json();
}

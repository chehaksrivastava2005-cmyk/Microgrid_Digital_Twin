# Microgrid Digital Twin

An uncertainty-aware, four-bus microgrid simulation with a FastAPI backend and a browser-based Three.js/CGVR digital-twin interface. The project demonstrates solar generation, battery storage, load demand, energy balance, transmission-line faults, graph-based recovery routes, Monte Carlo uncertainty analysis, and interactive system visualization.

## Features

- Interactive Three.js microgrid environment
- Four-bus system: Bus 1 Solar PV, Bus 2 Battery, Bus 3 Load 1, and Bus 4 Load 2
- Detailed solar, battery, transformer, substation, distribution, and load-zone models
- Animated power-flow particles
- Live FastAPI status monitoring
- Simulation controls for solar generation and load demand
- Battery charging, discharging, state of charge, and unserved-load reporting
- Transmission-line fault simulation
- NetworkX-based alternative recovery-route calculation
- Monte Carlo uncertainty ranges and probability estimates
- Orbit controls, camera presets, fullscreen mode, and equipment selection
- Optional Streamlit dashboard visualization

## Technology Stack

- **Backend:** Python, FastAPI, NetworkX, NumPy
- **Frontend:** JavaScript, Three.js, Vite, Troika Three Text
- **Visualization:** Streamlit, Matplotlib
- **Modeling:** Reusable Three.js groups and procedural electrical equipment geometry

## Project Structure

```text
Microgrid_Digital_Twin/
├── main.py                         # FastAPI application and simulation API
├── cgvr/
│   ├── index.html                  # CGVR web entry page
│   ├── package.json                # Frontend dependencies and scripts
│   ├── scenes/
│   │   ├── main.js                 # Frontend entry module
│   │   └── digital_twin.js         # Scene, UI, API, and interaction logic
│   └── models/
│       └── electrical.js           # Reusable Three.js electrical equipment models
├── recovery/
│   └── recovery_planner.py         # NetworkX recovery-route calculation
├── uncertainty/
│   └── monte_carlo.py              # Monte Carlo solar/load analysis
├── fault_detection/
│   └── fault_simulator.py          # Fault simulation utilities
├── simulation/
│   ├── dynamic_simulation.py
│   ├── integrated_microgrid.py
│   └── power_flow.py               # Additional microgrid simulation modules
├── parallel/
│   ├── serial.py
│   ├── openmp.cpp
│   ├── openmp_test.cpp
│   └── cuda.cu                     # Experimental parallel implementations
├── visualization/
│   └── dashboard.py                # Streamlit dashboard
├── data/
│   ├── grid_config.json
│   ├── load_data.csv
│   └── solar_data.csv
└── README.md
```

## Requirements

- Python 3.10 or newer
- Node.js 18 or newer with npm
- A browser with WebGL support
- An internet-free/local environment is supported; packages must be installed before running

The Python environment should provide:

```text
fastapi
uvicorn
networkx
numpy
streamlit
matplotlib
```

The CGVR frontend dependencies are declared in `cgvr/package.json`.

## Installation

### 1. Create and activate a Python environment

Windows PowerShell:

```powershell
cd C:\Users\B Srivastava\Microgrid_Digital_Twin
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install fastapi uvicorn networkx numpy streamlit matplotlib
```

### 2. Install frontend dependencies

```powershell
cd cgvr
npm install
```

## Running the Digital Twin

Open two terminals.

### Terminal 1: Start FastAPI

From the project root:

```powershell
uvicorn main:app --host 127.0.0.1 --port 8000
```

API documentation is available at:

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
- API root: http://127.0.0.1:8000/

### Terminal 2: Start CGVR

```powershell
cd cgvr
npm run start
```

Open the URL printed by Vite, normally:

```text
http://127.0.0.1:5173/
```

If a different Vite port is reported, use the displayed URL.

## Optional Streamlit Dashboard

From the project root:

```powershell
streamlit run visualization/dashboard.py
```

## FastAPI Endpoints

### `GET /`

Checks that the API is running.

### `GET /microgrid/status`

Returns the latest live simulation result.

Example fields:

- `solar_generation_kw`
- `load_demand_kw`
- `energy_balance_kw`
- `battery_capacity_kwh`
- `battery_energy_kwh`
- `battery_soc_percent`
- `battery_status`
- `charging_power_kw`
- `discharging_power_kw`
- `unserved_load_kw`
- `system_status`

### `POST /microgrid/step`

Applies one simulation step.

Example:

```text
POST /microgrid/step?solar_generation_kw=80&load_demand_kw=60
```

### `POST /microgrid/reset`

Resets the battery energy to 60 kWh and clears the battery operating state.

### `GET /microgrid/recovery`

Calculates an alternative graph route after transmission-line fault `0`, `1`, or `2`.

Example:

```text
GET /microgrid/recovery?fault_line=1
```

The response identifies whether a network path exists and may include a `recovery_path`. It does not verify electrical feasibility, line capacity, protection coordination, or voltage constraints.

### `GET /microgrid/uncertainty`

Returns Monte Carlo uncertainty statistics using actual generation and demand means and standard deviations.

Example:

```text
GET /microgrid/uncertainty?solar_mean_kw=80&load_mean_kw=60&solar_std_kw=10&load_std_kw=5&simulations=10000
```

The response includes P10/P90 ranges, deficit and surplus probabilities, and mean deficit/surplus estimates.

## Simulation Behaviour

The energy balance is calculated as:

```text
Energy balance = solar generation - load demand
```

- Positive balance charges the battery within its 100 kWh capacity and 20 kW maximum battery power.
- Negative balance discharges the battery when sufficient energy is available.
- When battery power is insufficient, the remaining demand is reported as unserved load.
- The battery efficiency used in the backend is 95%.
- The CGVR interface displays values returned by the backend and does not generate replacement electrical measurements.

## CGVR Controls

- **Orbit:** Left-drag
- **Pan:** Right-drag
- **Zoom:** Mouse wheel
- **Equipment selection:** Click on a selectable 3D component
- **Camera presets:** Overview, PV, battery, transformer, and substation
- **Fullscreen:** Header button
- **Reset camera:** Header button
- **Fault selection:** Right-side fault panel
- **Recovery route:** Right-side recovery button
- **Live simulation:** Bottom control bar
- **Monte Carlo result:** Right-side risk panel

The bottom simulation sliders represent **unapplied inputs**. Live backend values are displayed separately in the left panel. Applying the sliders sends them to `/microgrid/step` and `/microgrid/uncertainty` and updates the applied-result timestamp.

## Recovery and Fault Interpretation

- Fault 0: Solar PV–Battery connection
- Fault 1: Battery–Load 1 connection
- Fault 2: Battery–Load 2 connection

The recovery endpoint is implemented as shortest-path analysis on a graph. It demonstrates topological connectivity but must not be interpreted as a power-flow, protection, or engineering feasibility result.

## Monte Carlo Interpretation

Monte Carlo outputs are probability estimates generated from normal distributions with configurable means and standard deviations. Values are clipped to non-negative solar and load values. Deficit probability is the fraction of simulated energy balances below zero; surplus probability is the fraction above zero.

## Performance Notes

The interface is designed for an Intel Core i5-1334U and Intel UHD integrated graphics system:

- Antialiasing and pixel ratio are limited.
- Shadow-map resolution is restrained.
- The scene uses compact procedural geometry.
- Post-processing and heavy full-screen effects are not used.
- A 512×512 shadow map is used for the primary directional light.

Very small viewport widths may convert the layout to compact side panels and hide the camera toolbar. The top, left, right, and bottom panels should remain separate and non-overlapping at normal desktop resolutions.

## Important Academic Disclaimer

This project is a software demonstration and visualization environment. It is not an approved electrical control system and must not be used to operate physical grid infrastructure.

The backend is a simplified energy-balance model. The recovery result is based on graph connectivity, not an AC power-flow solution. Monte Carlo values are simulated estimates, not forecast guarantees.

## Useful Development Commands

Compile Python files:

```powershell
python -m compileall .
```

Start only the backend:

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Start only the frontend:

```powershell
cd cgvr
npm run start
```

Build the frontend for static hosting:

```powershell
cd cgvr
npm exec vite build
```

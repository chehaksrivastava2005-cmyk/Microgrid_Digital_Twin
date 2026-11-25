from fastapi import FastAPI, Query
import networkx as nx
import numpy as np
from recovery.recovery_planner import plan_recovery
from uncertainty.monte_carlo import run_monte_carlo

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Microgrid Digital Twin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

BATTERY_CAPACITY = 100.0
MAX_BATTERY_POWER = 20.0
EFFICIENCY = 0.95
battery_energy = 60.0

last_result = {
    "solar_generation_kw": 80.0,
    "load_demand_kw": 60.0,
    "energy_balance_kw": 20.0,
    "battery_capacity_kwh": BATTERY_CAPACITY,
    "battery_energy_kwh": 60.0,
    "battery_soc_percent": 60.0,
    "battery_status": "IDLE",
    "charging_power_kw": 0.0,
    "discharging_power_kw": 0.0,
    "unserved_load_kw": 0.0,
    "system_status": "NORMAL"
}
recovery_grid = nx.Graph()
recovery_grid.add_edges_from([
    ("Bus 1", "Bus 2"),
    ("Bus 2", "Bus 3"),
    ("Bus 2", "Bus 4"),
    ("Bus 3", "Bus 4")
])


def calculate_step(solar_generation_kw, load_demand_kw):
    global battery_energy

    balance = solar_generation_kw - load_demand_kw
    charging = 0.0
    discharging = 0.0
    unserved = 0.0

    if balance > 0:
        room = BATTERY_CAPACITY - battery_energy
        charging = min(balance, MAX_BATTERY_POWER, room / EFFICIENCY)
        battery_energy += charging * EFFICIENCY
        status = "CHARGING" if charging > 0 else "FULL"

    elif balance < 0:
        required = abs(balance)
        available = min(MAX_BATTERY_POWER, battery_energy * EFFICIENCY)
        discharging = min(required, available)
        battery_energy -= discharging / EFFICIENCY
        unserved = required - discharging
        status = "DISCHARGING" if discharging > 0 else "EMPTY"

    else:
        status = "IDLE"

    battery_energy = max(0.0, min(BATTERY_CAPACITY, battery_energy))

    return {
        "solar_generation_kw": solar_generation_kw,
        "load_demand_kw": load_demand_kw,
        "energy_balance_kw": balance,
        "battery_capacity_kwh": BATTERY_CAPACITY,
        "battery_energy_kwh": round(battery_energy, 2),
        "battery_soc_percent": round(battery_energy / BATTERY_CAPACITY * 100, 2),
        "battery_status": status,
        "charging_power_kw": round(charging, 2),
        "discharging_power_kw": round(discharging, 2),
        "unserved_load_kw": round(unserved, 2),
        "system_status": "NORMAL" if unserved == 0 else "ENERGY DEFICIT"
    }

@app.get("/")
def home():
    return {"message": "Microgrid Digital Twin API is running"}

@app.get("/microgrid/status")
def get_status():
    return last_result or {
        "battery_energy_kwh": round(battery_energy, 2),
        "battery_soc_percent": round(battery_energy / BATTERY_CAPACITY * 100, 2),
        "battery_status": "IDLE",
        "system_status": "NORMAL"
    }

@app.post("/microgrid/step")
def advance_simulation(
    solar_generation_kw: float = Query(80, ge=0, le=150),
    load_demand_kw: float = Query(60, ge=0, le=200)
):
    global last_result
    last_result = calculate_step(solar_generation_kw, load_demand_kw)
    return last_result

@app.post("/microgrid/reset")
def reset_battery():
    global battery_energy, last_result
    battery_energy = 60.0
    last_result = {
        "battery_energy_kwh": 60.0,
        "battery_soc_percent": 60.0,
        "battery_status": "IDLE",
        "system_status": "NORMAL"
    }
    return {"message": "Battery reset", **last_result}
@app.get("/microgrid/recovery")
def get_recovery_route(fault_line: int = Query(..., ge=0, le=2)):
    lines = [
        ("Bus 1", "Bus 2"),
        ("Bus 2", "Bus 3"),
        ("Bus 2", "Bus 4")
    ]

    faulty_edge = lines[fault_line]

    result = plan_recovery(
        recovery_grid,
        source=faulty_edge[0],
        target=faulty_edge[1],
        fault_line=faulty_edge
    )

    return result

@app.get("/microgrid/uncertainty")
def monte_carlo_uncertainty(
    solar_mean_kw: float = Query(80, ge=0),
    load_mean_kw: float = Query(60, ge=0),
    solar_std_kw: float = Query(10, ge=0),
    load_std_kw: float = Query(5, ge=0),
    simulations: int = Query(10000, ge=1, le=100000),
):
    results = run_monte_carlo(
        solar_mean=solar_mean_kw,
        load_mean=load_mean_kw,
        solar_std=solar_std_kw,
        load_std=load_std_kw,
        simulations=simulations,
        seed=42,
    )

    quantiles = {
        "solar_p10_kw": float(np.percentile(results["solar_generation"], 10)),
        "solar_p90_kw": float(np.percentile(results["solar_generation"], 90)),
        "load_p10_kw": float(np.percentile(results["load_demand"], 10)),
        "load_p90_kw": float(np.percentile(results["load_demand"], 90)),
        "balance_p10_kw": float(np.percentile(results["energy_balance"], 10)),
        "balance_p90_kw": float(np.percentile(results["energy_balance"], 90)),
    }

    return {
        "source": "Monte Carlo simulation",
        "simulations": simulations,
        "mean_solar_kw": results["mean_solar"],
        "mean_load_kw": results["mean_load"],
        "mean_balance_kw": results["mean_balance"],
        "deficit_probability": results["deficit_probability"],
        "surplus_probability": results["surplus_probability"],
        "mean_deficit_kw": results["mean_deficit"],
        "mean_surplus_kw": results["mean_surplus"],
        **quantiles,
    }



import streamlit as st
import matplotlib.pyplot as plt
import networkx as nx

from simulation.components import SolarPV, Load, Battery
from fault_detection.fault_simulator import simulate_line_fault
from recovery.recovery_planner import plan_recovery

st.set_page_config(page_title="Microgrid Digital Twin", page_icon="?", layout="wide")

st.title("Microgrid Digital Twin")
st.caption("Uncertainty-Aware Self-Healing Microgrid Simulation")

st.sidebar.header("Simulation Inputs")

solar_power = st.sidebar.slider("Solar Generation (kW)", 0, 150, 80)
load_1 = st.sidebar.slider("Bus 3 Load (kW)", 0, 100, 35)
load_2 = st.sidebar.slider("Bus 4 Load (kW)", 0, 100, 25)
initial_soc = st.sidebar.slider("Initial Battery SoC (%)", 0, 100, 60)

solar = SolarPV("Solar PV", 150)
battery = Battery("Main Battery", 100, initial_soc, 20, 0.95)

generation = solar.generate(solar_power / 150)
demand = Load("Bus 3", load_1).get_demand() + Load("Bus 4", load_2).get_demand()
balance = generation - demand

if balance > 0:
    battery_power = battery.charge(balance)
    battery_status = "Charging"
elif balance < 0:
    battery_power = battery.discharge(abs(balance))
    battery_status = "Discharging"
else:
    battery_power = 0
    battery_status = "Idle"

unserved_load = max(0, abs(min(balance, 0)) - battery_power)

col1, col2, col3, col4 = st.columns(4)
col1.metric("Solar Generation", f"{generation:.2f} kW")
col2.metric("Total Demand", f"{demand:.2f} kW")
col3.metric("Energy Balance", f"{balance:.2f} kW")
col4.metric("Battery SoC", f"{battery.soc:.2f}%")

st.divider()

st.subheader("Battery Management")
st.write("Battery Status:", battery_status)
st.write("Battery Power:", f"{battery_power:.2f} kW")
st.write("Stored Energy:", f"{battery.capacity * battery.soc / 100:.2f} kWh")
st.progress(battery.soc / 100)

if unserved_load > 0:
    st.error(f"Unserved load: {unserved_load:.2f} kW")
else:
    st.success("All demand is supplied.")

st.subheader("Generation vs Demand")
fig, ax = plt.subplots(figsize=(9, 4))
ax.bar(["Solar Generation", "Total Demand"], [generation, demand])
ax.set_ylabel("Power (kW)")
ax.grid(axis="y", alpha=0.3)
st.pyplot(fig)
plt.close(fig)

st.divider()
st.header("Fault Detection and Self-Healing")

grid = nx.Graph()
grid.add_edges_from([
    ("Bus 1", "Bus 2"),
    ("Bus 2", "Bus 3"),
    ("Bus 2", "Bus 4"),
    ("Bus 3", "Bus 4")
])

fault_options = {
    "Bus 1 - Bus 2": ("Bus 1", "Bus 2"),
    "Bus 2 - Bus 3": ("Bus 2", "Bus 3"),
    "Bus 2 - Bus 4": ("Bus 2", "Bus 4"),
    "Bus 3 - Bus 4": ("Bus 3", "Bus 4")
}

selected_fault = st.selectbox("Select transmission line to fail", list(fault_options))
fault_line = fault_options[selected_fault]

if st.button("Simulate Transmission Line Fault"):
    result = simulate_line_fault(grid, "Bus 1", fault_line)

    st.write("Faulty line:", selected_fault)
    st.write("Connected buses:", result["connected_buses"])
    st.write("Disconnected buses:", result["disconnected_buses"])

    if result["system_connected"]:
        st.success("All buses remain connected.")
    else:
        st.error("Network disconnection detected.")

    recovery_grid = grid.copy()
    recovery_grid.remove_edge(*fault_line)

    targets = result["disconnected_buses"] or [
        bus for bus in grid.nodes if bus != "Bus 1"
    ]

    st.subheader("Alternative Recovery Routes")

    for target in targets:
        recovery = plan_recovery(grid, "Bus 1", target, fault_line)

        if recovery["recovery_possible"]:
            st.success(
                f"{target}: " + " -> ".join(recovery["recovery_path"])
            )
        else:
            st.warning(f"{target}: {recovery['message']}")

st.caption("Software simulation only. Not connected to physical electrical infrastructure.")
from uncertainty.monte_carlo import run_monte_carlo

st.divider()
st.header("Monte Carlo Uncertainty Analysis")

solar_uncertainty = st.slider("Solar Generation Uncertainty (kW)", 0, 30, 10)
load_uncertainty = st.slider("Load Demand Uncertainty (kW)", 0, 20, 5)
simulation_count = st.selectbox("Number of Simulations", [1000, 5000, 10000], index=2)

if st.button("Run Monte Carlo Simulation"):
    results = run_monte_carlo(
        solar_mean=generation,
        load_mean=demand,
        solar_std=solar_uncertainty,
        load_std=load_uncertainty,
        simulations=simulation_count
    )

    col1, col2, col3 = st.columns(3)

    col1.metric("Average Solar", f"{results['mean_solar']:.2f} kW")
    col2.metric("Average Load", f"{results['mean_load']:.2f} kW")
    col3.metric("Average Balance", f"{results['mean_balance']:.2f} kW")

    col1, col2 = st.columns(2)

    col1.metric(
        "Deficit Probability",
        f"{results['deficit_probability'] * 100:.2f}%"
    )

    col2.metric(
        "Surplus Probability",
        f"{results['surplus_probability'] * 100:.2f}%"
    )

    st.write(
        "Average Power Deficit:",
        f"{results['mean_deficit']:.2f} kW"
    )

    st.write(
        "Average Power Surplus:",
        f"{results['mean_surplus']:.2f} kW"
    )

    fig, ax = plt.subplots(figsize=(9, 4))
    ax.hist(results["energy_balance"], bins=40)
    ax.axvline(0, linestyle="--", label="Zero energy balance")
    ax.set_xlabel("Energy Balance (kW)")
    ax.set_ylabel("Number of Scenarios")
    ax.set_title("Monte Carlo Energy Balance Distribution")
    ax.legend()
    st.pyplot(fig)
    plt.close(fig)


import networkx as nx
import matplotlib.pyplot as plt

# STEP 1: Create microgrid
grid = nx.Graph()

# STEP 2: Add buses and their properties

grid.add_node("Bus 1", type="Solar", generation=80, load=0)

grid.add_node(
    "Bus 2",
    type="Battery",
    generation=0,
    load=0,
    capacity=100,
    soc=60,
    max_power=20
)

grid.add_node("Bus 3", type="Load", generation=0, load=35)
grid.add_node("Bus 4", type="Load", generation=0, load=25)

# STEP 3: Connect transmission lines

grid.add_edge("Bus 1", "Bus 2", capacity=100)
grid.add_edge("Bus 2", "Bus 3", capacity=50)
grid.add_edge("Bus 2", "Bus 4", capacity=50)
grid.add_edge("Bus 3", "Bus 4", capacity=50)  # Alternative tie-line

# STEP 4: Calculate total generation and demand

total_generation = sum(
    data["generation"]
    for _, data in grid.nodes(data=True)
)

total_load = sum(
    data["load"]
    for _, data in grid.nodes(data=True)
)

energy_balance = total_generation - total_load

# STEP 5: Battery energy management

battery = grid.nodes["Bus 2"]

capacity = battery["capacity"]
soc = battery["soc"]
max_power = battery["max_power"]

efficiency = 0.95
time_interval = 1

battery_energy = capacity * soc / 100

print("\nMICROGRID DIGITAL TWIN")
print("----------------------")

print("Total Generation:", total_generation, "kW")
print("Total Load:", total_load, "kW")
print("Energy Balance:", energy_balance, "kW")

if energy_balance > 0:

    # Charge battery
    charging_power = min(
        energy_balance,
        max_power,
        (capacity - battery_energy) /
        (time_interval * efficiency)
    )

    battery_energy += charging_power * time_interval * efficiency

    print("\nBattery Status: CHARGING")
    print("Charging Power:", round(charging_power, 2), "kW")

elif energy_balance < 0:

    # Discharge battery
    required_power = abs(energy_balance)

    available_power = min(
        max_power,
        battery_energy * efficiency / time_interval
    )

    discharge_power = min(required_power, available_power)

    battery_energy -= (
        discharge_power * time_interval / efficiency
    )

    print("\nBattery Status: DISCHARGING")
    print("Discharging Power:", round(discharge_power, 2), "kW")

    unserved_load = required_power - discharge_power
    print("Unserved Load:", round(unserved_load, 2), "kW")

else:
    print("\nBattery Status: IDLE")

# STEP 6: Update battery state in the graph

battery["soc"] = battery_energy / capacity * 100

print("\nUPDATED BATTERY STATUS")
print("----------------------")
print("Battery Energy:", round(battery_energy, 2), "kWh")
print("Battery SoC:", round(battery["soc"], 2), "%")

# STEP 7: Display all microgrid components

print("\nMICROGRID COMPONENTS")

for bus, data in grid.nodes(data=True):
    print(bus, data)

# STEP 8: Visualize the microgrid

pos = nx.spring_layout(grid, seed=42)

colors = []

for bus, data in grid.nodes(data=True):

    if data["type"] == "Solar":
        colors.append("orange")

    elif data["type"] == "Battery":
        colors.append("lightgreen")

    else:
        colors.append("skyblue")

nx.draw(
    grid,
    pos,
    with_labels=True,
    node_color=colors,
    node_size=2500,
    font_size=10
)

nx.draw_networkx_edge_labels(
    grid,
    pos,
    edge_labels=nx.get_edge_attributes(grid, "capacity")
)

plt.title("Integrated Microgrid Digital Twin")
plt.show()


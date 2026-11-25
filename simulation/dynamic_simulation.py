import matplotlib.pyplot as plt

# Initial battery configuration
battery_capacity = 100
battery_energy = 60
max_battery_power = 20
efficiency = 0.95

# Solar generation at different time intervals (kW)
solar_data = [10, 30, 70, 90, 40, 10]

# Electricity demand at different time intervals (kW)
load_data = [25, 35, 50, 60, 65, 45]

soc_history = []
balance_history = []

print("DYNAMIC MICROGRID SIMULATION")
print("-----------------------------")

for hour in range(len(solar_data)):

    solar = solar_data[hour]
    load = load_data[hour]

    balance = solar - load

    if balance > 0:

        charging_power = min(
            balance,
            max_battery_power,
            (battery_capacity - battery_energy) / efficiency
        )

        battery_energy += charging_power * efficiency

        status = "CHARGING"

    elif balance < 0:

        required_power = abs(balance)

        available_power = min(
            max_battery_power,
            battery_energy * efficiency
        )

        discharge_power = min(
            required_power,
            available_power
        )

        battery_energy -= discharge_power / efficiency

        status = "DISCHARGING"

    else:
        status = "IDLE"

    battery_energy = max(
        0,
        min(battery_capacity, battery_energy)
    )

    soc = battery_energy / battery_capacity * 100

    soc_history.append(soc)
    balance_history.append(balance)

    print(
        f"Hour {hour + 1}: Solar={solar} kW, "
        f"Load={load} kW, "
        f"Balance={balance} kW, "
        f"SoC={soc:.2f}%, "
        f"Battery={status}"
    )

# Visualize results

hours = range(1, len(solar_data) + 1)

plt.figure(figsize=(10, 5))

plt.plot(
    hours,
    soc_history,
    marker="o",
    label="Battery SoC"
)

plt.xlabel("Simulation Hour")
plt.ylabel("Battery SoC (%)")
plt.title("Dynamic Microgrid Battery Behaviour")
plt.ylim(0, 100)
plt.grid(True)
plt.legend()

plt.show()

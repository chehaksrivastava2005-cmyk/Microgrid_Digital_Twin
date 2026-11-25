solar_generation = 80

load_1 = 35
load_2 = 25

battery_capacity = 100
battery_soc = 60
max_battery_power = 20
efficiency = 0.95

time_interval = 1

total_load = load_1 + load_2
energy_balance = solar_generation - total_load

print("MICROGRID ENERGY MANAGEMENT")
print("---------------------------")

print("Solar Generation:", solar_generation, "kW")
print("Total Load:", total_load, "kW")
print("Energy Balance:", energy_balance, "kW")

battery_energy = battery_capacity * battery_soc / 100

if energy_balance > 0:

    charging_power = min(energy_balance, max_battery_power)

    energy_added = charging_power * time_interval * efficiency

    battery_energy += energy_added
    battery_energy = min(battery_energy, battery_capacity)

    print("\nBattery Status: CHARGING")
    print("Charging Power:", charging_power, "kW")

elif energy_balance < 0:

    required_power = abs(energy_balance)

    available_power = min(
        max_battery_power,
        battery_energy * efficiency / time_interval
    )

    discharge_power = min(required_power, available_power)

    energy_used = discharge_power * time_interval / efficiency

    battery_energy -= energy_used

    print("\nBattery Status: DISCHARGING")
    print("Discharging Power:", discharge_power, "kW")

else:
    print("\nBattery Status: IDLE")

battery_soc = (battery_energy / battery_capacity) * 100

print("\nUPDATED BATTERY INFORMATION")
print("---------------------------")
print("Battery Energy:", round(battery_energy, 2), "kWh")
print("Battery SoC:", round(battery_soc, 2), "%")

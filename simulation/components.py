from dataclasses import dataclass


@dataclass
class SolarPV:
    name: str
    max_generation: float

    def generate(self, sunlight_factor: float) -> float:
        sunlight_factor = max(0.0, min(1.0, sunlight_factor))
        return self.max_generation * sunlight_factor


@dataclass
class Load:
    name: str
    demand: float

    def get_demand(self) -> float:
        return max(0.0, self.demand)


@dataclass
class Battery:
    name: str
    capacity: float
    soc: float
    max_power: float
    efficiency: float = 0.95

    def __post_init__(self):
        if self.capacity <= 0:
            raise ValueError("Capacity must be positive.")
        if not 0 <= self.soc <= 100:
            raise ValueError("SoC must be between 0 and 100.")
        if self.max_power < 0:
            raise ValueError("Maximum power cannot be negative.")
        if not 0 < self.efficiency <= 1:
            raise ValueError("Efficiency must be between 0 and 1.")

    def charge(self, power: float, dt: float = 1.0) -> float:
        if dt <= 0:
            raise ValueError("Time interval must be positive.")

        room = self.capacity * (100 - self.soc) / 100
        actual_power = min(power, self.max_power, room / (dt * self.efficiency))
        self.soc += actual_power * dt * self.efficiency / self.capacity * 100
        return actual_power

    def discharge(self, power: float, dt: float = 1.0) -> float:
        if dt <= 0:
            raise ValueError("Time interval must be positive.")

        available_energy = self.capacity * self.soc / 100
        available_power = available_energy * self.efficiency / dt
        actual_power = min(power, self.max_power, available_power)
        self.soc -= actual_power * dt / self.efficiency / self.capacity * 100
        return actual_power

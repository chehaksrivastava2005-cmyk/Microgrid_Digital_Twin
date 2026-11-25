import numpy as np


def run_monte_carlo(
    solar_mean,
    load_mean,
    solar_std=10,
    load_std=5,
    simulations=10000,
    seed=42
):
    """
    Simulate uncertainty in solar generation and electricity demand.

    All power values are in kW.
    """

    if solar_mean < 0 or load_mean < 0:
        raise ValueError("Mean generation and demand cannot be negative.")

    if solar_std < 0 or load_std < 0:
        raise ValueError("Standard deviations cannot be negative.")

    if simulations <= 0:
        raise ValueError("Number of simulations must be positive.")

    rng = np.random.default_rng(seed)

    solar = rng.normal(solar_mean, solar_std, simulations)
    load = rng.normal(load_mean, load_std, simulations)

    solar = np.maximum(solar, 0)
    load = np.maximum(load, 0)

    balance = solar - load
    deficit = balance < 0

    return {
        "solar_generation": solar,
        "load_demand": load,
        "energy_balance": balance,
        "mean_solar": float(np.mean(solar)),
        "mean_load": float(np.mean(load)),
        "mean_balance": float(np.mean(balance)),
        "deficit_probability": float(np.mean(deficit)),
        "surplus_probability": float(np.mean(balance > 0)),
        "mean_deficit": float(np.mean(np.maximum(-balance, 0))),
        "mean_surplus": float(np.mean(np.maximum(balance, 0)))
    }

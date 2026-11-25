import networkx as nx


def calculate_power_flow(grid, source, demands):
    """
    Calculate power distribution across a connected microgrid.

    Parameters:
        grid: NetworkX graph with line capacities.
        source: Name of the generation bus.
        demands: Dictionary mapping load bus names to demand in kW.

    Returns:
        Dictionary containing line flows, overloads and unmet demand.
    """

    if source not in grid:
        raise ValueError(f"Source bus '{source}' does not exist.")

    if not nx.is_connected(grid):
        raise ValueError("The microgrid contains disconnected buses.")

    if any(bus not in grid for bus in demands):
        raise ValueError("A demand bus does not exist in the grid.")

    if any(value < 0 for value in demands.values()):
        raise ValueError("Demand cannot be negative.")

    tree = nx.bfs_tree(grid, source)
    flows = {}
    overloaded_lines = []

    for bus in reversed(list(nx.topological_sort(tree))):
        downstream_demand = demands.get(bus, 0.0)

        for child in tree.successors(bus):
            downstream_demand += flows[(bus, child)]

        if bus != source:
            parent = next(tree.predecessors(bus))
            capacity = grid[parent][bus].get("capacity", float("inf"))

            flows[(parent, bus)] = downstream_demand

            if downstream_demand > capacity:
                overloaded_lines.append({
                    "line": (parent, bus),
                    "flow": downstream_demand,
                    "capacity": capacity
                })

    total_demand = sum(demands.values())

    return {
        "total_demand": total_demand,
        "line_flows": flows,
        "overloaded_lines": overloaded_lines
    }

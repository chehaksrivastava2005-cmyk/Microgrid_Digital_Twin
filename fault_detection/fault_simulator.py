import networkx as nx


def simulate_line_fault(grid, source, fault_line):
    """
    Simulate a transmission-line failure.

    Returns the network connectivity status after the fault.
    """

    if source not in grid:
        raise ValueError("Source bus does not exist.")

    if not grid.has_edge(*fault_line):
        raise ValueError("Fault line does not exist.")

    faulty_grid = grid.copy()
    faulty_grid.remove_edge(*fault_line)

    connected_buses = list(nx.node_connected_component(faulty_grid, source))

    disconnected_buses = [
        bus for bus in grid.nodes
        if bus not in connected_buses
    ]

    return {
        "fault_line": fault_line,
        "connected_buses": connected_buses,
        "disconnected_buses": disconnected_buses,
        "system_connected": len(disconnected_buses) == 0
    }

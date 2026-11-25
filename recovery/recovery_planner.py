import networkx as nx


def plan_recovery(grid, source, target, fault_line):
    """
    Find an alternative route after a transmission-line failure.
    """

    if source not in grid or target not in grid:
        raise ValueError("Source or target bus does not exist.")

    if not grid.has_edge(*fault_line):
        raise ValueError("Faulty transmission line does not exist.")

    recovery_grid = grid.copy()
    recovery_grid.remove_edge(*fault_line)

    if not nx.has_path(recovery_grid, source, target):
        return {
            "recovery_possible": False,
            "recovery_path": None,
            "message": "No alternative route is available."
        }

    path = nx.shortest_path(recovery_grid, source, target)

    return {
        "recovery_possible": True,
        "recovery_path": path,
        "message": "Alternative route found."
    }

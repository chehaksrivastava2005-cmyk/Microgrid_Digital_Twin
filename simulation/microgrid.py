import networkx as nx
import matplotlib.pyplot as plt

microgrid = nx.Graph()

microgrid.add_node("Bus 1", type="Solar", generation=80, load=0)

microgrid.add_node(
    "Bus 2",
    type="Battery",
    generation=0,
    load=20,
    battery_soc=60
)

microgrid.add_node("Bus 3", type="Load", generation=0, load=35)
microgrid.add_node("Bus 4", type="Load", generation=0, load=25)

microgrid.add_edge("Bus 1", "Bus 2", capacity=100)
microgrid.add_edge("Bus 2", "Bus 3", capacity=50)
microgrid.add_edge("Bus 2", "Bus 4", capacity=50)

print("MICROGRID INFORMATION")

for bus, data in microgrid.nodes(data=True):
    print(bus, data)

print("\nTRANSMISSION LINES")

for u, v, data in microgrid.edges(data=True):
    print(u, "<->", v, data)

pos = nx.spring_layout(microgrid, seed=42)

nx.draw(
    microgrid,
    pos,
    with_labels=True,
    node_color="lightblue",
    node_size=2500
)

plt.title("Basic Microgrid Digital Twin")
plt.show()

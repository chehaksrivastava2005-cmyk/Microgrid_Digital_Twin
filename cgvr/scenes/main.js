import './digital_twin.js';

/* Legacy monolithic scene retained for reference.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Text } from 'troika-three-text';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101820);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(12, 11, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(8, 12, 10);
scene.add(light);

scene.add(new THREE.GridHelper(30, 30, 0x526777, 0x263744));

function createBus(name, position, color) {
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const material = new THREE.MeshStandardMaterial({ color });
    const bus = new THREE.Mesh(geometry, material);
    bus.position.set(...position);
    bus.userData.name = name;
    scene.add(bus);

    const label = new Text();
    label.text = name;
    label.fontSize = 0.65;
    label.color = 0xffffff;
    label.anchorX = 'center';
    label.anchorY = 'bottom';
    label.position.set(position[0], position[1] + 1.1, position[2]);
    scene.add(label);
    label.sync();

    return bus;
}

function createLine(start, end, color = 0x9aabb8) {
    const points = [
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    scene.add(new THREE.Line(geometry, material));
}

createBus('Solar PV', [-6, 1, 0], 0xf1c40f);
createBus('Battery', [-2, 1, 0], 0x27ae60);
createBus('Load 1', [3, 1, -3], 0xe74c3c);
createBus('Load 2', [3, 1, 3], 0xe74c3c);

createLine([-6, 1, 0], [-2, 1, 0]);
createLine([-2, 1, 0], [3, 1, -3]);
createLine([-2, 1, 0], [3, 1, 3]);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
function createSolarPanel(position) {
    const panel = new THREE.Group();

    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.12, 2),
        new THREE.MeshStandardMaterial({ color: 0x263746 })
    );
    panel.add(frame);

    const cellMaterial = new THREE.MeshStandardMaterial({
        color: 0x1769aa,
        metalness: 0.35,
        roughness: 0.3
    });

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            const cell = new THREE.Mesh(
                new THREE.BoxGeometry(0.73, 0.035, 0.58),
                cellMaterial
            );
            cell.position.set(
                -1.2 + col * 0.8,
                0.08,
                -0.65 + row * 0.65
            );
            panel.add(cell);
        }
    }

    panel.position.set(...position);
    panel.rotation.z = -0.3;
    scene.add(panel);

    return panel;
}

createSolarPanel([-6, 2.2, -3]);
function createBatteryUnit(position) {
    const battery = new THREE.Group();

    const enclosure = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 2.4, 1.8),
        new THREE.MeshStandardMaterial({
            color: 0x263b36,
            metalness: 0.45,
            roughness: 0.5
        })
    );
    battery.add(enclosure);

    const moduleMaterial = new THREE.MeshStandardMaterial({
        color: 0x27ae60,
        metalness: 0.25,
        roughness: 0.35
    });

    for (let i = 0; i < 4; i++) {
        const module = new THREE.Mesh(
            new THREE.BoxGeometry(0.52, 1.55, 1.35),
            moduleMaterial
        );
        module.position.set(-0.9 + i * 0.6, 0, 0.15);
        battery.add(module);
    }

    const terminalMaterial = new THREE.MeshStandardMaterial({
        color: 0xd5d9dc,
        metalness: 0.8,
        roughness: 0.2
    });

    for (let i = 0; i < 2; i++) {
        const terminal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 0.25, 16),
            terminalMaterial
        );
        terminal.position.set(i === 0 ? -0.7 : 0.7, 1.3, 0);
        battery.add(terminal);
    }

    battery.position.set(...position);
    scene.add(battery);

    return battery;
}

createBatteryUnit([-2, 3, -3]);
function createDistributionUnit(position) {
    const unit = new THREE.Group();

    const cabinet = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 2.8, 1.2),
        new THREE.MeshStandardMaterial({
            color: 0x34495e,
            metalness: 0.4,
            roughness: 0.5
        })
    );
    unit.add(cabinet);

    for (let i = 0; i < 4; i++) {
        const breaker = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.65, 0.12),
            new THREE.MeshStandardMaterial({ color: 0xe74c3c })
        );
        breaker.position.set(-0.75 + i * 0.5, 0.3, 0.65);
        unit.add(breaker);
    }

    const indicator = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0x2ecc71,
            emissive: 0x145a32
        })
    );
    indicator.position.set(0, 0.95, 0.65);
    unit.add(indicator);

    unit.position.set(...position);
    scene.add(unit);

    return unit;
}

createDistributionUnit([3, 3, -6]);
const flowPaths = [
    [[-6, 1, 0], [-2, 1, 0]],
    [[-2, 1, 0], [3, 1, -3]],
    [[-2, 1, 0], [3, 1, 3]]
];

let currentBatteryStatus = 'IDLE';
let currentUnservedLoad = 0;

const flowParticles = [];

flowPaths.forEach((path, pathIndex) => {
    for (let i = 0; i < 4; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 16, 16),
            new THREE.MeshBasicMaterial({
                color: pathIndex === 0 ? 0xf1c40f : 0x00e5ff
            })
        );

        scene.add(particle);

        flowParticles.push({
            mesh: particle,
            start: new THREE.Vector3(...path[0]),
            end: new THREE.Vector3(...path[1]),
            offset: i / 4,
            pathIndex: pathIndex
        });
    }
});

const flowClock = new THREE.Clock();

function animatePowerFlow() {
    requestAnimationFrame(animatePowerFlow);

    const time = flowClock.getElapsedTime();

    flowParticles.forEach((particle) => {
        const progress = (time * 0.35 + particle.offset) % 1;

        let particleColor = 0xf1c40f;

        if (particle.pathIndex === 1 || particle.pathIndex === 2) {
            if (currentUnservedLoad > 0) {
                particleColor = 0xff3333;
            } else if (currentBatteryStatus === 'CHARGING') {
                particleColor = 0x2ecc71;
            } else if (currentBatteryStatus === 'DISCHARGING') {
                particleColor = 0xff5555;
            } else {
                particleColor = 0x00e5ff;
            }
        }

        particle.mesh.material.color.setHex(particleColor);

        particle.mesh.position.lerpVectors(
            particle.start,
            particle.end,
            progress
        );
    });

    renderer.render(scene, camera);
}

animatePowerFlow();
const infoPanel = document.createElement('div');
infoPanel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 230px;
    padding: 16px;
    background: rgba(20, 35, 48, 0.95);
    color: white;
    font-family: Arial, sans-serif;
    border: 1px solid #526777;
    border-radius: 8px;
    display: none;
    z-index: 10;
`;
document.body.appendChild(infoPanel);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const selectableObjects = scene.children.filter(
        object => object.userData.name
    );

    const intersections = raycaster.intersectObjects(
        selectableObjects,
        false
    );

    if (intersections.length > 0) {
        const selected = intersections[0].object;
        infoPanel.style.display = 'block';
        infoPanel.innerHTML = `
            <h3>${selected.userData.name}</h3>
            <p>Microgrid component</p>
            <p>Click another bus to inspect it.</p>
        `;
    } else {
        infoPanel.style.display = 'none';
    }
});
const faultPanel = document.createElement('div');

faultPanel.style.cssText = `
    position: fixed;
    bottom: 25px;
    left: 25px;
    padding: 16px;
    background: rgba(20, 35, 48, 0.96);
    color: white;
    font-family: Arial, sans-serif;
    border: 1px solid #526777;
    border-radius: 8px;
    z-index: 10;
`;

faultPanel.innerHTML = `
    <h3>Fault Simulation</h3>
    <select id="faultLine">
        <option value="0">Solar PV - Battery</option>
        <option value="1">Battery - Load 1</option>
        <option value="2">Battery - Load 2</option>
    </select>
    <br><br>
    <button id="simulateFault">Simulate Fault</button>
    <button id="resetFault">Reset</button>
    <p id="faultStatus">System Status: Normal</p>
`;

document.body.appendChild(faultPanel);

const faultLineMeshes = [];
flowPaths.forEach((path) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...path[0]),
        new THREE.Vector3(...path[1])
    ]);

    const material = new THREE.LineBasicMaterial({
        color: 0x9aabb8,
        linewidth: 3
    });

    const line = new THREE.Line(geometry, material);
    scene.add(line);
    faultLineMeshes.push(line);
});

let activeFault = null;

document.getElementById('simulateFault').addEventListener('click', () => {
    const selectedLine = Number(
        document.getElementById('faultLine').value
    );

    if (activeFault !== null) {
        faultLineMeshes[activeFault].material.color.set(0x9aabb8);
    }

    activeFault = selectedLine;
    faultLineMeshes[selectedLine].material.color.set(0xff0000);

    document.getElementById('faultStatus').textContent =
        'WARNING: Transmission line fault detected!';
    document.getElementById('faultStatus').style.color = '#ff5555';

    flowParticles.forEach((particle) => {
        particle.mesh.visible = false;
    });
});

document.getElementById('resetFault').addEventListener('click', () => {
    recoveryLines.forEach(line => {
        scene.remove(line);
        line.geometry.dispose();
        line.material.dispose();
    });
    recoveryLines.length = 0;

    faultLineMeshes.forEach((line) => {
        line.material.color.set(0x9aabb8);
    });

    activeFault = null;

    flowParticles.forEach((particle) => {
        particle.mesh.visible = true;
    });

    document.getElementById('faultStatus').textContent =
        'System Status: Normal';
    document.getElementById('faultStatus').style.color = '#ffffff';
});
const recoveryButton = document.createElement('button');
recoveryButton.textContent = 'Show Recovery Route';

recoveryButton.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 360px;
    min-width: 190px;
    padding: 12px 18px;
    background: #168a55;
    color: #ffffff;
    font-size: 14px;
    font-weight: bold;
    border: 2px solid #2ecc71;
    border-radius: 6px;
    cursor: pointer;
    z-index: 1000;
    opacity: 1;
    visibility: visible;
`;

document.body.appendChild(recoveryButton);

const recoveryLines = [];

async function showRecoveryRoute() {
    recoveryLines.forEach(line => {
        scene.remove(line);
        line.geometry.dispose();
        line.material.dispose();
    });
    recoveryLines.length = 0;

    if (activeFault === null) {
        document.getElementById('faultStatus').textContent =
            'Simulate a fault first.';
        return;
    }

    const status = document.getElementById('faultStatus');
    status.textContent = 'Calculating recovery route...';

    try {
        const response = await fetch(
            `http://127.0.0.1:8000/microgrid/recovery?fault_line=${activeFault}`
        );

        if (!response.ok) {
            throw new Error('Recovery API request failed');
        }

        const result = await response.json();

        if (!result.recovery_possible || !result.recovery_path) {
            status.textContent = result.message;
            status.style.color = '#ff5555';
            return;
        }

        const busPositions = {
            'Bus 1': [-6, 1.2, 0],
            'Bus 2': [-2, 1.2, 0],
            'Bus 3': [3, 1.2, -3],
            'Bus 4': [3, 1.2, 3]
        };

        const points = result.recovery_path.map(bus => {
            if (!busPositions[bus]) {
                throw new Error('Unknown bus in recovery path: ' + bus);
            }
            return new THREE.Vector3(...busPositions[bus]);
        });

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x00ff66
        });

        const recoveryLine = new THREE.Line(geometry, material);
        scene.add(recoveryLine);
        recoveryLines.push(recoveryLine);

        status.textContent =
            'Recovery route: ' + result.recovery_path.join(' ? ');
        status.style.color = '#00ff66';

    } catch (error) {
        console.error('Recovery route error:', error);
        status.textContent = 'Could not calculate recovery route.';
        status.style.color = '#ff5555';
    }
}
recoveryButton.addEventListener('click', showRecoveryRoute);
const monitoringPanel = document.createElement('div');

monitoringPanel.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    width: 250px;
    padding: 16px;
    background: rgba(20, 35, 48, 0.96);
    color: white;
    font-family: Arial, sans-serif;
    border: 1px solid #526777;
    border-radius: 8px;
    z-index: 10;
`;

monitoringPanel.innerHTML = `
    <h3 style="margin-top:0">Microgrid Monitoring</h3>
    <p>Solar Generation: <strong>80 kW</strong></p>
    <p>Load Demand: <strong>60 kW</strong></p>
    <p>Energy Balance: <strong style="color:#2ecc71">+20 kW</strong></p>
    <p>Battery Capacity: <strong>100 kWh</strong></p>
    <p>Battery SoC: <strong>79%</strong></p>
    <p>Battery Status: <strong style="color:#2ecc71">CHARGING</strong></p>
    <hr>
    <p style="color:#2ecc71">? System Operating Normally</p>
`;

document.body.appendChild(monitoringPanel);
monitoringPanel.innerHTML = `
    <h3 style="margin-top:0">Microgrid Monitoring</h3>
    <p>Solar Generation: <strong id="solarValue">Loading...</strong></p>
    <p>Load Demand: <strong id="loadValue">Loading...</strong></p>
    <p>Energy Balance: <strong id="balanceValue">Loading...</strong></p>
    <p>Battery Capacity: <strong id="capacityValue">Loading...</strong></p>
    <p>Battery SoC: <strong id="socValue">Loading...</strong></p>
    <p>Battery Status: <strong id="batteryValue">Loading...</strong></p>
    <p>Charging Power: <strong id="chargingValue">Loading...</strong></p>
    <p>Discharging Power: <strong id="dischargingValue">Loading...</strong></p>
    <p>Unserved Load: <strong id="unservedValue">Loading...</strong></p>
    <hr>
    <p id="systemValue">Connecting to Python backend...</p>
`;

async function updateMicrogridData() {
    try {
        const response = await fetch('http://127.0.0.1:8000/microgrid/status');

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();

        currentBatteryStatus = data.battery_status ?? 'IDLE';
        currentUnservedLoad = data.unserved_load_kw ?? 0;

        document.getElementById('solarValue').textContent =
            data.solar_generation_kw + ' kW';

        document.getElementById('loadValue').textContent =
            data.load_demand_kw + ' kW';

        document.getElementById('balanceValue').textContent =
            data.energy_balance_kw + ' kW';

        document.getElementById('capacityValue').textContent =
            data.battery_capacity_kwh + ' kWh';

        document.getElementById('socValue').textContent =
            data.battery_soc_percent + '%';

        document.getElementById('batteryValue').textContent =
            data.battery_status;

        document.getElementById('chargingValue').textContent =
            (data.charging_power_kw ?? 0) + ' kW';

        document.getElementById('dischargingValue').textContent =
            (data.discharging_power_kw ?? 0) + ' kW';

        document.getElementById('unservedValue').textContent =
            (data.unserved_load_kw ?? 0) + ' kW';

        document.getElementById('systemValue').textContent =
            '? System: ' + data.system_status;

        document.getElementById('systemValue').style.color =
            data.system_status === 'NORMAL' ? '#2ecc71' : '#ff5555';

    } catch (error) {
        document.getElementById('systemValue').textContent =
            'Backend connection failed';
        document.getElementById('systemValue').style.color = '#ff5555';
    }
}

updateMicrogridData();
setInterval(updateMicrogridData, 2000);
const inputPanel = document.createElement('div');

inputPanel.style.cssText = `
    position: fixed;
    top: 500px;
    right: 20px;
    width: 260px;
    padding: 16px;
    background: rgba(20, 35, 48, 0.96);
    color: white;
    font-family: Arial, sans-serif;
    border: 1px solid #526777;
    border-radius: 8px;
    z-index: 10;
`;

inputPanel.innerHTML = `
    <h3>Microgrid Controls</h3>
    <label>Solar Generation: <span id="solarInputValue">80</span> kW</label>
    <input id="solarInput" type="range" min="0" max="150" value="80" style="width:100%">
    <br><br>
    <label>Load Demand: <span id="loadInputValue">60</span> kW</label>
    <input id="loadInput" type="range" min="0" max="200" value="60" style="width:100%">
    <br><br>
    <button id="applyInputs">Apply Simulation</button>
    <p id="inputStatus">Ready</p>
`;

document.body.appendChild(inputPanel);
const solarInput = document.getElementById('solarInput');
const loadInput = document.getElementById('loadInput');

solarInput.addEventListener('input', () => {
    document.getElementById('solarInputValue').textContent = solarInput.value;
});

loadInput.addEventListener('input', () => {
    document.getElementById('loadInputValue').textContent = loadInput.value;
});

document.getElementById('applyInputs').addEventListener('click', async () => {
    const solar = Number(solarInput.value);
    const load = Number(loadInput.value);
    const status = document.getElementById('inputStatus');

    status.textContent = 'Calculating...';

    try {
        const url = new URL('http://127.0.0.1:8000/microgrid/step');
        url.searchParams.set('solar_generation_kw', solar);
        url.searchParams.set('load_demand_kw', load);

        const response = await fetch(url, { method: 'POST' });

        if (!response.ok) {
            throw new Error('Backend request failed');
        }

        const data = await response.json();

        currentBatteryStatus = data.battery_status ?? 'IDLE';
        currentUnservedLoad = data.unserved_load_kw ?? 0;

        document.getElementById('solarValue').textContent =
            data.solar_generation_kw + ' kW';

        document.getElementById('loadValue').textContent =
            data.load_demand_kw + ' kW';

        document.getElementById('balanceValue').textContent =
            data.energy_balance_kw + ' kW';

        document.getElementById('socValue').textContent =
            data.battery_soc_percent + '%';

        document.getElementById('batteryValue').textContent =
            data.battery_status;

        document.getElementById('chargingValue').textContent =
            (data.charging_power_kw ?? 0) + ' kW';

        document.getElementById('dischargingValue').textContent =
            (data.discharging_power_kw ?? 0) + ' kW';

        document.getElementById('unservedValue').textContent =
            (data.unserved_load_kw ?? 0) + ' kW';

        document.getElementById('systemValue').textContent =
            '? System: ' + data.system_status;

        document.getElementById('systemValue').style.color =
            data.unserved_load_kw > 0 ? '#ff5555' : '#2ecc71';

        status.textContent = 'Simulation updated successfully!';
    } catch (error) {
        status.textContent = 'Backend connection failed.';
        console.error(error);
    }
});
function createTransformer(position) {
    const transformer = new THREE.Group();

    const tankMaterial = new THREE.MeshStandardMaterial({
        color: 0x687780,
        metalness: 0.7,
        roughness: 0.35
    });

    const darkMetal = new THREE.MeshStandardMaterial({
        color: 0x26343b,
        metalness: 0.65,
        roughness: 0.4
    });

    const insulatorMaterial = new THREE.MeshStandardMaterial({
        color: 0xd8c49a,
        roughness: 0.65
    });

    // Concrete foundation
    const foundation = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.3, 3.2),
        new THREE.MeshStandardMaterial({ color: 0x737b80 })
    );
    foundation.position.y = 0.15;
    transformer.add(foundation);

    // Main transformer tank
    const tank = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.8, 1.8),
        tankMaterial
    );
    tank.position.y = 1.25;
    transformer.add(tank);

    // Cooling radiator panels on both sides
    for (const side of [-1, 1]) {
        for (let i = 0; i < 7; i++) {
            const radiator = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 1.45, 0.13),
                darkMetal
            );
            radiator.position.set(
                side * 1.38,
                1.25,
                -0.72 + i * 0.24
            );
            transformer.add(radiator);
        }
    }

    // High-voltage bushings and terminals
    for (let i = 0; i < 3; i++) {
        const x = -0.65 + i * 0.65;

        const bushing = new THREE.Mesh(
            new THREE.CylinderGeometry(0.16, 0.22, 0.75, 16),
            insulatorMaterial
        );
        bushing.position.set(x, 2.52, 0);
        transformer.add(bushing);

        const terminal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.07, 0.3, 12),
            tankMaterial
        );
        terminal.position.set(x, 3.02, 0);
        transformer.add(terminal);
    }

    // Front inspection panel
    const inspectionPanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.65, 0.06),
        darkMetal
    );
    inspectionPanel.position.set(0, 1.25, 0.94);
    transformer.add(inspectionPanel);

    // Oil level indicator
    const oilGauge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.12, 16),
        new THREE.MeshStandardMaterial({
            color: 0x2ecc71,
            emissive: 0x145a32
        })
    );
    oilGauge.rotation.x = Math.PI / 2;
    oilGauge.position.set(0, 1.65, 0.99);
    transformer.add(oilGauge);

    transformer.position.set(...position);
    transformer.userData.name = 'Power Transformer';
    transformer.userData.type = 'transformer';
    scene.add(transformer);

    const label = new Text();
    label.text = 'POWER TRANSFORMER';
    label.fontSize = 0.42;
    label.color = 0xffffff;
    label.anchorX = 'center';
    label.position.set(position[0], position[1] + 3.5, position[2]);
    scene.add(label);
    label.sync();

    return transformer;
}

createTransformer([11, 0, -12]);
*/




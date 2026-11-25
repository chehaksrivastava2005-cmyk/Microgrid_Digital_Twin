import * as THREE from 'three';

export function metal(color=0x87979f, roughness=0.38) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness });
}

function mesh(group, geometry, material, position=[0,0,0]) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(...position);
  item.castShadow = true;
  item.receiveShadow = true;
  group.add(item);
  return item;
}

export function tagObject(group, name, type, value) {
  group.userData.name=name; group.userData.type=type; group.userData.value=value;
  group.traverse(child=>{ if(child.isMesh) { child.userData.name=name; child.userData.type=type; child.userData.value=value; } });
  return group;
}

export function createSolarZone() {
  const group=new THREE.Group(); group.name='Solar Generation Zone';
  const frameMat=metal(0x8e9ba3,.45), cellMat=new THREE.MeshStandardMaterial({color:0x1d4d73,metalness:.55,roughness:.28});
  for(let array=0;array<3;array++) {
    const panel=new THREE.Group(); panel.position.set(-11+array*4.1,1.4,-5.3);
    panel.rotation.x=-0.32;
    mesh(panel,new THREE.BoxGeometry(3.7,.12,2.25),frameMat,[0,0,0]);
    for(let r=0;r<3;r++) for(let c=0;c<6;c++) {
      mesh(panel,new THREE.BoxGeometry(.54,.025,.60),cellMat,[-1.48+c*.59,.085,-.72+r*.72]);
    }
    group.add(panel);
  }
  const inverter=new THREE.Group(); inverter.position.set(-10.5,.75,-1.8);
  mesh(inverter,new THREE.BoxGeometry(2.4,1.8,.9),metal(0x4d6069),[0,.9,0]);
  mesh(inverter,new THREE.BoxGeometry(2.42,.08,.92),metal(0x202a30),[0,.2,.0]);
  for(let i=0;i<3;i++) mesh(inverter,new THREE.SphereGeometry(.07,8,8),new THREE.MeshBasicMaterial({color:i===0?0x2ecc71:0x5c6d73}),[-.7+i*.7,1.25,.46]);
  group.add(inverter);
  const combiner=new THREE.Group(); combiner.position.set(-7,.9,-1.8);
  mesh(combiner,new THREE.BoxGeometry(1.25,1.8,.7),metal(0x6d7a80),[0,.9,0]);
  for(let i=0;i<4;i++) mesh(combiner,new THREE.BoxGeometry(.38,.12,.04),metal(0xaeb6b8),[-.34+i*.22,1.15,.36]);
  group.add(combiner);
  return tagObject(group,'Solar PV','solar','PV generation');
}

export function createBatteryZone() {
  const group=new THREE.Group(); group.name='Battery Energy Storage';
  const container=new THREE.Group(); container.position.set(-2.8,.1,-5.2);
  mesh(container,new THREE.BoxGeometry(4.4,2.8,2.4),metal(0x29483f),[0,1.4,0]);
  mesh(container,new THREE.BoxGeometry(4.42,.12,2.42),metal(0x1c302a),[0,.18,0]);
  for(let i=0;i<5;i++) {
    mesh(container,new THREE.BoxGeometry(.68,1.55,.08),metal(i===2?0x6e9a80:0x3b5a50),[-1.65+i*.82,1.45,1.22]);
  }
  for(let i=0;i<8;i++) mesh(container,new THREE.BoxGeometry(.28,.10,.04),metal(0x9ba8a3),[-1.45+i*.38,1.95,1.27]);
  group.add(container);
  const pcs=new THREE.Group(); pcs.position.set(-2.8,.1,-1.5);
  mesh(pcs,new THREE.BoxGeometry(2.5,2.2,1),metal(0x4a5a60),[0,1.1,0]);
  for(let i=0;i<3;i++) mesh(pcs,new THREE.SphereGeometry(.09,10,10),new THREE.MeshBasicMaterial({color:0x29ca85}),[-.65+i*.65,1.7,.52]);
  group.add(pcs);
  return tagObject(group,'Battery Energy Storage','battery','100 kWh rated capacity');
}

export function createTransformerZone() {
  const group=new THREE.Group(); group.name='Transformer Substation';
  const transformer=new THREE.Group(); transformer.position.set(3.8,.1,-5.2);
  mesh(transformer,new THREE.BoxGeometry(4.5,.32,3.5),metal(0x747e82),[0,.16,0]);
  mesh(transformer,new THREE.BoxGeometry(2.7,2.1,2),metal(0x6f7d82),[0,1.25,0]);
  for(const side of [-1,1]) for(let i=0;i<7;i++) mesh(transformer,new THREE.BoxGeometry(.10,1.55,.14),metal(0x303d42),[side*1.52,1.25,-.82+i*.27]);
  const porcelain=metal(0xd2bd90,.55);
  for(let i=0;i<3;i++) {
    const x=-.75+i*.75;
    mesh(transformer,new THREE.CylinderGeometry(.16,.22,.85,12),porcelain,[x,2.72,0]);
    mesh(transformer,new THREE.CylinderGeometry(.07,.07,.32,10),metal(0x9aa6a8),[x,3.30,0]);
  }
  group.add(transformer);
  const breaker=new THREE.Group(); breaker.position.set(8.2,.1,-5.0);
  mesh(breaker,new THREE.BoxGeometry(3.2,.3,2.4),metal(0x747e82),[0,.15,0]);
  for(let i=0;i<3;i++) {
    mesh(breaker,new THREE.BoxGeometry(.24,2.1,.24),metal(0x2b393e),[-.9+i*.9,1.2,0]);
    mesh(breaker,new THREE.CylinderGeometry(.16,.16,.8,12),porcelain,[-.9+i*.9,2.55,0]);
  }
  group.add(breaker);
  for(let z of [-2.5,2.5]) {
    const cabinet=new THREE.Group(); cabinet.position.set(8.2,.1,z);
    mesh(cabinet,new THREE.BoxGeometry(2.1,2.5,1),metal(0x46545b),[0,1.25,0]);
    for(let i=0;i<4;i++) mesh(cabinet,new THREE.BoxGeometry(.32,.52,.06),metal(i%2?0xb55b45:0x69787e),[-.72+i*.48,1.35,.53]);
    group.add(cabinet);
  }
  return tagObject(group,'Power Transformer and Substation','transformer','Primary transformer zone');
}

export function createLoadZone() {
  const group=new THREE.Group(); group.name='Loads and Distribution';
  function building(position, color, labelName) {
    const b=new THREE.Group(); b.position.set(...position);
    mesh(b,new THREE.BoxGeometry(3.4,2.4,2.6),metal(color),[0,1.2,0]);
    mesh(b,new THREE.BoxGeometry(3.5,.18,2.7),metal(0x657178),[0,2.48,0]);
    for(let i=0;i<3;i++) mesh(b,new THREE.BoxGeometry(.52,.7,.05),new THREE.MeshStandardMaterial({color:0x1c2c32,roughness:.35}),[-1.05+i*1.05,1.35,1.33]);
    group.add(tagObject(b,labelName,'load','Load demand'));
  }
  building([8,-.1,3.8],0x59686b,'Industrial Load 1');
  building([-9,-.1,4.0],0x666a73,'Residential Load 2');
  const poles=new THREE.Group();
  for(let x=-6;x<=6;x+=4) {
    mesh(poles,new THREE.CylinderGeometry(.08,.11,4.8,10),metal(0x68757a),[x,2.4,7.1]);
    mesh(poles,new THREE.BoxGeometry(1.8,.12,.12),metal(0x68757a),[x,4.55,7.1]);
  }
  group.add(poles);
  return group;
}

export function createGroundAndInfrastructure() {
  const group=new THREE.Group();
  mesh(group,new THREE.BoxGeometry(34,.12,25),new THREE.MeshStandardMaterial({color:0x18232a,roughness:.78}),[0,-.08,1]);
  const road=new THREE.Mesh(new THREE.PlaneGeometry(33,3.2),new THREE.MeshStandardMaterial({color:0x253039,roughness:.9})); road.rotation.x=-Math.PI/2; road.position.set(0,.01,1.2); road.receiveShadow=true; group.add(road);
  for(let x=-15;x<16;x+=2.5) mesh(group,new THREE.BoxGeometry(.04,.025,2.7),new THREE.MeshBasicMaterial({color:0x8b7e63}),[x,.025,1.2]);
  return group;
}

import * as alt from 'alt';
import * as native from 'natives';

alt.setInterval(() => {

 // Passenger
    native.disableControlAction(0, 58, true);
    if (native.isDisabledControlJustPressed(0, 58)) {
        enterVehicleAsPassenger();
        return;
    }
    // Driver
    native.disableControlAction(0, 23, true);
    if (native.isDisabledControlJustPressed(0, 23)) {
        enterVehicleAsDriver();
        return;
    }
});

function enterVehicleAsDriver() {
    if (alt.Player.local.vehicle == null) {
        const player = alt.Player.local;

        var vehicles: alt.Vehicle[] = alt.Vehicle.all;
        var closestVehicle: alt.Vehicle;
        var playerPos = alt.Player.local.pos;

        var lastDistance: number = 5;

        alt.log('Searching through ' + vehicles.length + ' vehicles.');

        vehicles.forEach(vehicle => {
            var vehiclePosition = vehicle.pos;
            var distance = extension.Distance(playerPos, vehiclePosition);
            if (distance < lastDistance) {
                closestVehicle = vehicle;
                lastDistance = distance;
            }
        });

        var vehicle = closestVehicle.scriptID;

        alt.log('Vehicle: ' + vehicle);

        let boneFLDoor = native.getEntityBoneIndexByName(vehicle, 'door_dside_f');//Front Left
        const posFLDoor = native.getWorldPositionOfEntityBone(vehicle, boneFLDoor);
        const distFLDoor = distance({ x: posFLDoor.x, y: posFLDoor.y, z: posFLDoor.z }, alt.Player.local.pos);

        let boneFRDoor = native.getEntityBoneIndexByName(vehicle, 'door_pside_f');//Front Right
        const posFRDoor = native.getWorldPositionOfEntityBone(vehicle, boneFRDoor);
        const distFRDoor = distance({ x: posFRDoor.x, y: posFRDoor.y, z: posFRDoor.z }, alt.Player.local.pos);

        if (native.isVehicleSeatFree(vehicle, -1, false)) {
            let vehicleClass = native.getVehicleClass(vehicle);
            if (vehicleClass == 14) {
                // Boats
                native.setPedIntoVehicle(player.scriptID, vehicle, -1);
            } else {
                native.taskEnterVehicle(alt.Player.local.scriptID, vehicle, 5000, -1, 2, 1, 0);
            }
        } else {
            if (distFRDoor < distFLDoor) return;

            native.taskEnterVehicle(alt.Player.local.scriptID, vehicle, 5000, -1, 2, 1, 0);
        }
    }
}


function enterVehicleAsPassenger() {
    if (alt.Player.local.vehicle) return;

    var vehicles: alt.Vehicle[] = alt.Vehicle.all;
    var closestVehicle: alt.Vehicle;
    var playerPos = alt.Player.local.pos;

    var lastDistance: number = 5;

    alt.log('Searching through ' + vehicles.length + ' vehicles.');

    vehicles.forEach(vehicle => {
        var vehiclePosition = vehicle.pos;
        var distance = extension.Distance(playerPos, vehiclePosition);
        if (distance < lastDistance) {
            closestVehicle = vehicle;
            lastDistance = distance;
        }
    });

    var vehicle = closestVehicle.scriptID;

    alt.log('Vehicle: ' + vehicle);

    if (!native.isVehicleSeatFree(vehicle, 0, false) && !native.isVehicleSeatFree(vehicle, 1, false) && !native.isVehicleSeatFree(vehicle, 2, false)) return;

    let boneFRDoor = native.getEntityBoneIndexByName(vehicle, 'door_pside_f');//Front right
    const posFRDoor = native.getWorldPositionOfEntityBone(vehicle, boneFRDoor);
    const distFRDoor = distance({ x: posFRDoor.x, y: posFRDoor.y, z: posFRDoor.z }, alt.Player.local.pos);

    let boneBLDoor = native.getEntityBoneIndexByName(vehicle, 'door_dside_r');//Back Left
    const posBLDoor = native.getWorldPositionOfEntityBone(vehicle, boneBLDoor);
    const distBLDoor = distance({ x: posBLDoor.x, y: posBLDoor.y, z: posBLDoor.z }, alt.Player.local.pos);

    let boneBRDoor = native.getEntityBoneIndexByName(vehicle, 'door_pside_r');//Back Right
    const posBRDoor = native.getWorldPositionOfEntityBone(vehicle, boneBRDoor);
    const distBRDoor = distance({ x: posBRDoor.x, y: posBRDoor.y, z: posBRDoor.z }, alt.Player.local.pos);

    let minDist = Math.min(distFRDoor, distBLDoor, distBRDoor);

    if (minDist == distFRDoor) {
        if (minDist > 1.8) return;

        if (native.isVehicleSeatFree(vehicle, 0, false)) {
            native.taskEnterVehicle(alt.Player.local.scriptID, vehicle, 5000, 0, 2, 1, 0);
        } else if (native.isVehicleSeatFree(vehicle, 2, false)) {
            native.taskEnterVehicle(alt.Player.local.scriptID, vehicle, 5000, 2, 2, 1, 0);
        }
        else {
            return;
        }
    }
    if (minDist == distBLDoor) {
        if (minDist > 1.8) return;

        if (native.isVehicleSeatFree(vehicle, 1, false)) {
            native.taskEnterVehicle(alt.Player.local.scriptID, vehicle, 5000, 1, 2, 1, 0);
        } else {
            return;
        }
    }
    if (minDist == distBRDoor) {
        if (minDist > 1.8) return;

        if (native.isVehicleSeatFree(vehicle, 2, false)) {
            native.taskEnterVehicle(alt.Player.local.scriptID, vehicle, 5000, 2, 2, 1, 0);
        } else if (native.isVehicleSeatFree(vehicle, 0, false)) {
            native.taskEnterVehicle(alt.Player.local.scriptID, vehicle, 5000, 0, 2, 1, 0);
        } else {
            return;
        }
    }
}

function Distance(vector1: Vector3, vector2: Vector3) {
    if (vector1 === undefined || vector2 === undefined) {
        throw new Error('AddVector => vector1 or vector2 is undefined');
    }

    return Math.sqrt(
        Math.pow(vector1.x - vector2.x, 2) +
        Math.pow(vector1.y - vector2.y, 2) +
        Math.pow(vector1.z - vector2.z, 2)
    );
}
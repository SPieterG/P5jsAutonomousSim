
function loss(deviation, currentSteeringAngle, perviousSteeringAngle) {
    let deviationFactor = 1;
    let stabilityFactor = 1;

    return deviationFactor * deviation * deviation + stabilityFactor * (currentSteeringAngle - perviousSteeringAngle) * (currentSteeringAngle - perviousSteeringAngle);
}


function optimizerGridSearch(lookaheadDistanceRange, steeringGainRange, dGainRange, delayCompensationRange) {
    testController(50, 20, 3.6, 6, 0.02, 50).then((loss) => console.log(loss));
}


async function testController(carSteeringLatancy, carspeed, lookaheadDistance, steeringGain, dGain, delayCompensation) {
    let simulationFrequency = 100;

    let car = new Car(carSteeringLatancy * simulationFrequency / 1000, [50, 50, 250]);
    let controller = new AutonomousController(car, carspeed, lookaheadDistance, steeringGain, dGain, delayCompensation / 1000);
    
    let carLoss = simulateCar(car, controller, 1.0 / simulationFrequency, 2000);

    return carLoss;
}

function simulateCar(car, controller, timeStep, maxTime) {
    let simulationTime = 0;
    let previousSteeringAngle = 0;

    let carloss = 0;

    let current_time = 0;
    while (simulationTime < maxTime) {

        current_time += timeStep;

        controller.update(timeStep);
        car.update(timeStep);

        currentSteeringAngle = car.steeringAngle;

        carloss += loss(controller.deviationFromPath, controller.stearingAngle, previousSteeringAngle);

        previousSteeringAngle = controller.stearingAngle;

        simulationTime += timeStep;

        if(controller.progress > 0.94)
            break;
    }

    return carloss / simulationTime;
}



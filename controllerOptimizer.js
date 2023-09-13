
function loss(deviation, currentSteeringAngle, perviousSteeringAngle) {
    let deviationFactor = 1;
    let stabilityFactor = 5000;

    return deviationFactor * deviation * deviation + stabilityFactor * (currentSteeringAngle - perviousSteeringAngle) * (currentSteeringAngle - perviousSteeringAngle);
}

// optimizerGridSearch(carSteeringLatancyRange = [50], carspeedRange = [20], lookaheadDistanceRange = [2, 2.5, 3], steeringGainRange = [2, 3, 4], dGainRange = [0, 0.5, 1, 2, 5], delayCompensationRange = [50])

function optimizerGridSearch(carSteeringLatancyRange = [50], carspeedRange = [20], lookaheadDistanceRange = [3.6], steeringGainRange = [6], dGainRange = [0, 0.01, 0.02, 0.05, 0.1], delayCompensationRange = [50]) {

    for(let carSteeringLatancy of carSteeringLatancyRange){
        for(let carspeed of carspeedRange){
            for(let lookaheadDistance of lookaheadDistanceRange){
                for(let steeringGain of steeringGainRange){
                    for(let dGain of dGainRange){
                        for(let delayCompensation of delayCompensationRange){
                            setTimeout(()=>{
                                testController(carSteeringLatancy, carspeed, lookaheadDistance, steeringGain, dGain, delayCompensation).then((result) => console.log(result))
                            }, 0);
                        }
                    }
                }
            }
        }
    }
    
    // testController(50, 20, 3.6, 6, 0.02, 50).then((result) => console.log(result));
}


async function testController(carSteeringLatancy, carspeed, lookaheadDistance, steeringGain, dGain, delayCompensation) {
    let simulationFrequency = 100;

    let car = new Car(carSteeringLatancy * simulationFrequency / 1000, [50, 50, 250]);
    let controller = new AutonomousController(car, carspeed, lookaheadDistance, steeringGain, dGain, delayCompensation / 1000);
    
    let carLoss = simulateCar(car, controller, 1.0 / simulationFrequency, 2000);

    return {
        carLoss: carLoss['carloss'],
        deviation: carLoss['deviation'],
        instability: carLoss['instability'],
        carSteeringLatancy: carSteeringLatancy,
        carspeed: carspeed,
        lookaheadDistance: lookaheadDistance,
        steeringGain: steeringGain,
        dGain: dGain,
        delayCompensation: delayCompensation,
    };
}

function simulateCar(car, controller, timeStep, maxTime) {
    let simulationTime = 0;
    let previousSteeringAngle = 0;

    let carloss = 0;
    let deviation = 0;
    let instability = 0;

    let current_time = 0;
    while (simulationTime < maxTime) {

        current_time += timeStep;

        controller.update(timeStep);
        car.update(timeStep);

        deviation += controller.deviationFromPath * Math.sign(controller.stearingAngle) * timeStep;
        instability += 5000 * (controller.stearingAngle - previousSteeringAngle) * (controller.stearingAngle - previousSteeringAngle) * timeStep;
        carloss += loss(controller.deviationFromPath, controller.stearingAngle, previousSteeringAngle) * timeStep;

        previousSteeringAngle = controller.stearingAngle;

        simulationTime += timeStep;

        if(controller.progress > 0.94)
            break;
    }

    return {carloss: carloss / simulationTime, deviation: deviation / simulationTime, instability: instability / simulationTime};
}



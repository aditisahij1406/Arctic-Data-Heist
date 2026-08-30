import * as THREE from "three";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";


/* =====================================================
   ARCTIC DATA HEIST
   ===================================================== */


/* =====================================================
   GAME STATE
===================================================== */

let gameStarted = false;
let gameFinished = false;

let score = 0;
let dataRecovered = 0;

let timeLeft = 90;

let activePuzzle = null;

let timerStarted = false;


/* =====================================================
   THREE.JS SETUP
===================================================== */

const scene =
    new THREE.Scene();


scene.background =
    new THREE.Color(
        0x8fcbdc
    );


scene.fog =
    new THREE.Fog(
        0x8fcbdc,
        35,
        130
    );


const camera =
    new THREE.PerspectiveCamera(
        72,
        window.innerWidth /
        window.innerHeight,
        0.1,
        300
    );


camera.position.set(
    0,
    2,
    14
);


const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.shadowMap.enabled =
    true;


renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


document.body.appendChild(
    renderer.domElement
);


/* =====================================================
   LIGHTING
===================================================== */

const skyLight =
    new THREE.HemisphereLight(
        0xdaf7ff,
        0x35464e,
        2.2
    );


scene.add(
    skyLight
);


const sun =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );


sun.position.set(
    -30,
    60,
    20
);


sun.castShadow =
    true;


sun.shadow.mapSize.width =
    2048;


sun.shadow.mapSize.height =
    2048;


scene.add(
    sun
);


/* =====================================================
   GLB LOADER
===================================================== */

const loader =
    new GLTFLoader();


const loadedAssets =
    {};


function loadModel(
    filename
) {

    return new Promise(
        (resolve, reject) => {

            loader.load(

                `./assets/${filename}`,

                gltf => {

                    const model =
                        gltf.scene;


                    model.traverse(
                        object => {

                            if (
                                object.isMesh
                            ) {

                                object.castShadow =
                                    true;

                                object.receiveShadow =
                                    true;

                            }

                        }
                    );


                    loadedAssets[
                        filename
                    ] = model;


                    resolve(model);

                },

                undefined,

                error => {

                    console.error(
                        "Could not load:",
                        filename,
                        error
                    );

                    reject(error);

                }

            );

        }
    );

}


/* =====================================================
   CLONE MODEL
===================================================== */

function cloneAsset(
    filename
) {

    if (
        !loadedAssets[filename]
    ) {

        console.error(
            "Asset not loaded:",
            filename
        );

        return null;

    }


    const clone =
        loadedAssets[
            filename
        ].clone(true);


    clone.traverse(
        object => {

            if (
                object.isMesh
            ) {

                object.castShadow =
                    true;

                object.receiveShadow =
                    true;

            }

        }
    );


    return clone;
}


/* =====================================================
   LOAD ALL ASSETS
===================================================== */

const assetFiles = [

    "polar_bear.glb",
    "caribou.glb",
    "arctic_wolf.glb",

    "pine_tree.glb",
    "dead_tree.glb",

    "snow_rock.glb",
    "ice_chunk.glb",
    "ice_spire.glb",
    "snow_bush.glb",

    "crate.glb",
    "supply_box.glb",
    "fuel_barrel.glb",
    "lamp_post.glb",
    "satellite_dish.glb",

    "research_station.glb",
    "watch_tower.glb",
    "data_terminal.glb",

    "ice_wall.glb",
    "snow_ground.glb",
    "ice_cave.glb",
    "frozen_lake.glb",

    "mountain_bg.glb",
    "skybox.glb"

];


/* =====================================================
   ENVIRONMENT
===================================================== */

function addAsset(
    filename,
    position,
    scale = 1,
    rotationY = 0
) {

    const model =
        cloneAsset(filename);


    if (!model)
        return null;


    model.position.copy(
        position
    );


    model.scale.setScalar(
        scale
    );


    model.rotation.y =
        rotationY;


    scene.add(
        model
    );


    return model;
}


/* =====================================================
   ANIMATED SNOW
===================================================== */

const snowParticles =
    new THREE.BufferGeometry();


const snowCount =
    1600;


const snowPositions =
    new Float32Array(
        snowCount * 3
    );


for (
    let i = 0;
    i < snowCount;
    i++
) {

    snowPositions[
        i * 3
    ] =
        (Math.random() - .5) * 150;


    snowPositions[
        i * 3 + 1
    ] =
        Math.random() * 60;


    snowPositions[
        i * 3 + 2
    ] =
        (Math.random() - .5) * 150;

}


snowParticles.setAttribute(
    "position",
    new THREE.BufferAttribute(
        snowPositions,
        3
    )
);


const snowMaterial =
    new THREE.PointsMaterial({

        color: 0xffffff,

        size: .12,

        transparent: true,

        opacity: .75

    });


const snow =
    new THREE.Points(
        snowParticles,
        snowMaterial
    );


scene.add(
    snow
);


/* =====================================================
   GAME OBJECTS
===================================================== */

let polarBear;
let caribou;
let arcticWolf;

let researchStation;
let terminal;


/* =====================================================
   BUILD WORLD
===================================================== */

async function buildWorld() {

    try {

        await Promise.all(
            assetFiles.map(
                file =>
                    loadModel(file)
            )
        );

    } catch (error) {

        console.error(
            "Some assets failed to load.",
            error
        );

    }


    /* Ground */

    addAsset(
        "snow_ground.glb",
        new THREE.Vector3(
            0,
            -0.05,
            -20
        ),
        12
    );


    /* Second ground section */

    addAsset(
        "snow_ground.glb",
        new THREE.Vector3(
            0,
            -0.05,
            -65
        ),
        12
    );


    /* Mountains */

    addAsset(
        "mountain_bg.glb",
        new THREE.Vector3(
            0,
            0,
            -85
        ),
        4
    );


    /* Research station */

    researchStation =
        addAsset(
            "research_station.glb",
            new THREE.Vector3(
                0,
                0,
                -8
            ),
            1.5
        );


    /* Watch tower */

    addAsset(
        "watch_tower.glb",
        new THREE.Vector3(
            -16,
            0,
            -18
        ),
        1.5
    );


    /* Terminal */

    terminal =
        addAsset(
            "data_terminal.glb",
            new THREE.Vector3(
                0,
                0,
                -1
            ),
            1
        );


    /* Frozen lake */

    addAsset(
        "frozen_lake.glb",
        new THREE.Vector3(
            20,
            0,
            -35
        ),
        3
    );


    /* Ice cave */

    addAsset(
        "ice_cave.glb",
        new THREE.Vector3(
            25,
            0,
            -60
        ),
        2.5
    );


    /* Ice walls */

    addAsset(
        "ice_wall.glb",
        new THREE.Vector3(
            -28,
            0,
            -40
        ),
        3
    );


    addAsset(
        "ice_wall.glb",
        new THREE.Vector3(
            28,
            0,
            -45
        ),
        3,
        Math.PI
    );


    /* Nature */

    const treePositions = [

        [-22, -8],
        [22, -12],

        [-27, -25],
        [28, -25],

        [-20, -38],
        [20, -45],

        [-32, -55],
        [32, -60],

        [-15, -70],
        [15, -72]

    ];


    treePositions.forEach(
        position => {

            addAsset(
                "pine_tree.glb",

                new THREE.Vector3(
                    position[0],
                    0,
                    position[1]
                ),

                .9 +
                Math.random() * .4,

                Math.random() *
                Math.PI * 2

            );

        }
    );


    /* Rocks */

    const rocks = [

        [-8, -18],
        [8, -16],

        [-18, -30],
        [15, -30],

        [-8, -48],
        [10, -55],

        [-25, -68],
        [25, -70]

    ];


    rocks.forEach(
        position => {

            addAsset(
                "snow_rock.glb",

                new THREE.Vector3(
                    position[0],
                    0,
                    position[1]
                ),

                .7 +
                Math.random() * .6,

                Math.random() *
                Math.PI * 2

            );

        }
    );


    /* Ice spires */

    addAsset(
        "ice_spire.glb",
        new THREE.Vector3(
            -18,
            0,
            -52
        ),
        1.2
    );


    addAsset(
        "ice_spire.glb",
        new THREE.Vector3(
            18,
            0,
            -55
        ),
        1.4
    );


    /* Props */

    addAsset(
        "crate.glb",
        new THREE.Vector3(
            -5,
            0,
            -5
        ),
        .9
    );


    addAsset(
        "supply_box.glb",
        new THREE.Vector3(
            6,
            0,
            -7
        ),
        .9
    );


    addAsset(
        "fuel_barrel.glb",
        new THREE.Vector3(
            -7,
            0,
            -8
        ),
        .8
    );


    addAsset(
        "satellite_dish.glb",
        new THREE.Vector3(
            3,
            5,
            -8
        ),
        .7
    );


    /* Lamps */

    addAsset(
        "lamp_post.glb",
        new THREE.Vector3(
            -8,
            0,
            -3
        ),
        1
    );


    addAsset(
        "lamp_post.glb",
        new THREE.Vector3(
            8,
            0,
            -3
        ),
        1
    );


    addAsset(
        "lamp_post.glb",
        new THREE.Vector3(
            -10,
            0,
            -25
        ),
        1
    );


    addAsset(
        "lamp_post.glb",
        new THREE.Vector3(
            10,
            0,
            -25
        ),
        1
    );


    /* =================================================
       ANIMALS
    ================================================= */


    polarBear =
        addAsset(
            "polar_bear.glb",
            new THREE.Vector3(
                -12,
                0,
                -23
            ),
            1.6,
            Math.PI
        );


    caribou =
        addAsset(
            "caribou.glb",
            new THREE.Vector3(
                12,
                0,
                -38
            ),
            1.5,
            Math.PI
        );


    arcticWolf =
        addAsset(
            "arctic_wolf.glb",
            new THREE.Vector3(
                -8,
                0,
                -55
            ),
            1.4,
            Math.PI
        );


    polarBear.userData.animal =
        "polarBear";


    caribou.userData.animal =
        "caribou";


    arcticWolf.userData.animal =
        "wolf";


    polarBear.userData.completed =
        false;


    caribou.userData.completed =
        false;


    arcticWolf.userData.completed =
        false;


    /* Initial camera */

    camera.position.set(
        0,
        2,
        8
    );

}


/* =====================================================
   ANIMAL DATA
===================================================== */

const animalData = {

    polarBear: {

        name:
            "POLAR BEAR",

        question:
            "Which adaptation helps a polar bear survive extreme cold?",

        answers: [

            "Thick fur",

            "Large ears",

            "Thin skin"

        ],

        correct:
            0,

        fact:
            "DATA RECOVERED!\n\nPolar bears have thick fur and a layer of body fat that help reduce heat loss."

    },


    caribou: {

        name:
            "CARIBOU",

        question:
            "What is an important part of a caribou's winter diet?",

        answers: [

            "Lichens",

            "Seals",

            "Coral"

        ],

        correct:
            0,

        fact:
            "DATA RECOVERED!\n\nCaribou rely heavily on lichens during winter."

    },


    wolf: {

        name:
            "ARCTIC WOLF",

        question:
            "Where does the Arctic wolf primarily live?",

        answers: [

            "Arctic regions",

            "Tropical rainforest",

            "Desert"

        ],

        correct:
            0,

        fact:
            "DATA RECOVERED!\n\nArctic wolves are adapted to extremely cold northern environments."

    }

};


/* =====================================================
   FIRST PERSON CAMERA
===================================================== */

let yaw = 0;
let pitch = 0;

let mouseLocked = false;

const keys = {};


document.addEventListener(
    "mousemove",
    event => {

        if (
            !mouseLocked ||
            !gameStarted ||
            activePuzzle ||
            gameFinished
        ) {
            return;
        }


        yaw -=
            event.movementX *
            .0022;


        pitch -=
            event.movementY *
            .0022;


        const limit =
            Math.PI / 2 -
            .08;


        pitch =
            Math.max(
                -limit,
                Math.min(
                    limit,
                    pitch
                )
            );


        camera.rotation.order =
            "YXZ";


        camera.rotation.y =
            yaw;


        camera.rotation.x =
            pitch;

    }
);


/* =====================================================
   START
===================================================== */

document
    .getElementById(
        "startButton"
    )
    .addEventListener(
        "click",
        async () => {

            document
                .getElementById(
                    "startScreen"
                )
                .style.display =
                "none";


            gameStarted =
                true;


            if (
                !timerStarted
            ) {

                startTimer();

            }


            document.body.requestPointerLock();


        }
    );


document.addEventListener(
    "pointerlockchange",
    () => {

        mouseLocked =
            document.pointerLockElement ===
            document.body;

    }
);


/* =====================================================
   KEYBOARD
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        keys[event.code] =
            true;


        if (
            event.code ===
            "KeyE"
        ) {

            investigate();

        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        keys[event.code] =
            false;

    }
);


/* =====================================================
   MOVEMENT
===================================================== */

const velocity =
    new THREE.Vector3();


const forward =
    new THREE.Vector3();


const right =
    new THREE.Vector3();


function updateMovement(
    delta
) {

    if (
        !gameStarted ||
        activePuzzle ||
        gameFinished
    ) {
        return;
    }


    let forwardAmount =
        0;

    let rightAmount =
        0;


    if (
        keys["KeyW"]
    )
        forwardAmount += 1;


    if (
        keys["KeyS"]
    )
        forwardAmount -= 1;


    if (
        keys["KeyD"]
    )
        rightAmount += 1;


    if (
        keys["KeyA"]
    )
        rightAmount -= 1;


    if (
        forwardAmount === 0 &&
        rightAmount === 0
    ) {

        return;

    }


    forward.set(
        0,
        0,
        -1
    );


    right.set(
        1,
        0,
        0
    );


    forward.applyQuaternion(
        camera.quaternion
    );


    right.applyQuaternion(
        camera.quaternion
    );


    forward.y =
        0;


    right.y =
        0;


    forward.normalize();
    right.normalize();


    velocity.set(
        0,
        0,
        0
    );


    velocity.addScaledVector(
        forward,
        forwardAmount
    );


    velocity.addScaledVector(
        right,
        rightAmount
    );


    velocity.normalize();


    const speed =
        7;


    camera.position.addScaledVector(
        velocity,
        speed * delta
    );


    /* Keep player inside map */

    camera.position.x =
        THREE.MathUtils.clamp(
            camera.position.x,
            -35,
            35
        );


    camera.position.z =
        THREE.MathUtils.clamp(
            camera.position.z,
            -75,
            15
        );


    camera.position.y =
        2;

}


/* =====================================================
   FIND NEAREST ANIMAL
===================================================== */

function getNearestAnimal() {

    const animals = [

        polarBear,
        caribou,
        arcticWolf

    ];


    let nearest =
        null;


    let distance =
        Infinity;


    animals.forEach(
        animal => {

            if (
                !animal ||
                animal.userData.completed
            ) {
                return;
            }


            const d =
                camera.position.distanceTo(
                    animal.position
                );


            if (
                d < distance
            ) {

                distance =
                    d;

                nearest =
                    animal;

            }

        }
    );


    return {
        animal: nearest,
        distance: distance
    };

}


/* =====================================================
   INTERACTION UI
===================================================== */

function updateInteraction() {

    if (
        !gameStarted ||
        activePuzzle ||
        gameFinished
    ) {

        document
            .getElementById(
                "interaction"
            )
            .classList.remove(
                "visible"
            );

        return;

    }


    const result =
        getNearestAnimal();


    if (
        result.animal &&
        result.distance < 7
    ) {

        document
            .getElementById(
                "interaction"
            )
            .classList.add(
                "visible"
            );

    } else {

        document
            .getElementById(
                "interaction"
            )
            .classList.remove(
                "visible"
            );

    }

}


/* =====================================================
   INVESTIGATE
===================================================== */

function investigate() {

    if (
        !gameStarted ||
        activePuzzle ||
        gameFinished
    ) {

        return;

    }


    const result =
        getNearestAnimal();


    if (
        result.animal &&
        result.distance < 7
    ) {

        openPuzzle(
            result.animal.userData.animal
        );

    }

}


/* =====================================================
   PUZZLE
===================================================== */

function openPuzzle(
    id
) {

    activePuzzle =
        id;


    document.exitPointerLock();


    const info =
        animalData[id];


    document
        .getElementById(
            "animalName"
        )
        .textContent =
        info.name;


    document
        .getElementById(
            "question"
        )
        .textContent =
        info.question;


    document
        .getElementById(
            "fact"
        )
        .textContent =
        "";


    document
        .getElementById(
            "continueButton"
        )
        .style.display =
        "none";


    const answerBox =
        document.getElementById(
            "answers"
        );


    answerBox.innerHTML =
        "";


    info.answers.forEach(
        (answer, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "answer";


            button.textContent =
                `${String.fromCharCode(65 + index)}  ${answer}`;


            button.onclick =
                () => {

                    chooseAnswer(
                        index,
                        info,
                        id
                    );

                };


            answerBox.appendChild(
                button
            );

        }
    );


    document
        .getElementById(
            "puzzle"
        )
        .style.display =
        "flex";

}


/* =====================================================
   ANSWER
===================================================== */

function chooseAnswer(
    index,
    info,
    id
) {

    const fact =
        document.getElementById(
            "fact"
        );


    if (
        index === info.correct
    ) {

        score +=
            100;


        dataRecovered++;


        document
            .getElementById(
                "score"
            )
            .textContent =
            score;


        document
            .getElementById(
                "data"
            )
            .textContent =
            dataRecovered;


        fact.textContent =
            info.fact;


        document
            .getElementById(
                "answers"
            )
            .innerHTML =
            "";


        const continueButton =
            document.getElementById(
                "continueButton"
            );


        continueButton.style.display =
            "inline-block";


        if (
            dataRecovered >= 3
        ) {

            continueButton.textContent =
                "FINISH MISSION";

        }


        const animals = [

            polarBear,
            caribou,
            arcticWolf

        ];


        const target =
            animals.find(
                animal =>
                    animal &&
                    animal.userData.animal ===
                    id
            );


        if (target) {

            target.userData.completed =
                true;

        }

    } else {

        fact.textContent =
            "✕ INCORRECT — TRY AGAIN";

    }

}


/* =====================================================
   CONTINUE
===================================================== */

document
    .getElementById(
        "continueButton"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "puzzle"
                )
                .style.display =
                "none";


            if (
                dataRecovered >= 3
            ) {

                finishGame();

                return;

            }


            activePuzzle =
                null;


            document.body.requestPointerLock();

        }
    );


/* =====================================================
   TIMER
===================================================== */

function startTimer() {

    if (
        timerStarted
    ) {

        return;

    }


    timerStarted =
        true;


    const interval =
        setInterval(
            () => {

                if (
                    gameFinished
                ) {

                    clearInterval(
                        interval
                    );

                    return;

                }


                timeLeft--;


                document
                    .getElementById(
                        "time"
                    )
                    .textContent =
                    timeLeft;


                if (
                    timeLeft <= 0
                ) {

                    clearInterval(
                        interval
                    );


                    finishGame();

                }

            },
            1000
        );

}


/* =====================================================
   FINISH
===================================================== */

function finishGame() {

    gameFinished =
        true;


    activePuzzle =
        null;


    document.exitPointerLock();


    document
        .getElementById(
            "finalScore"
        )
        .textContent =
        `SCORE ${score}  •  DATA RECOVERED ${dataRecovered}/3`;


    document
        .getElementById(
            "gameOver"
        )
        .style.display =
        "flex";

}


/* =====================================================
   SNOW ANIMATION
===================================================== */

function updateSnow(
    delta
) {

    const positions =
        snow.geometry.attributes
            .position.array;


    for (
        let i = 0;
        i < snowCount;
        i++
    ) {

        positions[
            i * 3 + 1
        ] -=
            delta * 2;


        positions[
            i * 3
        ] +=
            Math.sin(
                Date.now() * .0005 +
                i
            ) *
            delta *
            .15;


        if (
            positions[
                i * 3 + 1
            ] < 0
        ) {

            positions[
                i * 3 + 1
            ] = 60;

        }

    }


    snow.geometry.attributes
        .position.needsUpdate =
        true;

}


/* =====================================================
   GAME LOOP
===================================================== */

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            .05
        );


    updateMovement(
        delta
    );


    updateInteraction();


    updateSnow(
        delta
    );


    renderer.render(
        scene,
        camera
    );

}


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


/* =====================================================
   START GAME ENGINE
===================================================== */

buildWorld();

animate();

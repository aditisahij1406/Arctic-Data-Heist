import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


/* =========================================================
   ARCTIC DATA HEIST
   Clean GLB scene
   ========================================================= */


/* =========================================================
   GAME STATE
========================================================= */

let gameStarted = false;
let gameFinished = false;

let activePuzzle = null;

let score = 0;
let dataRecovered = 0;
let timeLeft = 90;
let timerStarted = false;


/* =========================================================
   THREE.JS
========================================================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x9dd9e8);

scene.fog = new THREE.Fog(
    0x9dd9e8,
    35,
    115
);


const camera = new THREE.PerspectiveCamera(
    72,
    window.innerWidth / window.innerHeight,
    0.1,
    300
);

camera.position.set(
    0,
    2,
    10
);


const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

document.body.appendChild(
    renderer.domElement
);


/* =========================================================
   LIGHTING
========================================================= */

const hemiLight =
    new THREE.HemisphereLight(
        0xdff8ff,
        0x52636b,
        2.5
    );

scene.add(hemiLight);


const sun =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );

sun.position.set(
    -30,
    50,
    20
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

scene.add(sun);


/* =========================================================
   PROCEDURAL SNOW GROUND
========================================================= */

const groundMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xeaf8fb,
        roughness: 0.95
    });


const ground =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            140,
            140
        ),
        groundMaterial
    );


ground.rotation.x =
    -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);


/* =========================================================
   ICE PATCHES
========================================================= */

function createIcePatch(
    x,
    z,
    width,
    depth
) {

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x9bdbea,
            roughness: 0.2,
            metalness: 0.05
        });


    const patch =
        new THREE.Mesh(
            new THREE.CircleGeometry(
                1,
                32
            ),
            material
        );


    patch.scale.set(
        width,
        depth,
        1
    );


    patch.rotation.x =
        -Math.PI / 2;


    patch.position.set(
        x,
        0.015,
        z
    );


    scene.add(patch);

}


createIcePatch(
    17,
    -35,
    11,
    6
);

createIcePatch(
    22,
    -48,
    8,
    5
);


/* =========================================================
   SIMPLE MOUNTAINS
   ========================================================= */

function createMountain(
    x,
    z,
    radius,
    height
) {

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xb7d5dc,
            roughness: 1
        });


    const mountain =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                radius,
                height,
                7
            ),
            material
        );


    mountain.position.set(
        x,
        height / 2,
        z
    );


    mountain.castShadow = true;

    scene.add(
        mountain
    );

}


createMountain(
    -38,
    -70,
    18,
    32
);

createMountain(
    -5,
    -82,
    24,
    40
);

createMountain(
    35,
    -72,
    19,
    34
);


/* =========================================================
   SNOW PARTICLES
========================================================= */

const snowCount = 1500;

const snowGeometry =
    new THREE.BufferGeometry();

const snowPositions =
    new Float32Array(
        snowCount * 3
    );


for (
    let i = 0;
    i < snowCount;
    i++
) {

    snowPositions[i * 3] =
        (Math.random() - 0.5) * 120;

    snowPositions[i * 3 + 1] =
        Math.random() * 50;

    snowPositions[i * 3 + 2] =
        (Math.random() - 0.5) * 120;

}


snowGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        snowPositions,
        3
    )
);


const snowMaterial =
    new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.13,
        transparent: true,
        opacity: 0.8
    });


const snow =
    new THREE.Points(
        snowGeometry,
        snowMaterial
    );


scene.add(snow);


/* =========================================================
   GLB LOADER
========================================================= */

const loader =
    new GLTFLoader();


const assets = {};


const assetNames = [

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
    "ice_cave.glb",
    "frozen_lake.glb"

];


function loadAsset(filename) {

    return new Promise(
        (resolve, reject) => {

            loader.load(

                `./${filename}`,

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


                                if (
                                    object.material
                                ) {

                                    object.material
                                        .side =
                                        THREE.FrontSide;

                                }

                            }

                        }
                    );


                    assets[filename] =
                        model;


                    console.log(
                        "LOADED:",
                        filename
                    );


                    resolve(model);

                },

                undefined,

                error => {

                    console.error(
                        "FAILED:",
                        filename,
                        error
                    );


                    reject(error);

                }

            );

        }
    );

}


/* =========================================================
   MODEL UTILITIES
========================================================= */


/*
    Normalize model size.

    This looks at the REAL dimensions of the GLB
    instead of assuming every model is the same size.
*/

function normalizeModel(
    model,
    targetSize
) {

    const box =
        new THREE.Box3()
            .setFromObject(model);


    const size =
        new THREE.Vector3();


    box.getSize(size);


    const largest =
        Math.max(
            size.x,
            size.y,
            size.z
        );


    if (
        largest <= 0
    ) {

        return;

    }


    const scale =
        targetSize / largest;


    model.scale.setScalar(
        scale
    );

}


/*
    Put model on the snow.

    This compensates for GLBs whose origin
    is somewhere in the middle.
*/

function groundModel(
    model
) {

    model.updateMatrixWorld(
        true
    );


    const box =
        new THREE.Box3()
            .setFromObject(model);


    model.position.y -=
        box.min.y;


    model.updateMatrixWorld(
        true
    );

}


/*
    Create a clean instance of an asset.
*/

function createAsset(
    filename,
    position,
    targetSize,
    rotation = null
) {

    const source =
        assets[filename];


    if (!source) {

        console.warn(
            "Missing asset:",
            filename
        );

        return null;

    }


    const model =
        source.clone(true);


    normalizeModel(
        model,
        targetSize
    );


    if (
        rotation
    ) {

        model.rotation.set(
            rotation.x || 0,
            rotation.y || 0,
            rotation.z || 0
        );

    }


    model.position.copy(
        position
    );


    scene.add(
        model
    );


    groundModel(
        model
    );


    return model;

}


/* =========================================================
   WORLD OBJECTS
========================================================= */

let polarBear = null;
let caribou = null;
let arcticWolf = null;

let terminal = null;


/* =========================================================
   BUILD THE WORLD
========================================================= */

async function buildWorld() {

    console.log(
        "Loading Arctic assets..."
    );


    /*
        Load the actual assets.

        skybox, mountain_bg and snow_ground
        are deliberately NOT loaded because
        we're making those parts ourselves.
    */

    await Promise.allSettled(
        assetNames.map(
            loadAsset
        )
    );


    console.log(
        "Asset loading complete."
    );


    /* =====================================================
       RESEARCH STATION
    ===================================================== */

    createAsset(
        "research_station.glb",
        new THREE.Vector3(
            0,
            0,
            -9
        ),
        14
    );


    /* =====================================================
       DATA TERMINAL
    ===================================================== */

    terminal =
        createAsset(
            "data_terminal.glb",
            new THREE.Vector3(
                0,
                0,
                1
            ),
            3
        );


    /* =====================================================
       WATCH TOWER
    ===================================================== */

    createAsset(
        "watch_tower.glb",
        new THREE.Vector3(
            -16,
            0,
            -18
        ),
        9
    );


    /* =====================================================
       SATELLITE
    ===================================================== */

    createAsset(
        "satellite_dish.glb",
        new THREE.Vector3(
            5,
            0,
            -13
        ),
        5
    );


    /* =====================================================
       LAMP POSTS
    ===================================================== */

    createAsset(
        "lamp_post.glb",
        new THREE.Vector3(
            -7,
            0,
            -2
        ),
        4
    );


    createAsset(
        "lamp_post.glb",
        new THREE.Vector3(
            7,
            0,
            -2
        ),
        4
    );


    createAsset(
        "lamp_post.glb",
        new THREE.Vector3(
            -12,
            0,
            -24
        ),
        4
    );


    createAsset(
        "lamp_post.glb",
        new THREE.Vector3(
            12,
            0,
            -29
        ),
        4
    );


    /* =====================================================
       TREES

       Your tree looked sideways in the previous version,
       so we explicitly rotate it here.
    ===================================================== */

    const trees = [

        [-23, -10, 5],
        [22, -10, 5],

        [-25, -25, 5],
        [25, -24, 5],

        [-21, -39, 5],
        [23, -43, 5],

        [-27, -52, 5],
        [27, -56, 5],

        [-16, -67, 5],
        [16, -69, 5]

    ];


    trees.forEach(
        ([x, z, size]) => {

            createAsset(

                "pine_tree.glb",

                new THREE.Vector3(
                    x,
                    0,
                    z
                ),

                size,

                {
                    x: 0,
                    y: 0,
                    z: 0
                }

            );

        }
    );


    /* =====================================================
       DEAD TREES
    ===================================================== */

    createAsset(
        "dead_tree.glb",
        new THREE.Vector3(
            -31,
            0,
            -35
        ),
        5,
        {
            x: 0,
            y: 0.5,
            z: 0
        }
    );


    createAsset(
        "dead_tree.glb",
        new THREE.Vector3(
            31,
            0,
            -46
        ),
        5,
        {
            x: 0,
            y: -0.7,
            z: 0
        }
    );


    /* =====================================================
       ROCKS
    ===================================================== */

    const rocks = [

        [-9, -19],
        [9, -20],

        [-19, -31],
        [17, -32],

        [-12, -46],
        [12, -51],

        [-26, -61],
        [26, -65]

    ];


    rocks.forEach(
        ([x, z]) => {

            createAsset(
                "snow_rock.glb",

                new THREE.Vector3(
                    x,
                    0,
                    z
                ),

                3 +
                Math.random() * 2,

                {
                    x: 0,
                    y:
                        Math.random() *
                        Math.PI * 2,
                    z: 0
                }
            );

        }
    );


    /* =====================================================
       ICE SPIRES
    ===================================================== */

    createAsset(
        "ice_spire.glb",
        new THREE.Vector3(
            -17,
            0,
            -48
        ),
        5
    );


    createAsset(
        "ice_spire.glb",
        new THREE.Vector3(
            18,
            0,
            -53
        ),
        5
    );


    /* =====================================================
       ICE WALLS
    ===================================================== */

    createAsset(
        "ice_wall.glb",
        new THREE.Vector3(
            -28,
            0,
            -48
        ),
        9
    );


    createAsset(
        "ice_wall.glb",
        new THREE.Vector3(
            28,
            0,
            -58
        ),
        9,
        {
            x: 0,
            y: Math.PI,
            z: 0
        }
    );


    /* =====================================================
       FROZEN LAKE
    ===================================================== */

    createAsset(
        "frozen_lake.glb",
        new THREE.Vector3(
            20,
            0,
            -39
        ),
        18
    );


    /* =====================================================
       ICE CAVE
    ===================================================== */

    createAsset(
        "ice_cave.glb",
        new THREE.Vector3(
            27,
            0,
            -63
        ),
        12
    );


    /* =====================================================
       CAMP PROPS
    ===================================================== */

    createAsset(
        "crate.glb",
        new THREE.Vector3(
            -5,
            0,
            -2
        ),
        2.5
    );


    createAsset(
        "supply_box.glb",
        new THREE.Vector3(
            6,
            0,
            -3
        ),
        2.5
    );


    createAsset(
        "fuel_barrel.glb",
        new THREE.Vector3(
            -7,
            0,
            -4
        ),
        2.2
    );


    /* =====================================================
       ANIMALS
    ===================================================== */

    polarBear =
        createAsset(
            "polar_bear.glb",

            new THREE.Vector3(
                -11,
                0,
                -23
            ),

            4.5,

            {
                x: 0,
                y: Math.PI,
                z: 0
            }
        );


    caribou =
        createAsset(
            "caribou.glb",

            new THREE.Vector3(
                12,
                0,
                -38
            ),

            4.5,

            {
                x: 0,
                y: Math.PI,
                z: 0
            }
        );


    arcticWolf =
        createAsset(
            "arctic_wolf.glb",

            new THREE.Vector3(
                -9,
                0,
                -56
            ),

            3.8,

            {
                x: 0,
                y: Math.PI,
                z: 0
            }
        );


    /*
        Store interaction data.
    */

    if (polarBear) {

        polarBear.userData.animal =
            "polarBear";

        polarBear.userData.completed =
            false;

    }


    if (caribou) {

        caribou.userData.animal =
            "caribou";

        caribou.userData.completed =
            false;

    }


    if (arcticWolf) {

        arcticWolf.userData.animal =
            "wolf";

        arcticWolf.userData.completed =
            false;

    }


    console.log(
        "ARCTIC WORLD READY"
    );

}


/* =========================================================
   ANIMAL DATA
========================================================= */

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

        correct: 0,

        fact:
            "Polar bears have thick fur and body fat that help reduce heat loss."

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

        correct: 0,

        fact:
            "Caribou rely heavily on lichens during winter."

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

        correct: 0,

        fact:
            "Arctic wolves are adapted to extremely cold northern environments."

    }

};


/* =========================================================
   FIRST PERSON CAMERA
========================================================= */

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
            0.0022;


        pitch -=
            event.movementY *
            0.0022;


        const limit =
            Math.PI / 2 - 0.08;


        pitch =
            THREE.MathUtils.clamp(
                pitch,
                -limit,
                limit
            );


        camera.rotation.order =
            "YXZ";


        camera.rotation.y =
            yaw;


        camera.rotation.x =
            pitch;

    }
);


/* =========================================================
   START BUTTON
========================================================= */

document
    .getElementById(
        "startButton"
    )
    .addEventListener(
        "click",
        () => {

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


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        keys[event.code] =
            true;


        if (
            event.code === "KeyE"
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


/* =========================================================
   MOVEMENT
========================================================= */

const movement =
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
        gameFinished ||
        activePuzzle
    ) {

        return;

    }


    let forwardAmount = 0;
    let rightAmount = 0;


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


    forward.y = 0;
    right.y = 0;


    forward.normalize();
    right.normalize();


    movement.set(
        0,
        0,
        0
    );


    movement.addScaledVector(
        forward,
        forwardAmount
    );


    movement.addScaledVector(
        right,
        rightAmount
    );


    movement.normalize();


    const speed = 7;


    camera.position.addScaledVector(
        movement,
        speed * delta
    );


    /*
        Keep player in our small map.
    */

    camera.position.x =
        THREE.MathUtils.clamp(
            camera.position.x,
            -34,
            34
        );


    camera.position.z =
        THREE.MathUtils.clamp(
            camera.position.z,
            -74,
            12
        );


    camera.position.y = 2;

}


/* =========================================================
   NEAREST ANIMAL
========================================================= */

function getNearestAnimal() {

    const animals = [
        polarBear,
        caribou,
        arcticWolf
    ];


    let nearest = null;
    let distance = Infinity;


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

                distance = d;
                nearest = animal;

            }

        }
    );


    return {
        animal: nearest,
        distance: distance
    };

}


/* =========================================================
   INTERACTION PROMPT
========================================================= */

function updateInteraction() {

    const interaction =
        document.getElementById(
            "interaction"
        );


    if (
        !gameStarted ||
        activePuzzle ||
        gameFinished
    ) {

        interaction.classList.remove(
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

        interaction.classList.add(
            "visible"
        );

    } else {

        interaction.classList.remove(
            "visible"
        );

    }

}


/* =========================================================
   INVESTIGATE
========================================================= */

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


/* =========================================================
   PUZZLE
========================================================= */

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


    const answers =
        document.getElementById(
            "answers"
        );


    answers.innerHTML = "";


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

                    answerQuestion(
                        index,
                        info,
                        id
                    );

                };


            answers.appendChild(
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


/* =========================================================
   ANSWER
========================================================= */

function answerQuestion(
    index,
    info,
    id
) {

    const fact =
        document.getElementById(
            "fact"
        );


    if (
        index !== info.correct
    ) {

        fact.textContent =
            "✕ INCORRECT — TRY AGAIN";

        return;

    }


    score += 100;

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
        "✓ DATA RECOVERED\n\n" +
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


    const animal =
        animals.find(
            a =>
                a &&
                a.userData.animal === id
        );


    if (animal) {

        animal.userData.completed =
            true;

    }

}


/* =========================================================
   CONTINUE
========================================================= */

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


/* =========================================================
   TIMER
========================================================= */

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


/* =========================================================
   FINISH
========================================================= */

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


/* =========================================================
   SNOW UPDATE
========================================================= */

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


        if (
            positions[
                i * 3 + 1
            ] < 0
        ) {

            positions[
                i * 3 + 1
            ] = 50;

        }

    }


    snow.geometry.attributes
        .position.needsUpdate =
        true;

}


/* =========================================================
   GAME LOOP
========================================================= */

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
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


/* =========================================================
   RESIZE
========================================================= */

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


/* =========================================================
   START
========================================================= */

buildWorld();

animate();

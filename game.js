import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


/* =====================================================
   ARCTIC DATA HEIST
===================================================== */

let gameStarted = false;
let gameFinished = false;
let activePuzzle = null;

let score = 0;
let dataRecovered = 0;
let timeLeft = 90;

let polarBear = null;
let caribou = null;
let arcticWolf = null;


/* =====================================================
   SCENE
===================================================== */

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x9bd9e8);

scene.fog =
    new THREE.Fog(
        0x9bd9e8,
        40,
        120
    );


const camera =
    new THREE.PerspectiveCamera(
        70,
        innerWidth / innerHeight,
        0.1,
        200
    );


/*
   IMPORTANT:
   Start the player farther away from the station.
*/

camera.position.set(
    0,
    2,
    12
);

camera.rotation.set(
    0,
    0,
    0
);


/* =====================================================
   RENDERER
===================================================== */

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    innerWidth,
    innerHeight
);

renderer.setPixelRatio(
    Math.min(
        devicePixelRatio,
        2
    )
);

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

document.body.appendChild(
    renderer.domElement
);


/* =====================================================
   LIGHT
===================================================== */

scene.add(
    new THREE.HemisphereLight(
        0xe7fbff,
        0x607078,
        2.5
    )
);


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

scene.add(sun);


/* =====================================================
   GROUND
===================================================== */

const ground =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            140,
            140
        ),

        new THREE.MeshStandardMaterial({
            color: 0xeaf8fb,
            roughness: 1
        })

    );


ground.rotation.x =
    -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);


/* =====================================================
   ICE
===================================================== */

function icePatch(
    x,
    z,
    sx,
    sz
) {

    const mesh =
        new THREE.Mesh(

            new THREE.CircleGeometry(
                1,
                32
            ),

            new THREE.MeshStandardMaterial({
                color: 0x91d8e8,
                roughness: 0.25,
                metalness: 0.05
            })

        );


    mesh.scale.set(
        sx,
        sz,
        1
    );

    mesh.rotation.x =
        -Math.PI / 2;

    mesh.position.set(
        x,
        0.02,
        z
    );

    scene.add(mesh);

}


icePatch(
    17,
    -35,
    12,
    6
);

icePatch(
    22,
    -50,
    8,
    5
);


/* =====================================================
   MOUNTAINS
===================================================== */

function mountain(
    x,
    z,
    size,
    height
) {

    const mesh =
        new THREE.Mesh(

            new THREE.ConeGeometry(
                size,
                height,
                7
            ),

            new THREE.MeshStandardMaterial({
                color: 0xb7d3da,
                roughness: 1
            })

        );


    mesh.position.set(
        x,
        height / 2,
        z
    );

    mesh.castShadow = true;

    scene.add(mesh);

}


mountain(
    -40,
    -80,
    18,
    32
);

mountain(
    0,
    -95,
    25,
    42
);

mountain(
    40,
    -82,
    20,
    35
);


/* =====================================================
   SNOW
===================================================== */

const snowCount = 1200;

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
        (Math.random() - .5) * 120;

    snowPositions[i * 3 + 1] =
        Math.random() * 45;

    snowPositions[i * 3 + 2] =
        (Math.random() - .5) * 120;

}


snowGeometry.setAttribute(
    "position",

    new THREE.BufferAttribute(
        snowPositions,
        3
    )
);


const snow =
    new THREE.Points(

        snowGeometry,

        new THREE.PointsMaterial({
            color: 0xffffff,
            size: .12,
            transparent: true,
            opacity: .75
        })

    );


scene.add(snow);


/* =====================================================
   GLB LOADER
===================================================== */

const loader =
    new GLTFLoader();

const assets = {};


/*
   ONLY LOAD THE ASSETS WE KNOW
   WE WANT TO USE.
*/

const files = [

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
    "lamp_post.glb"

];


function loadFile(
    filename
) {

    return new Promise(
        resolve => {

            loader.load(

                `./${filename}`,

                gltf => {

                    assets[filename] =
                        gltf.scene;

                    console.log(
                        "Loaded:",
                        filename
                    );

                    resolve();

                },

                undefined,

                error => {

                    console.error(
                        "Failed:",
                        filename,
                        error
                    );

                    resolve();

                }

            );

        }
    );

}


/* =====================================================
   MODEL SCALING
===================================================== */

function addModel(
    filename,
    x,
    z,
    size,
    rotationY = 0
) {

    if (
        !assets[filename]
    ) {

        console.warn(
            "Missing:",
            filename
        );

        return null;

    }


    const model =
        assets[filename].clone(
            true
        );


    /*
       Calculate dimensions BEFORE
       adding the model.
    */

    const box =
        new THREE.Box3()
            .setFromObject(model);


    const dimensions =
        new THREE.Vector3();

    box.getSize(
        dimensions
    );


    const largest =
        Math.max(
            dimensions.x,
            dimensions.y,
            dimensions.z
        );


    if (
        largest > 0
    ) {

        model.scale.setScalar(
            size / largest
        );

    }


    model.rotation.y =
        rotationY;


    model.position.set(
        x,
        0,
        z
    );


    scene.add(model);


    /*
       Recalculate after scaling.
    */

    model.updateMatrixWorld(
        true
    );


    const finalBox =
        new THREE.Box3()
            .setFromObject(model);


    /*
       Put bottom of model exactly
       on the snow.
    */

    model.position.y -=
        finalBox.min.y;


    model.traverse(
        object => {

            if (
                object.isMesh
            ) {

                object.castShadow = true;
                object.receiveShadow = true;

            }

        }
    );


    return model;

}


/* =====================================================
   BUILD OUR OWN RESEARCH STATION
===================================================== */

function createResearchStation() {

    const group =
        new THREE.Group();


    /*
       Main building
    */

    const building =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                12,
                5,
                7
            ),

            new THREE.MeshStandardMaterial({
                color: 0x283c45,
                roughness: .8
            })

        );


    building.position.y =
        2.5;

    building.castShadow = true;
    building.receiveShadow = true;

    group.add(building);


    /*
       Roof
    */

    const roof =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                12.6,
                .45,
                7.6
            ),

            new THREE.MeshStandardMaterial({
                color: 0x17272f,
                roughness: .8
            })

        );


    roof.position.y =
        5.2;

    roof.castShadow = true;

    group.add(roof);


    /*
       Door
    */

    const door =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.5,
                2.8,
                .12
            ),

            new THREE.MeshStandardMaterial({
                color: 0x513f2d
            })

        );


    door.position.set(
        0,
        1.4,
        3.56
    );


    group.add(door);


    /*
       Windows
    */

    const windowMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x7ce3f5,
            emissive: 0x164c5b,
            emissiveIntensity: .8
        });


    [
        -4,
        4
    ].forEach(
        x => {

            const window =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        2.2,
                        1.4,
                        .12
                    ),

                    windowMaterial

                );


            window.position.set(
                x,
                2.8,
                3.56
            );


            group.add(window);

        }
    );


    /*
       Research sign
    */

    const sign =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                5,
                .9,
                .15
            ),

            new THREE.MeshStandardMaterial({
                color: 0x14252d
            })

        );


    sign.position.set(
        0,
        4.4,
        3.6
    );


    group.add(sign);


    /*
       Put station at end of
       starting area.
    */

    group.position.set(
        0,
        0,
        -18
    );


    scene.add(group);

}


createResearchStation();


/* =====================================================
   WORLD ASSETS
===================================================== */

async function buildWorld() {

    await Promise.all(
        files.map(
            loadFile
        )
    );


    /*
       TREES
    */

    const treePositions = [

        [-23, -12],
        [23, -12],

        [-27, -29],
        [27, -29],

        [-22, -45],
        [25, -48],

        [-30, -62],
        [30, -65]

    ];


    treePositions.forEach(
        ([x, z]) => {

            addModel(
                "pine_tree.glb",
                x,
                z,
                5,
                Math.random() *
                Math.PI * 2
            );

        }
    );


    /*
       ROCKS
    */

    [
        [-8, -14],
        [9, -18],
        [-18, -35],
        [18, -38],
        [-8, -52],
        [12, -58]
    ].forEach(
        ([x, z]) => {

            addModel(
                "snow_rock.glb",
                x,
                z,
                2.5,
                Math.random() *
                Math.PI * 2
            );

        }
    );


    /*
       SMALL ICE
    */

    addModel(
        "ice_spire.glb",
        -18,
        -48,
        4
    );


    addModel(
        "ice_spire.glb",
        18,
        -52,
        4
    );


    /*
       CAMP PROPS
    */

    addModel(
        "crate.glb",
        -5,
        -13,
        2
    );


    addModel(
        "supply_box.glb",
        5,
        -13,
        2
    );


    addModel(
        "fuel_barrel.glb",
        -7,
        -15,
        1.8
    );


    /*
       LAMPS
    */

    addModel(
        "lamp_post.glb",
        -7,
        -9,
        3
    );


    addModel(
        "lamp_post.glb",
        7,
        -9,
        3
    );


    /*
       ANIMALS
    */

    polarBear =
        addModel(
            "polar_bear.glb",
            -12,
            -29,
            4
        );


    caribou =
        addModel(
            "caribou.glb",
            13,
            -43,
            4
        );


    arcticWolf =
        addModel(
            "arctic_wolf.glb",
            -10,
            -60,
            3.5
        );


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
        "WORLD READY"
    );

}


/* =====================================================
   PUZZLE DATA
===================================================== */

const animalData = {

    polarBear: {

        name: "POLAR BEAR",

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

        name: "CARIBOU",

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

        name: "ARCTIC WOLF",

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


/* =====================================================
   FIRST PERSON
===================================================== */

let yaw = 0;
let pitch = 0;

let pointerLocked = false;

const keys = {};


document.addEventListener(
    "mousemove",
    e => {

        if (
            !pointerLocked ||
            !gameStarted ||
            activePuzzle
        ) {

            return;

        }


        yaw -=
            e.movementX * .002;

        pitch -=
            e.movementY * .002;


        pitch =
            THREE.MathUtils.clamp(
                pitch,
                -1.45,
                1.45
            );


        camera.rotation.order =
            "YXZ";


        camera.rotation.y =
            yaw;

        camera.rotation.x =
            pitch;

    }
);


document.addEventListener(
    "pointerlockchange",
    () => {

        pointerLocked =
            document.pointerLockElement ===
            document.body;

    }
);


/* =====================================================
   START
===================================================== */

document
    .getElementById(
        "startButton"
    )
    .onclick = () => {

        document
            .getElementById(
                "startScreen"
            )
            .style.display =
            "none";


        gameStarted =
            true;


        document.body.requestPointerLock();


        startTimer();

    };


/* =====================================================
   CONTROLS
===================================================== */

document.addEventListener(
    "keydown",
    e => {

        keys[e.code] =
            true;


        if (
            e.code === "KeyE"
        ) {

            investigate();

        }

    }
);


document.addEventListener(
    "keyup",
    e => {

        keys[e.code] =
            false;

    }
);


/* =====================================================
   MOVEMENT
===================================================== */

function move(
    delta
) {

    if (
        !gameStarted ||
        activePuzzle ||
        gameFinished
    ) {

        return;

    }


    let z = 0;
    let x = 0;


    if (keys["KeyW"])
        z += 1;

    if (keys["KeyS"])
        z -= 1;

    if (keys["KeyA"])
        x -= 1;

    if (keys["KeyD"])
        x += 1;


    if (
        x === 0 &&
        z === 0
    ) {

        return;

    }


    const direction =
        new THREE.Vector3(
            x,
            0,
            -z
        );


    direction.applyQuaternion(
        camera.quaternion
    );


    direction.y = 0;

    direction.normalize();


    camera.position.addScaledVector(
        direction,
        delta * 7
    );


    camera.position.x =
        THREE.MathUtils.clamp(
            camera.position.x,
            -34,
            34
        );


    camera.position.z =
        THREE.MathUtils.clamp(
            camera.position.z,
            -72,
            12
        );


    camera.position.y =
        2;

}


/* =====================================================
   NEAREST ANIMAL
===================================================== */

function nearestAnimal() {

    const animals = [
        polarBear,
        caribou,
        arcticWolf
    ];


    let closest = null;
    let closestDistance = Infinity;


    animals.forEach(
        animal => {

            if (
                !animal ||
                animal.userData.completed
            ) {

                return;

            }


            const distance =
                camera.position.distanceTo(
                    animal.position
                );


            if (
                distance <
                closestDistance
            ) {

                closestDistance =
                    distance;

                closest =
                    animal;

            }

        }
    );


    return {
        animal: closest,
        distance: closestDistance
    };

}


/* =====================================================
   INTERACTION
===================================================== */

function updateInteraction() {

    const ui =
        document.getElementById(
            "interaction"
        );


    if (
        !gameStarted ||
        activePuzzle ||
        gameFinished
    ) {

        ui.classList.remove(
            "visible"
        );

        return;

    }


    const result =
        nearestAnimal();


    if (
        result.animal &&
        result.distance < 6
    ) {

        ui.classList.add(
            "visible"
        );

    } else {

        ui.classList.remove(
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
        activePuzzle
    ) {

        return;

    }


    const result =
        nearestAnimal();


    if (
        result.animal &&
        result.distance < 6
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


/* =====================================================
   ANSWER
===================================================== */

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


    document
        .getElementById(
            "continueButton"
        )
        .style.display =
        "inline-block";


    const animal =
        [
            polarBear,
            caribou,
            arcticWolf
        ].find(
            a =>
                a &&
                a.userData.animal === id
        );


    if (animal) {

        animal.userData.completed =
            true;

    }


    if (
        dataRecovered >= 3
    ) {

        document
            .getElementById(
                "continueButton"
            )
            .textContent =
            "FINISH MISSION";

    }

}


/* =====================================================
   CONTINUE
===================================================== */

document
    .getElementById(
        "continueButton"
    )
    .onclick = () => {

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

    };


/* =====================================================
   TIMER
===================================================== */

function startTimer() {

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

    const p =
        snow.geometry.attributes
            .position.array;


    for (
        let i = 0;
        i < snowCount;
        i++
    ) {

        p[i * 3 + 1] -=
            delta * 1.8;


        if (
            p[i * 3 + 1] < 0
        ) {

            p[i * 3 + 1] =
                45;

        }

    }


    snow.geometry.attributes
        .position.needsUpdate =
        true;

}


/* =====================================================
   LOOP
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


    move(delta);

    updateInteraction();

    updateSnow(delta);


    renderer.render(
        scene,
        camera
    );

}


window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            innerWidth /
            innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            innerWidth,
            innerHeight
        );

    }
);


/* =====================================================
   START
===================================================== */

buildWorld();

animate();

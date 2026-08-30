import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import {
    PointerLockControls
} from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";


/* =========================
   GAME STATE
========================= */

let score = 0;
let dataRecovered = 0;
let timeLeft = 90;

let gameStarted = false;
let gameFinished = false;

let activePuzzle = null;


/* =========================
   THREE.JS
========================= */

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x9ed9ed);

scene.fog =
    new THREE.Fog(0x9ed9ed, 20, 120);


const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );

camera.position.set(
    0,
    2,
    12
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
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

document.body.appendChild(
    renderer.domElement
);


/* =========================
   LIGHTING
========================= */

const ambient =
    new THREE.HemisphereLight(
        0xc8efff,
        0x456070,
        2
    );

scene.add(ambient);


const sun =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );

sun.position.set(
    20,
    40,
    10
);

sun.castShadow = true;

scene.add(sun);


/* =========================
   GROUND
========================= */

const groundMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xe9f7fb,
        roughness: 1
    });

const ground =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            160,
            160
        ),
        groundMaterial
    );

ground.rotation.x =
    -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);


/* =========================
   MOUNTAINS
========================= */

function createMountain(
    x,
    z,
    size
) {

    const mountain =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                size,
                size * 2,
                6
            ),
            new THREE.MeshStandardMaterial({
                color: 0xb9d7df
            })
        );

    mountain.position.set(
        x,
        size,
        z
    );

    mountain.castShadow = true;

    scene.add(mountain);
}


createMountain(-35, -35, 15);
createMountain(0, -45, 20);
createMountain(35, -35, 16);


/* =========================
   TREES
========================= */

function createTree(x, z) {

    const group =
        new THREE.Group();

    const trunk =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .35,
                .5,
                3
            ),
            new THREE.MeshStandardMaterial({
                color: 0x513b2c
            })
        );

    trunk.position.y = 1.5;

    group.add(trunk);


    for (let i = 0; i < 3; i++) {

        const snowTree =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    2.5 - i * .5,
                    4,
                    7
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x315c58
                })
            );

        snowTree.position.y =
            3 + i * 1.5;

        group.add(snowTree);
    }


    group.position.set(
        x,
        0,
        z
    );

    scene.add(group);
}


for (let i = 0; i < 25; i++) {

    const angle =
        Math.random() * Math.PI * 2;

    const radius =
        25 + Math.random() * 40;

    createTree(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
    );
}


/* =========================
   ANIMAL PLACEHOLDERS
========================= */

function createAnimal(
    emoji,
    position,
    id
) {

    // Temporary placeholder.
    // We'll replace these with
    // our own low-poly models.

    const canvas =
        document.createElement("canvas");

    canvas.width = 256;
    canvas.height = 256;

    const ctx =
        canvas.getContext("2d");

    ctx.clearRect(
        0,
        0,
        256,
        256
    );

    ctx.font =
        "150px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        emoji,
        128,
        128
    );


    const texture =
        new THREE.CanvasTexture(
            canvas
        );

    const material =
        new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

    const sprite =
        new THREE.Sprite(
            material
        );

    sprite.scale.set(
        5,
        5,
        1
    );

    sprite.position.copy(
        position
    );

    sprite.userData.animal =
        id;

    scene.add(sprite);

    return sprite;
}


const polarBear =
    createAnimal(
        "🐻‍❄️",
        new THREE.Vector3(
            -12,
            3,
            -10
        ),
        "polarBear"
    );


const caribou =
    createAnimal(
        "🦌",
        new THREE.Vector3(
            12,
            3,
            -20
        ),
        "caribou"
    );


const wolf =
    createAnimal(
        "🐺",
        new THREE.Vector3(
            -8,
            3,
            -32
        ),
        "wolf"
    );


/* =========================
   RESEARCH DATA
========================= */

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
            "Polar bears have thick fur and a layer of body fat that help reduce heat loss."
    },


    caribou: {

        name: "CARIBOU",

        question:
            "What is an important part of a caribou's diet?",

        answers: [
            "Lichens",
            "Seals",
            "Coral"
        ],

        correct: 0,

        fact:
            "Caribou feed on grasses, leaves, shrubs and especially lichens during winter."
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


/* =========================
   CONTROLS
========================= */

const controls =
    new PointerLockControls(
        camera,
        document.body
    );


document
    .getElementById("startButton")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("startScreen")
                .style.display = "none";

            controls.lock();

            gameStarted = true;

            startTimer();

        }
    );


const keys = {};


document.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;

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

        keys[event.code] = false;

    }
);


/* =========================
   MOVEMENT
========================= */

const clock =
    new THREE.Clock();


function movePlayer() {

    if (!gameStarted ||
        gameFinished ||
        activePuzzle)
        return;


    const delta =
        clock.getDelta();

    const speed =
        7 * delta;


    if (keys["KeyW"])
        controls.moveForward(speed);

    if (keys["KeyS"])
        controls.moveForward(-speed);

    if (keys["KeyA"])
        controls.moveRight(-speed);

    if (keys["KeyD"])
        controls.moveRight(speed);


    camera.position.y = 2;

}


/* =========================
   INVESTIGATION
========================= */

function investigate() {

    if (!gameStarted ||
        gameFinished ||
        activePuzzle)
        return;


    const animals = [
        polarBear,
        caribou,
        wolf
    ];


    let closest = null;
    let closestDistance = 5;


    for (
        const animal of animals
    ) {

        const distance =
            camera.position.distanceTo(
                animal.position
            );

        if (
            distance < closestDistance
        ) {

            closest =
                animal;

            closestDistance =
                distance;

        }

    }


    if (closest) {

        openPuzzle(
            closest.userData.animal
        );

    }

}


/* =========================
   PUZZLE
========================= */

function openPuzzle(id) {

    activePuzzle = id;

    const info =
        animalData[id];


    document
        .getElementById("animalName")
        .textContent =
        info.name;


    document
        .getElementById("question")
        .textContent =
        info.question;


    const answers =
        document.getElementById(
            "answers"
        );

    answers.innerHTML = "";


    document
        .getElementById("fact")
        .textContent = "";


    document
        .getElementById("continueButton")
        .style.display =
        "none";


    info.answers.forEach(
        (answer, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "answer";

            button.textContent =
                answer;


            button.onclick =
                () => {

                    chooseAnswer(
                        index,
                        info
                    );

                };


            answers.appendChild(
                button
            );

        }
    );


    document
        .getElementById("puzzle")
        .style.display =
        "flex";

}


function chooseAnswer(
    index,
    info
) {

    const answers =
        document.getElementById(
            "answers"
        );

    if (
        index === info.correct
    ) {

        score += 100;

        dataRecovered++;


        document
            .getElementById("score")
            .textContent =
            score;


        document
            .getElementById("data")
            .textContent =
            dataRecovered;


        document
            .getElementById("fact")
            .textContent =
            "✓ DATA RECOVERED\n\n" +
            info.fact;


        answers.innerHTML = "";


        document
            .getElementById(
                "continueButton"
            )
            .style.display =
            "inline-block";


    } else {

        document
            .getElementById("fact")
            .textContent =
            "✕ INCORRECT — TRY AGAIN";

    }

}


document
    .getElementById(
        "continueButton"
    )
    .onclick =
    () => {

        document
            .getElementById("puzzle")
            .style.display =
            "none";

        activePuzzle = null;

    };


/* =========================
   TIMER
========================= */

function startTimer() {

    const timer =
        setInterval(
            () => {

                if (
                    !gameStarted ||
                    gameFinished
                )
                    return;


                timeLeft--;


                document
                    .getElementById("time")
                    .textContent =
                    timeLeft;


                if (
                    timeLeft <= 0
                ) {

                    clearInterval(
                        timer
                    );

                    finishGame();

                }


            },
            1000
        );

}


function finishGame() {

    gameFinished = true;

    controls.unlock();


    document
        .getElementById("finalScore")
        .textContent =
        `SCORE: ${score}  •  DATA RECOVERED: ${dataRecovered}/3`;


    document
        .getElementById("gameOver")
        .style.display =
        "flex";

}


/* =========================
   RENDER LOOP
========================= */

function animate() {

    requestAnimationFrame(
        animate
    );

    movePlayer();

    renderer.render(
        scene,
        camera
    );

}

animate();


/* =========================
   RESIZE
========================= */

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

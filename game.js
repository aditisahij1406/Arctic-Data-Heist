/* =====================================================
   ARCTIC DATA HEIST
   First-person mini game
   ===================================================== */


/* =========================
   GAME VARIABLES
========================= */

let gameStarted = false;
let gameFinished = false;

let score = 0;
let dataRecovered = 0;

let timeLeft = 90;

let activePuzzle = null;


/* =========================
   THREE.JS SETUP
========================= */

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(
        0x9bd9ea
    );

scene.fog =
    new THREE.Fog(
        0x9bd9ea,
        20,
        100
    );


const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.1,
        200
    );


camera.position.set(
    0,
    2,
    15
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


document.body.appendChild(
    renderer.domElement
);


/* =========================
   LIGHT
========================= */

const ambientLight =
    new THREE.HemisphereLight(
        0xdff7ff,
        0x40535a,
        2
    );

scene.add(
    ambientLight
);


const sunlight =
    new THREE.DirectionalLight(
        0xffffff,
        2.5
    );

sunlight.position.set(
    20,
    40,
    10
);

scene.add(
    sunlight
);


/* =========================
   GROUND
========================= */

const ground =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            150,
            150
        ),

        new THREE.MeshStandardMaterial({
            color: 0xe7f5f8,
            roughness: 1
        })

    );


ground.rotation.x =
    -Math.PI / 2;


scene.add(
    ground
);


/* =========================
   MOUNTAINS
========================= */

function makeMountain(
    x,
    z,
    size
) {

    const mountain =
        new THREE.Mesh(

            new THREE.ConeGeometry(
                size,
                size * 2,
                7
            ),

            new THREE.MeshStandardMaterial({
                color: 0xb7d4dc
            })

        );


    mountain.position.set(
        x,
        size,
        z
    );


    scene.add(
        mountain
    );
}


makeMountain(
    -35,
    -40,
    18
);

makeMountain(
    0,
    -50,
    22
);

makeMountain(
    35,
    -40,
    17
);


/* =========================
   TREES
========================= */

function makeTree(
    x,
    z
) {

    const group =
        new THREE.Group();


    const trunk =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                .3,
                .5,
                3
            ),

            new THREE.MeshStandardMaterial({
                color: 0x4c372b
            })

        );


    trunk.position.y =
        1.5;


    group.add(
        trunk
    );


    const leaves =
        new THREE.Mesh(

            new THREE.ConeGeometry(
                2.3,
                6,
                7
            ),

            new THREE.MeshStandardMaterial({
                color: 0x2e5c58
            })

        );


    leaves.position.y =
        5;


    group.add(
        leaves
    );


    group.position.set(
        x,
        0,
        z
    );


    scene.add(
        group
    );
}


for (
    let i = 0;
    i < 30;
    i++
) {

    const angle =
        Math.random() *
        Math.PI * 2;

    const radius =
        25 +
        Math.random() * 35;


    makeTree(

        Math.cos(angle) *
        radius,

        Math.sin(angle) *
        radius

    );

}


/* =========================
   RESEARCH STATION
========================= */

const station =
    new THREE.Mesh(

        new THREE.BoxGeometry(
            10,
            5,
            7
        ),

        new THREE.MeshStandardMaterial({
            color: 0x314d59
        })

    );


station.position.set(
    0,
    2.5,
    -5
);


scene.add(
    station
);


/* Roof */

const roof =
    new THREE.Mesh(

        new THREE.ConeGeometry(
            7,
            3,
            4
        ),

        new THREE.MeshStandardMaterial({
            color: 0x6e8b94
        })

    );


roof.position.set(
    0,
    6.5,
    -5
);


roof.rotation.y =
    Math.PI / 4;


scene.add(
    roof
);


/* =========================
   ANIMAL CREATION
========================= */

function makeAnimal(
    name,
    color,
    position
) {

    const group =
        new THREE.Group();


    /* BODY */

    const body =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                1.3,
                12,
                8
            ),

            new THREE.MeshStandardMaterial({
                color: color
            })

        );


    body.scale.set(
        1.4,
        1,
        .8
    );


    group.add(
        body
    );


    /* HEAD */

    const head =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                .8,
                12,
                8
            ),

            new THREE.MeshStandardMaterial({
                color: color
            })

        );


    head.position.set(
        0,
        .5,
        -.9
    );


    group.add(
        head
    );


    /* LEGS */

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const leg =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    .15,
                    .2,
                    1.4,
                    8
                ),

                new THREE.MeshStandardMaterial({
                    color: color
                })

            );


        leg.position.set(

            i % 2 === 0
                ? -.8
                : .8,

            -.9,

            i < 2
                ? -.5
                : .5

        );


        group.add(
            leg
        );

    }


    group.position.copy(
        position
    );


    group.userData.animal =
        name;


    scene.add(
        group
    );


    return group;
}


/* Polar bear */

const polarBear =
    makeAnimal(
        "polarBear",
        0xf5f7f7,
        new THREE.Vector3(
            -10,
            2,
            -15
        )
    );


/* Caribou */

const caribou =
    makeAnimal(
        "caribou",
        0x76503b,
        new THREE.Vector3(
            10,
            2,
            -25
        )
    );


/* Wolf */

const wolf =
    makeAnimal(
        "wolf",
        0x7c8588,
        new THREE.Vector3(
            -5,
            2,
            -38
        )
    );


/* =========================
   ANIMAL DATA
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
            "DATA RECOVERED!\n\nPolar bears have thick fur and a layer of body fat that help reduce heat loss."

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
            "DATA RECOVERED!\n\nCaribou rely heavily on lichens during winter."

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
            "DATA RECOVERED!\n\nArctic wolves are adapted to extremely cold northern environments."

    }

};


/* =========================
   FIRST PERSON CONTROLS
========================= */

let yaw = 0;
let pitch = 0;

const keys = {};

let mouseLocked = false;


document.addEventListener(
    "mousemove",
    function(event) {

        if (
            !mouseLocked ||
            !gameStarted ||
            activePuzzle
        ) {
            return;
        }


        yaw -=
            event.movementX *
            0.002;


        pitch -=
            event.movementY *
            0.002;


        const limit =
            Math.PI / 2 - 0.1;


        pitch =
            Math.max(
                -limit,
                Math.min(
                    limit,
                    pitch
                )
            );


        camera.rotation.set(
            pitch,
            yaw,
            0,
            "YXZ"
        );

    }
);


/* =========================
   START BUTTON
========================= */

document
    .getElementById(
        "startButton"
    )
    .addEventListener(
        "click",
        function() {

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

        }
    );


document.addEventListener(
    "pointerlockchange",
    function() {

        mouseLocked =
            document.pointerLockElement ===
            document.body;

    }
);


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    function(event) {

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
    function(event) {

        keys[event.code] =
            false;

    }
);


/* =========================
   MOVEMENT
========================= */

const movement =
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


    movement.set(
        0,
        0,
        0
    );


    if (
        keys["KeyW"]
    ) {

        movement.z -= 1;

    }


    if (
        keys["KeyS"]
    ) {

        movement.z += 1;

    }


    if (
        keys["KeyA"]
    ) {

        movement.x -= 1;

    }


    if (
        keys["KeyD"]
    ) {

        movement.x += 1;

    }


    if (
        movement.length() > 0
    ) {

        movement.normalize();

    }


    const speed =
        8 * delta;


    const forward =
        new THREE.Vector3(
            0,
            0,
            -1
        );

    const right =
        new THREE.Vector3(
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


    camera.position.addScaledVector(
        forward,
        -movement.z * speed
    );


    camera.position.addScaledVector(
        right,
        movement.x * speed
    );


    camera.position.y =
        2;


    /* World boundary */

    camera.position.x =
        THREE.MathUtils.clamp(
            camera.position.x,
            -65,
            65
        );


    camera.position.z =
        THREE.MathUtils.clamp(
            camera.position.z,
            -65,
            30
        );

}


/* =========================
   INVESTIGATE
========================= */

function investigate() {

    if (
        !gameStarted ||
        gameFinished ||
        activePuzzle
    ) {
        return;
    }


    const animals = [
        polarBear,
        caribou,
        wolf
    ];


    let nearest = null;

    let nearestDistance =
        Infinity;


    animals.forEach(
        function(animal) {

            if (
                animal.userData.completed
            ) {
                return;
            }


            const distance =
                camera.position.distanceTo(
                    animal.position
                );


            if (
                distance < nearestDistance
            ) {

                nearest =
                    animal;

                nearestDistance =
                    distance;

            }

        }
    );


    if (
        nearest &&
        nearestDistance < 7
    ) {

        openPuzzle(
            nearest.userData.animal
        );

    }

}


/* =========================
   PUZZLE
========================= */

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


    const answerBox =
        document.getElementById(
            "answers"
        );


    answerBox.innerHTML =
        "";


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


    info.answers.forEach(
        function(
            answer,
            index
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "answer";


            button.textContent =
                answer;


            button.onclick =
                function() {

                    answerQuestion(
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


/* =========================
   ANSWER
========================= */

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
        index === info.correct
    ) {

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
            "✓ " +
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
            scene.children.find(
                object =>
                    object.userData &&
                    object.userData.animal === id
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

    } else {

        fact.textContent =
            "✕ INCORRECT — TRY AGAIN";

    }

}


/* =========================
   CONTINUE
========================= */

document
    .getElementById(
        "continueButton"
    )
    .addEventListener(
        "click",
        function() {

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


/* =========================
   TIMER
========================= */

let timerStarted =
    false;


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
            function() {

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


/* =========================
   FINISH
========================= */

function finishGame() {

    gameFinished =
        true;


    document.exitPointerLock();


    document
        .getElementById(
            "finalScore"
        )
        .textContent =
        `SCORE: ${score}  •  DATA RECOVERED: ${dataRecovered}/3`;


    document
        .getElementById(
            "gameOver"
        )
        .style.display =
        "flex";

}


/* =========================
   RENDER
========================= */

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
    function() {

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

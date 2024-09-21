// Ensure the height is correctly set for mobile browsers
window.addEventListener('resize', () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});

// Initial setting of vh on page load
document.addEventListener('DOMContentLoaded', () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});

// // Ensure the SnakeGame starts correctly
// document.addEventListener('DOMContentLoaded', function() {
//     if (document.getElementById('snakeWindow') && window.SnakeGame) {
//         // Add logic to initialize or show the correct screen
//         SnakeGame.start();
//     }
// });

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // Perform login validation here
    var username = document.getElementById('loginUsername').value;
    var password = document.getElementById('password').value;

    // For demonstration, let's assume any username/password is valid
    if (username && password) {
        // Optionally, store the username in a global variable or session storage
        window.currentUsername = username; // Example: Using a global variable

        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('desktop').style.display = 'block';
    } else {
        alert('Please enter both username and password.');
    }
});


function closeLoginWindow() {
    document.getElementById('loginScreen').style.display = 'none';
}



document.addEventListener('DOMContentLoaded', function() {
    console.log("Document fully loaded");

    var bootupTextElement = document.getElementById('bootupText');
    var loadingScreen = document.getElementById('loadingScreen');
    var bootupSequence = document.getElementById('bootupSequence');
    var bootupText = `
FuckYouOS v1.1.4

Booting...
Kernel panic... OK
Mounting /dev/null... OK
Linking HAL... OK
Pinging 255.255.255.0... OK
Executing order 66... OK

System boot complete.
`;

    var index = 0;

    function typeWriter() {
        if (index < bootupText.length) {
            bootupTextElement.textContent += bootupText.charAt(index);
            index++;
            setTimeout(typeWriter, 2); // Adjust typing speed here
        } else {
            setTimeout(() => {
                bootupSequence.style.display = 'none';
                loadingScreen.style.display = 'flex'; // Show loading screen
                initializeApp(); // Initialize the rest of the app
            }, 500); // Delay before showing the loading screen
        }
    }

    typeWriter();

    function initializeApp() {
        setTimeout(hideLoadingScreen, 2100); // Show loading screen time

        initializeWindows();
        initializeIcons();
        console.log("Windows and icons initialized");

        // Set up double-click and touch events for icons
        function setupIconEvents(iconId, openFunction) {
            var icon = document.getElementById(iconId);
            if (!icon) {
                console.log(`Icon with ID ${iconId} not found`);
                return;
            }

            icon.ondblclick = function() {
                console.log(`Double-click detected on ${iconId}`);
                openFunction();
            };

            enableSingleClickHighlight(icon);

            let lastTouchTime = 0;
            const doubleTapThreshold = 300;

            icon.addEventListener('touchend', function(event) {
                var currentTime = new Date().getTime();
                var timeDiff = currentTime - lastTouchTime;

                if (timeDiff < doubleTapThreshold && timeDiff > 0) {
                    console.log(`Double-tap detected on ${iconId}`);
                    openFunction();
                } else {
                    highlightIcon(icon);
                }

                lastTouchTime = currentTime;
            });

            icon.addEventListener('click', function(event) {
                console.log(`Click detected on ${iconId}`);
                highlightIcon(icon);
            });
        }
        // Your existing icon event setups
        setupIconEvents('icon1', function() { openWindow('mainWindow'); });
        setupIconEvents('icon2', function() { redirectToURL('https://fuckyoufm.net'); });
        setupIconEvents('icon3', function() { redirectToURL('https://vapefacts.com.au'); });
        setupIconEvents('icon4', function() { openWindow('snakeWindow'); });
        setupIconEvents('icon5', function() { openWindow('paintWindow'); });
        setupIconEvents('icon6', function() { openWindow('messagingWindow'); });
        setupIconEvents('icon7', function() { showCorruptedError(); }); // New icon for corrupted Doom executable
        setupIconEvents('icon8', function() { openWindow('deathPredictionWindow'); });
        setupIconEvents('icon9', function() { openWindow('minesweeperWindow'); });
        setupIconEvents('icon10', function() { openGifWindow(); }); // New icon for GIF Viewer
        setupIconEvents('icon11', function() { showLSDWindow(); }); // New icon for LSD Dream Emulator
        setupIconEvents('icon12', function() { redirectToURL('https://collectflix.net'); });


        console.log("Icon events set up");

        updateTime();
        setInterval(updateTime, 1000); // Update time every second
        console.log("Time and taskbar icons updated");

        updateTaskbarIcons();

        // Hide Start Menu on outside click
        document.addEventListener('click', function(event) {
            var startMenu = document.getElementById('startMenu');
            var startButton = document.querySelector('.start-button');
            if (startMenu && startButton && !startMenu.contains(event.target) && !startButton.contains(event.target)) {
                startMenu.classList.remove('show');
            }

            // Dehighlight icons when clicking outside
            if (!event.target.closest('.icon')) {
                document.querySelectorAll('.icon.highlighted').forEach(function(icon) {
                    icon.classList.remove('highlighted');
                });
            }
        });
        console.log("Outside click event set up");

        // Position icons to prevent overlap initially
        positionIcons();
        console.log("Icons positioned to prevent overlap");
    }

    function hideLoadingScreen() {
        var loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            console.log("Loading screen hidden");
        } else {
            console.log("Loading screen element not found");
        }
    }
});

function openGifWindow() {
    const gifWindow = document.getElementById('gifWindow');
    gifWindow.style.display = 'block';
    centerWindow(gifWindow); // Center the window on the screen
}




function highlightIcon(target) {
    // Remove highlight from any previously highlighted icon
    var highlighted = document.querySelector('.icon.highlighted');
    if (highlighted) {
        highlighted.classList.remove('highlighted');
    }

    // Highlight the clicked icon
    if (target && target.classList && target.classList.contains('icon')) {
        target.classList.add('highlighted');
    }
}

function enableSingleClickHighlight(element) {
    element.addEventListener('click', function(event) {
        // Check if the clicked element is an icon
        if (event.target.classList.contains('icon')) {
            highlightIcon(event.target);
        } else {
            // Remove highlight if anything else is clicked
            highlightIcon(null);
        }
    });

    element.addEventListener('touchstart', function(event) {
        // No action needed for touchstart in this simplified version
    });

    element.addEventListener('touchend', function(event) {
        // Check if the touched element is an icon
        if (event.target.classList.contains('icon')) {
            highlightIcon(event.target);
        } else {
            // Remove highlight if anything else is touched
            highlightIcon(null);
        }
    });
}






function redirectToURL(url) {
    window.open(url, '_blank');
}

function positionIcons() {
    var icons = document.querySelectorAll('.icon');
    var windowWidth = window.innerWidth;
    var iconWidth = icons[0].offsetWidth;
    var iconHeight = icons[0].offsetHeight;
    var margin = 10; // Space between icons

    var maxColumns = 4; // Maximum number of icons in a row
    var currentColumn = 0;
    var currentRow = 0;

    icons.forEach(function(icon, index) {
        if (index % 4 === 0 && index !== 0) { // Wrap to new row after 5 icons
            currentColumn = 0;
            currentRow++;
        } else if (currentColumn >= maxColumns) { // Move to new row after maxColumns
            currentColumn = 0;
            currentRow++;
        }

        var left = margin + currentColumn * (iconWidth + margin);
        var top = margin + currentRow * (iconHeight + margin);

        icon.style.position = 'absolute';
        icon.style.top = top + 'px';
        icon.style.left = left + 'px';

        currentColumn++;
    });
}

// Ensure icons are positioned correctly on load and on window resize
window.addEventListener('load', positionIcons);
window.addEventListener('resize', positionIcons);


window.addEventListener('resize', positionIcons);
window.addEventListener('load', positionIcons);


function handleMinimize(event) {
    if (event.type === 'touchend' && event.cancelable) {
        event.preventDefault();
    }
    minimizeWindow(this.closest('.window').id);
}

function handleClose(event) {
    if (event.type === 'touchend' && event.cancelable) {
        event.preventDefault();
    }
    closeWindow(this.closest('.window').id);
}

function handleMaximize(event) {
    if (event.type === 'touchend' && event.cancelable) {
        event.preventDefault();
    }
    MaximizeWindow(this.closest('.window').id);
}


function closeWindow(windowId) {
    minimizeWindow(windowId);
}

function minimizeWindow(windowId) {
    var windowElement = document.getElementById(windowId);
    windowElement.style.display = 'none';
    updateTaskbarIcons();
}

function showddPopup() {
    const dds = [
        'https://i.ibb.co/878Sczg/newplayer3-crackedscreen.png',
        'https://i.ibb.co/Wx8CwwB/PHOTOSHOPPEDDALL-E-2024-05-21-08-35-jpg.png',
        'https://i.ibb.co/CBxC323/armyadfinalss.png',
        'https://i.ibb.co/wwjC84j/image.png'
    ];

    let currentIndex = 0;
    const ddImage1 = document.getElementById('ddImage1');
    const ddImage2 = document.getElementById('ddImage2');
    ddImage1.src = dds[currentIndex];
    ddImage2.src = dds[1]; // Start with second image preloaded
    ddImage1.style.opacity = 1;
    ddImage2.style.opacity = 0;

    ddImage1.addEventListener('transitionend', updateSource);
    ddImage2.addEventListener('transitionend', updateSource);

    function updateSource() {
        if (this.style.opacity === "0") {
            currentIndex = (currentIndex + 1) % dds.length;
            this.src = dds[currentIndex];
        }
    }

    function toggleImages() {
        if (ddImage1.style.opacity == '1') {
            ddImage1.style.opacity = 0;
            ddImage2.style.opacity = 1;
        } else {
            ddImage1.style.opacity = 1;
            ddImage2.style.opacity = 0;
        }
    }

    setInterval(toggleImages, 3000); // Change images every 3 seconds

    const ddPopup = document.getElementById('ddPopup');
    if (!ddPopup) {
        console.error('ddPopup element not found!');
        return;
    }
    ddPopup.style.display = 'block';
    console.log('ddPopup displayed.');
}

function closeddPopup() {
    const ddPopup = document.getElementById('ddPopup');
    if (!ddPopup) {
        console.error('Failed to find ddPopup for closure.');
        return;
    }
    ddPopup.style.display = 'none';
    console.log('ddPopup closed.');
}



// Add event listeners for DOM content loaded and window load
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed.');
    const closeButton = document.querySelector('.ad-close-button');
    if (closeButton) {
        closeButton.addEventListener('click', closeddPopup);
        console.log('Close button event listener added.');
    } else {
        console.error('Close button element not found!');
    }
});

window.addEventListener('load', function () {
    console.log('Window fully loaded. Setting timeout to show ad popup...');
    setTimeout(showddPopup, Math.random() * 5000); // Adjust the delay as needed and randomize it
});

function updateTaskbarIcons() {
    var taskbarIcons = document.getElementById('taskbarIcons');
    taskbarIcons.innerHTML = '';  // Clear existing icons to refresh the list

    // Select all windows that are currently being shown or minimized
    var windows = document.querySelectorAll('.window');
    windows.forEach(function (window) {
        var windowId = window.id;
        // Query the desktop icon using a selector that matches the window ID in the 'ondblclick' attribute
        var desktopIcon = document.querySelector(`.icon[ondblclick*="${windowId}"] img`);

        if (desktopIcon) {
            // Create a new image element for the taskbar icon
            var icon = document.createElement('img');
            icon.src = desktopIcon.src; // Use the same src as the desktop icon
            icon.alt = desktopIcon.alt; // Use the same alt text for accessibility
            icon.onclick = function () {
                toggleWindowState(windowId);  // Function to toggle the window state
            };
            taskbarIcons.appendChild(icon);  // Append the new icon to the taskbar
        }
    });
}
function toggleWindowState(windowId) {
    var windowElement = document.getElementById(windowId);
    if (windowElement) {
        if (windowElement.classList.contains('show')) {
            windowElement.classList.remove('show');
            windowElement.style.display = 'none'; // Minimize the window
        } else {
            openWindow(windowId); // Use the openWindow function to restore the window
        }
        updateTaskbarIcons();
    }
}


// Function to show the LSD window
function showLSDWindow() {
    console.log('Attempting to show LSD window...');
    const lsdWindow = document.getElementById('lsdWindow');
    if (lsdWindow) {
        lsdWindow.classList.add('show');
        lsdWindow.style.display = 'block';
        console.log('LSD window is now visible.');
        initThreeJS();  // Initialize Three.js when window is shown
    } else {
        console.error('LSD window element not found.');
    }
}

// Initialize Three.js
function initThreeJS() {
    console.log('Initializing Three.js...');
    const container = document.getElementById('lsdContent');
    if (!container) {
        console.error('LSD content container not found.');
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Create a group to hold the plane tiles
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    // Create initial tiles
    for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
            terrainGroup.add(createPlaneTile(x * 1000, z * 1000));
        }
    }

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    // Create the wireframe ship
    const ship = createShip();
    ship.position.set(0, 5, -100);
    scene.add(ship);

    // Setup mouse and touch control variables and event listeners
    let mouseX = 0, mouseY = 0;
    setupControlListeners(container, (x, y) => { mouseX = x; mouseY = y; });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        updateShipDirection(ship, mouseX, mouseY);
        camera.position.x = ship.position.x;
        camera.position.y = ship.position.y + 15;
        camera.position.z = ship.position.z + 50;
        camera.lookAt(ship.position);
        recycleTerrain(terrainGroup, ship);
        renderer.render(scene, camera);
    }
    animate();
    console.log('Three.js animation started.');
}

function setupControlListeners(element, callback) {
    element.addEventListener('mousemove', event => {
        const rect = element.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        callback(x, y);
    });

    element.addEventListener('touchmove', event => {
        event.preventDefault(); // Prevent scrolling and zooming on the canvas
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            const rect = element.getBoundingClientRect();
            const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            callback(x, y);
        }
    }, { passive: false });
}

function createShip() {
    const shipGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        0, 0, -20,   // Front peak
        -10, 0, 10,  // Back left
        10, 0, 10,   // Back right
        0, 5, 0      // Top middle
    ]);
    shipGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const indices = [
        0, 1, 2,     // Front face
        1, 3, 0,     // Left face
        2, 3, 0,     // Right face
        1, 2, 3      // Bottom face
    ];
    shipGeometry.setIndex(indices);
    shipGeometry.computeVertexNormals();
    const shipMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false });
    return new THREE.Mesh(shipGeometry, shipMaterial);
}

function createPlaneTile(x, z) {
    const planeSize = 2000; // Increase the size of each plane tile
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize, 100, 100); // Increase detail for more complex terrain
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x55ff55, wireframe: true });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(x * planeSize, 0, z * planeSize);

    // Adjust terrain height variability using a pseudo-random function for more natural variation
    const positions = planeGeometry.attributes.position;
    const scale = 40; // Scale factor for noise function to adjust the frequency of height changes
    const heightVariation = 200; // Maximum height variation for peaks and valleys

    // Applying a simple noise-like effect using sine and cosine functions
    for (let i = 0; i < positions.count; i += 3) {
        let x = positions.getX(i);
        let y = positions.getY(i);
        let z = positions.getZ(i);
        let noise = Math.sin(x / scale) * Math.cos(y / scale) * heightVariation;
        positions.setZ(i, z + noise);
    }

    positions.needsUpdate = true; // Notify THREE.js that the position data needs to be updated
    return plane;
}

function updateShipDirection(ship, mouseX, mouseY) {
    const rotationSpeed = 0.02; // Reduced speed for more controlled rotation
    const forwardSpeed = 50; // Forward speed remains the same for movement

    // Horizontal rotation limited to a specific range to prevent excessive spinning
    const maxYaw = Math.PI / 4; // Limit yaw to +/- 45 degrees for example
    const targetYaw = mouseX * maxYaw;
    ship.rotation.y += (targetYaw - ship.rotation.y) * rotationSpeed;

    // Vertical rotation (pitch) allowing more flexibility
    const maxPitch = Math.PI / 6; // Limit pitch to +/- 30 degrees for smoother vertical movement
    const targetPitch = -mouseY * maxPitch;
    ship.rotation.x += (targetPitch - ship.rotation.x) * rotationSpeed;

    // Calculate forward and vertical movement based on the current rotation
    const delta = 0.016; // Frame rate independence assumption (about 60fps)
    const direction = new THREE.Vector3(0, 0, -1).applyEuler(ship.rotation);
    const verticalAdjustment = new THREE.Vector3(0, -1, 0).applyEuler(ship.rotation);
    const displacement = direction.multiplyScalar(forwardSpeed * delta);
    const verticalDisplacement = verticalAdjustment.multiplyScalar(mouseY * 10 * delta); // Scale vertical movement based on mouse input

    // Apply movement to the ship
    ship.position.add(displacement);
    ship.position.add(verticalDisplacement); // Apply vertical adjustment based on mouse Y
}



function recycleTerrain(group, ship) {
    group.children.forEach(tile => {
        if (tile.position.z - ship.position.z > 1500) {
            tile.position.z -= 3000;
        }
    });
}

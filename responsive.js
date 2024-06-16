function makeDraggable(titleBar) {
    const windowElement = titleBar.parentElement;
    let startX = 0, startY = 0, initialX = 0, initialY = 0;
    let isDragging = false;

    console.log("makeDraggable initialized for:", windowElement.id);

    titleBar.addEventListener('mousedown', startDrag);
    titleBar.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
        e.preventDefault();
        isDragging = true;

        const rect = windowElement.getBoundingClientRect();

        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('touchend', stopDrag);
        } else {
            startX = e.clientX;
            startY = e.clientY;
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
        }

        initialX = rect.left;
        initialY = rect.top;

        console.log(`Drag start: startX=${startX}, startY=${startY}, initialX=${initialX}, initialY=${initialY}`);
    }

    function drag(e) {
        if (!isDragging) return;

        e.preventDefault();

        let currentX, currentY;

        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }

        let newX = initialX + (currentX - startX);
        let newY = initialY + (currentY - startY);

        // Constrain within viewport
        const minLeft = 0;
        const minTop = 0;
        const maxLeft = window.innerWidth - windowElement.offsetWidth;
        const maxTop = window.innerHeight - windowElement.offsetHeight;

        if (newX < minLeft) newX = minLeft;
        if (newY < minTop) newY = minTop;
        if (newX > maxLeft) newX = maxLeft;
        if (newY > maxTop) newY = maxTop;

        windowElement.style.left = `${newX}px`;
        windowElement.style.top = `${newY}px`;

        console.log(`Dragging: newX=${newX}, newY=${newY}`);
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('touchend', stopDrag);

        console.log("Drag ended");
    }
}

function makeIconDraggable(element) {
    let startX = 0, startY = 0, initialX = 0, initialY = 0;
    let isDragging = false;
    let dragTimeout;

    console.log("makeIconDraggable initialized for:", element.id);

    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
        e.preventDefault();
        dragTimeout = setTimeout(() => {
            highlightIcon(element);
            isDragging = true;

            const rect = element.getBoundingClientRect();

            if (e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                document.addEventListener('touchmove', drag, { passive: false });
                document.addEventListener('touchend', stopDrag);
            } else {
                startX = e.clientX;
                startY = e.clientY;
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDrag);
            }

            initialX = rect.left;
            initialY = rect.top;

            console.log(`Drag start: startX=${startX}, startY=${startY}, initialX=${initialX}, initialY=${initialY}`);
        }, 140); // 140ms delay for long press
    }

    function drag(e) {
        if (!isDragging) return;

        e.preventDefault();

        let currentX, currentY;

        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }

        let newX = initialX + (currentX - startX);
        let newY = initialY + (currentY - startY);

        // Constrain within viewport
        const minLeft = 0;
        const minTop = 0;
        const maxLeft = window.innerWidth - element.offsetWidth;
        const maxTop = window.innerHeight - element.offsetHeight;

        if (newX < minLeft) newX = minLeft;
        if (newY < minTop) newY = minTop;
        if (newX > maxLeft) newX = maxLeft;
        if (newY > maxTop) newY = maxTop;

        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;

        console.log(`Dragging: newX=${newX}, newY=${newY}`);
    }

    function stopDrag() {
        isDragging = false;
        clearTimeout(dragTimeout);
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('touchend', stopDrag);

        console.log("Drag ended");
    }

    element.addEventListener('mouseup', clearDragTimeout);
    element.addEventListener('touchend', clearDragTimeout);
    element.addEventListener('mouseleave', clearDragTimeout);
    element.addEventListener('touchcancel', clearDragTimeout);

    function clearDragTimeout() {
        clearTimeout(dragTimeout);
        console.log("Drag timeout cleared");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeWindows();
    initializeIcons();
    console.log("Initialization complete");
});


function initializeWindows() {
    // Make windows draggable by their title bars
    document.querySelectorAll('.window .title-bar').forEach(titleBar => {
        makeDraggable(titleBar);
        makeResizable(titleBar.parentElement);
    });

    // Set up window buttons
    document.querySelectorAll('.window .title-bar-controls button[aria-label="Minimize"]').forEach(button => {
        button.addEventListener('click', handleMinimize);
        button.addEventListener('touchend', handleMinimize, { passive: false });
    });

    document.querySelectorAll('.window .title-bar-controls button[aria-label="Close"]').forEach(button => {
        button.addEventListener('click', handleClose);
        button.addEventListener('touchend', handleClose, { passive: false });
    });

    document.querySelectorAll('.window .title-bar-controls button[aria-label="Maximize"]').forEach(button => {
        button.addEventListener('click', handleMaximize);
        button.addEventListener('touchend', handleMaximize, { passive: false });
    });
}

function updateMainSection(windowElement) {
    const mainSection = windowElement.querySelector('.window-body');
    mainSection.style.height = `calc(100% - ${windowElement.querySelector('.title-bar').offsetHeight}px)`;
}

function makeResizable(windowElement) {
    const resizeObserver = new ResizeObserver(() => {
        updateMainSection(windowElement);
        if (windowElement.id === 'snakeWindow') {
            SnakeGame.resizeSnakeCanvas();  // Call the updated resize function for Snake game
        } else if (windowElement.id === 'paintWindow') {
            PaintApp.resizePaintCanvas();  // Call the updated resize function for Paint app
        }
    });

    resizeObserver.observe(windowElement);
}



function initializeIcons() {
    document.querySelectorAll('.icon').forEach(icon => {
        makeIconDraggable(icon);
    });
}

// Function to handle menu clicks
function handleMenuClick(action) {
    switch(action) {
        case 'documents':
            openErrorWindow('Error: Unable to access the Documents folder. The folder might be corrupted or moved.');
            break;
        case 'settings':
            openWindow('settingsWindow');
            break;
        case 'search':
            openErrorWindow('Error: Search functionality is currently unavailable. Please try again later.');
            break;
        case 'about':
            openWindow('aboutWindow');
            break;
        case 'shutdown':
            openErrorWindow('Error: Please close the browser window to exit.');
            break;
        default:
            openErrorWindow('Error: Unrecognized action. Please contact support.');
    }
}

function openErrorWindow(message) {
    console.log('openErrorWindow called with message:', message); // Log the message
    document.getElementById('errorMessage').innerText = message;
    const errorWindow = document.getElementById('errorWindow');

    // Always update the position to center the window, regardless of previous state
    errorWindow.style.left = `${(window.innerWidth - errorWindow.offsetWidth) / 2}px`;
    errorWindow.style.top = `${(window.innerHeight - errorWindow.offsetHeight) / 2}px`;

    errorWindow.style.display = 'block';
    console.log('Error window displayed:', errorWindow); // Log after displaying the window

    // Ensure the error window is brought to the front
    console.log('Calling bringToFront for errorWindow'); // Log before bringing to front
    bringToFront(errorWindow);
    console.log('Error window brought to front:', errorWindow); // Log after bringing to front
}
// Function to close error window
function closeErrorWindow() {
    console.log('closeErrorWindow called'); // Log the close window call
    document.getElementById('errorWindow').style.display = 'none';
}

// Function to show corrupted error (for completeness, in case it's needed elsewhere)
function showCorruptedError() {
    console.log('showCorruptedError called'); // Log the show corrupted error call
    openErrorWindow('Error: The file is corrupted and cannot be opened.');
}

let zIndexCounter = 100; // Initial z-index value for windows

function bringToFront(element) {
    zIndexCounter++;
    element.style.zIndex = zIndexCounter;
    console.log(`zIndex set to ${zIndexCounter} for element:`, element); // Log the zIndex setting
}
function toggleStartMenu() {
    var startMenu = document.getElementById('startMenu');
    var taskbar = document.querySelector('.taskbar');
    var startButton = document.querySelector('.start-button');

    startMenu.classList.toggle('show');

    // Ensure start menu and taskbar are brought to the front
    bringToFront(taskbar);
    bringToFront(startMenu);
    bringToFront(startButton);

    // Ensure start menu is brought to the front when shown
    if (startMenu.classList.contains('show')) {
        bringToFront(startMenu);
    }
}



document.addEventListener('DOMContentLoaded', function() {
    initializeWindows();
    initializeIcons();
    // Ensure the start menu is hidden when the document is loaded
    document.getElementById('startMenu').classList.remove('show');
});

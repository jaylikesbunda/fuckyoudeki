function makeDraggable(titleBar) {
    const windowElement = titleBar.parentElement;
    let offsetX = 0, offsetY = 0, initialX = 0, initialY = 0;
    let dragTimeout;

    titleBar.addEventListener('mousedown', dragMouseDown);
    titleBar.addEventListener('touchstart', dragMouseDown, { passive: false });

    function dragMouseDown(e) {
        e.preventDefault();

        dragTimeout = setTimeout(() => {
            bringToFront(windowElement); // Bring window to front when dragging starts
            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - windowElement.offsetLeft;
                initialY = e.touches[0].clientY - windowElement.offsetTop;
                document.addEventListener('touchend', closeDragElement);
                document.addEventListener('touchmove', elementDrag, { passive: false });
            } else {
                initialX = e.clientX - windowElement.offsetLeft;
                initialY = e.clientY - windowElement.offsetTop;
                document.addEventListener('mouseup', closeDragElement);
                document.addEventListener('mousemove', elementDrag);
            }
        }, 0); // 0 ms delay for long press
    }

    function elementDrag(e) {
        e.preventDefault();

        if (e.type === 'touchmove') {
            offsetX = e.touches[0].clientX - initialX;
            offsetY = e.touches[0].clientY - initialY;
        } else {
            offsetX = e.clientX - initialX;
            offsetY = e.clientY - initialY;
        }

        // Constrain within viewport
        const minLeft = 0;
        const minTop = 0;
        const maxLeft = window.innerWidth - windowElement.offsetWidth;
        const maxTop = window.innerHeight - windowElement.offsetHeight;

        if (offsetX < minLeft) offsetX = minLeft;
        if (offsetY < minTop) offsetY = minTop;
        if (offsetX > maxLeft) offsetX = maxLeft;
        if (offsetY > maxTop) offsetY = maxTop;

        windowElement.style.left = offsetX + "px";
        windowElement.style.top = offsetY + "px";
    }

    function closeDragElement() {
        clearTimeout(dragTimeout);
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('touchend', closeDragElement);
        document.removeEventListener('touchmove', elementDrag);
    }

    titleBar.addEventListener('mouseup', clearDragTimeout);
    titleBar.addEventListener('touchend', clearDragTimeout);
    titleBar.addEventListener('mouseleave', clearDragTimeout);
    titleBar.addEventListener('touchcancel', clearDragTimeout);

    function clearDragTimeout() {
        clearTimeout(dragTimeout);
    }
}


function makeIconDraggable(element) {
    let offsetX = 0, offsetY = 0, initialX = 0, initialY = 0;
    let dragTimeout;

    element.addEventListener('mousedown', dragMouseDown);
    element.addEventListener('touchstart', dragMouseDown, { passive: false });

    function dragMouseDown(e) {
        e.preventDefault();

        dragTimeout = setTimeout(() => {
            highlightIcon(element);
            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - element.offsetLeft;
                initialY = e.touches[0].clientY - element.offsetTop;
                document.addEventListener('touchend', closeDragElement);
                document.addEventListener('touchmove', elementDrag, { passive: false });
            } else {
                initialX = e.clientX - element.offsetLeft;
                initialY = e.clientY - element.offsetTop;
                document.addEventListener('mouseup', closeDragElement);
                document.addEventListener('mousemove', elementDrag);
            }
        }, 140); // 150ms delay for long press
    }

    function elementDrag(e) {
        e.preventDefault();

        if (e.type === 'touchmove') {
            offsetX = e.touches[0].clientX - initialX;
            offsetY = e.touches[0].clientY - initialY;
        } else {
            offsetX = e.clientX - initialX;
            offsetY = e.clientY - initialY;
        }

        element.style.top = offsetY + "px";
        element.style.left = offsetX + "px";
    }

    function closeDragElement() {
        clearTimeout(dragTimeout);
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('touchend', closeDragElement);
        document.removeEventListener('touchmove', elementDrag);
    }

    element.addEventListener('mouseup', clearDragTimeout);
    element.addEventListener('touchend', clearDragTimeout);
    element.addEventListener('mouseleave', clearDragTimeout);
    element.addEventListener('touchcancel', clearDragTimeout);

    function clearDragTimeout() {
        clearTimeout(dragTimeout);
    }
}


document.addEventListener('DOMContentLoaded', function() {
    initializeWindows();
    initializeIcons();
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

// Function to open error window
function openErrorWindow(message) {
    console.log('openErrorWindow called with message:', message); // Log the message
    document.getElementById('errorMessage').innerText = message;
    const errorWindow = document.getElementById('errorWindow');
    errorWindow.style.display = 'block';
    console.log('Error window displayed:', errorWindow); // Log after displaying the window

    // Bring the error window to the front
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

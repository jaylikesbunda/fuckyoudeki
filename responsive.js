function makeDraggable(titleBar) {
    const windowElement = titleBar.parentElement;
    let offsetX = 0, offsetY = 0, initialX = 0, initialY = 0;

    titleBar.addEventListener('mousedown', dragMouseDown);
    titleBar.addEventListener('touchstart', dragMouseDown, { passive: false });

    function dragMouseDown(e) {
        e.preventDefault();

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

        windowElement.style.top = offsetY + "px";
        windowElement.style.left = offsetX + "px";
    }

    function closeDragElement() {
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('touchend', closeDragElement);
        document.removeEventListener('touchmove', elementDrag);
    }
}

function makeIconDraggable(element) {
    let offsetX = 0, offsetY = 0, initialX = 0, initialY = 0;

    element.addEventListener('mousedown', dragMouseDown);
    element.addEventListener('touchstart', dragMouseDown, { passive: false });

    function dragMouseDown(e) {
        e.preventDefault();

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
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('touchend', closeDragElement);
        document.removeEventListener('touchmove', elementDrag);
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

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(hideLoadingScreen, 3000); // Show loading screen for 3 seconds

    initializeWindows();
    initializeIcons();

    // Set up double-click events for icons
    document.getElementById('icon1').ondblclick = function() {
        openWindow('mainWindow');
    };
    document.getElementById('icon2').ondblclick = function() {
        redirectToURL('https://fuckyoufm.net');
    };
    document.getElementById('icon3').ondblclick = function() {
        redirectToURL('https://vapefacts.com.au');
    };
    document.getElementById('icon4').ondblclick = function() {
        openWindow('snakeWindow');
    };
    document.getElementById('icon5').ondblclick = function() {
        openWindow('paintWindow');
    };

    updateTime();
    setInterval(updateTime, 1000); // Update time every second
    updateTaskbarIcons();

    // Hide Start Menu on outside click
    document.addEventListener('click', function(event) {
        var startMenu = document.getElementById('startMenu');
        var startButton = document.querySelector('.start-button');
        if (!startMenu.contains(event.target) && !startButton.contains(event.target)) {
            startMenu.classList.remove('show');
        }

        // Dehighlight folders when clicking outside
        if (!event.target.closest('.icon')) {
            document.querySelectorAll('.icon').forEach(function(icon) {
                icon.classList.remove('highlighted');
            });
        }
    });

    // Position icons to prevent overlap initially
    positionIcons();
});

function hideLoadingScreen() {
    var loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.display = 'none';
}

function enableSingleClickHighlight(element) {
    element.addEventListener('click', function(event) {
        event.stopPropagation();
        document.querySelectorAll('.icon').forEach(function(icon) {
            icon.classList.remove('highlighted');
        });
        element.classList.add('highlighted');
    });

    element.addEventListener('touchend', function(event) {
        event.stopPropagation();
        document.querySelectorAll('.icon').forEach(function(icon) {
            icon.classList.remove('highlighted');
        });
        element.classList.add('highlighted');
    });
}

// Initialize highlight functionality for each icon
document.querySelectorAll('.icon').forEach(function(icon) {
    enableSingleClickHighlight(icon);
});


var lastTouchEnd = 0;

function handleTouch(event, target) {
    var currentTime = new Date().getTime();
    var timeDiff = currentTime - lastTouchEnd;

    if (timeDiff < 300 && timeDiff > 0) {
        if (typeof target === 'string' && target.startsWith('http')) {
            redirectToURL(target);
        } else {
            openWindow(target);
        }
    }

    lastTouchEnd = currentTime;
}

function redirectToURL(url) {
    window.location.href = url;
}

function positionIcons() {
    var icons = document.querySelectorAll('.icon');
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var iconWidth = icons[0].offsetWidth;
    var iconHeight = icons[0].offsetHeight;
    var margin = 10; // Space between icons

    var columns = Math.floor((windowWidth - margin) / (iconWidth + margin));
    var rows = Math.ceil(icons.length / columns);

    icons.forEach(function(icon, index) {
        var row = Math.floor(index / columns);
        var column = index % columns;

        var left = margin + column * (iconWidth + margin);
        var top = margin + row * (iconHeight + margin);

        icon.style.position = 'absolute';
        icon.style.top = top + 'px';
        icon.style.left = left + 'px';
    });
}

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
    toggleMaximizeWindow(this.closest('.window').id);
}

function closeWindow(windowId) {
    minimizeWindow(windowId);
}

function minimizeWindow(windowId) {
    var windowElement = document.getElementById(windowId);
    windowElement.style.display = 'none';
    updateTaskbarIcons();
}

function toggleMaximizeWindow(windowId) {
    var windowElement = document.getElementById(windowId);
    console.log("Toggle maximize function called for:", windowId);

    if (!windowElement) {
        console.error("Window element not found:", windowId);
        return;
    }

    if (windowElement.classList.contains('maximized')) {
        console.log("Restoring window:", windowId);
        // Restore the window to its default size and position in the center of the screen
        windowElement.style.width = windowElement.dataset.originalWidth || '80%';
        windowElement.style.height = windowElement.dataset.originalHeight || 'auto';
        windowElement.style.top = '50%';
        windowElement.style.left = '50%';
        windowElement.style.transform = 'translate(-50%, -50%)';
        windowElement.classList.remove('maximized');
        console.log("Restored state:", {
            width: windowElement.style.width,
            height: windowElement.style.height,
            top: windowElement.style.top,
            left: windowElement.style.left,
            transform: windowElement.style.transform
        });
    } else {
        console.log("Maximizing window:", windowId);
        // Store the original size and position
        windowElement.dataset.originalWidth = windowElement.style.width;
        windowElement.dataset.originalHeight = windowElement.style.height;
        windowElement.dataset.originalTop = windowElement.style.top;
        windowElement.dataset.originalLeft = windowElement.style.left;
        windowElement.dataset.originalTransform = windowElement.style.transform;

        console.log("Stored original state:", {
            width: windowElement.dataset.originalWidth,
            height: windowElement.dataset.originalHeight,
            top: windowElement.dataset.originalTop,
            left: windowElement.dataset.originalLeft,
            transform: windowElement.dataset.originalTransform
        });

        // Maximize the window
        windowElement.style.width = '100%';
        windowElement.style.height = '100%';
        windowElement.style.top = '0';
        windowElement.style.left = '0';
        windowElement.style.transform = 'none';
        windowElement.classList.add('maximized');

        console.log("Window maximized:", {
            width: windowElement.style.width,
            height: windowElement.style.height,
            top: windowElement.style.top,
            left: windowElement.style.left,
            transform: windowElement.style.transform
        });
    }
}





function openWindow(windowId) {
    var windowElement = document.getElementById(windowId);
    windowElement.style.display = 'block';
    windowElement.style.visibility = 'hidden'; // Temporarily hide to get dimensions

    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;

    if (screenWidth <= 768) { // Mobile devices
        windowElement.style.width = '95%';
        windowElement.style.height = '95%';
        windowElement.style.top = '2.5%';
        windowElement.style.left = '2.5%';
        windowElement.style.transform = 'none';
    } else { // Desktop devices
        var defaultWidth = 800;
        var defaultHeight = 500;

        var width = parseInt(windowElement.getAttribute('data-width')) || defaultWidth;
        var height = parseInt(windowElement.getAttribute('data-height')) || defaultHeight;

        // Ensure height does not exceed screen height
        if (height > screenHeight) {
            height = screenHeight * 0.9; // Adjust to fit within the viewport
        }

        // Apply width and height
        windowElement.style.width = width + 'px';
        windowElement.style.height = height + 'px';

        // Calculate the position to center the window
        var windowWidth = windowElement.offsetWidth;
        var windowHeight = windowElement.offsetHeight;
        var left = (screenWidth - windowWidth) / 2;
        var top = (screenHeight - windowHeight) / 2;

        windowElement.style.left = left + 'px';
        windowElement.style.top = top + 'px';
        windowElement.style.transform = 'none';
    }

    windowElement.style.position = 'absolute';
    windowElement.style.visibility = 'visible'; // Make visible again
    windowElement.classList.add('show');
    updateTaskbarIcons();
}


function toggleStartMenu() {
    var startMenu = document.getElementById('startMenu');
    startMenu.classList.toggle('show');
}

function updateTime() {
    var now = new Date();
    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');
    var timeString = hours + ':' + minutes;
    document.getElementById('taskbarTime').innerText = timeString;
}

function updateTaskbarIcons() {
    var taskbarIcons = document.getElementById('taskbarIcons');
    taskbarIcons.innerHTML = '';

    var windows = document.querySelectorAll('.window.show');
    windows.forEach(function(window) {
        var icon = document.createElement('img');
        icon.src = 'assets/images/folder-icon.png'; // Use relevant icon
        icon.alt = 'Window Icon';
        icon.onclick = function() {
            restoreWindow(window.id);
        };
        taskbarIcons.appendChild(icon);
    });
}

function restoreWindow(windowId) {
    var window = document.getElementById(windowId);
    window.style.display = 'block';
    window.classList.add('show');
}

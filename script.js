document.addEventListener('DOMContentLoaded', function() {
    setTimeout(hideLoadingScreen, 3000); // Show loading screen for 3 seconds

    initializeWindows();
    initializeIcons();

    // Set up double-click and touch events for icons
    function setupIconEvents(iconId, openFunction) {
        var icon = document.getElementById(iconId);

        icon.ondblclick = function() {
            openFunction();
        };

        enableSingleClickHighlight(icon);

        let lastTouchTime = 0;
        const doubleTapThreshold = 300;

        icon.addEventListener('touchend', function(event) {
            var currentTime = new Date().getTime();
            var timeDiff = currentTime - lastTouchTime;

            if (timeDiff < doubleTapThreshold && timeDiff > 0) {
                openFunction();
            } else {
                highlightIcon(icon);
            }

            lastTouchTime = currentTime;
        });

        icon.addEventListener('click', function(event) {
            // Call highlight function directly for mouse clicks
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
    setupIconEvents('icon8', function() { openBrowserWindow(); }); // New icon for the browser window

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

function highlightIcon(target) {
    // Remove highlight from any previously highlighted icon
    var highlighted = document.querySelector('.icon.highlighted');
    if (highlighted) {
        highlighted.classList.remove('highlighted');
    }

    // Highlight the clicked icon
    if (target && target.classList) {
        target.classList.add('highlighted');
    }
}

function enableSingleClickHighlight(element) {
    element.addEventListener('click', function(event) {
        // Call highlight function directly for mouse clicks
        highlightIcon(element);
    });

    element.addEventListener('touchstart', function(event) {
        // No action needed for touchstart in this simplified version
    });

    element.addEventListener('touchend', function(event) {
        highlightIcon(element);
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




function updateTime() {
    var now = new Date();
    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');
    var timeString = hours + ':' + minutes;
    document.getElementById('taskbarTime').querySelector('span').innerText = timeString;
}

// Initialize the taskbar time and set it to update every minute
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 60000); // Update every minute
});

function updateTaskbarIcons() {
    var taskbarIcons = document.getElementById('taskbarIcons');
    taskbarIcons.innerHTML = '';  // Clear existing icons to refresh the list

    // Select all windows that are currently being shown
    var windows = document.querySelectorAll('.window.show');
    windows.forEach(function(window) {
        var windowId = window.id;
        // Query the desktop icon using a selector that matches the window ID in the 'ondblclick' attribute
        var desktopIcon = document.querySelector(`.icon[ondblclick*="${windowId}"] img`);
        
        if (desktopIcon) {
            // Create a new image element for the taskbar icon
            var icon = document.createElement('img');
            icon.src = desktopIcon.src; // Use the same src as the desktop icon
            icon.alt = desktopIcon.alt; // Use the same alt text for accessibility
            icon.onclick = function() {
                restoreWindow(windowId);  // Function to restore the window when icon is clicked
            };
            taskbarIcons.appendChild(icon);  // Append the new icon to the taskbar
        }
    });
}



function restoreWindow(windowId) {
    var windowElement = document.getElementById(windowId);
    if (windowElement) {
        windowElement.classList.add('show');
        windowElement.style.display = 'block';
    }
    updateTaskbarIcons();
}

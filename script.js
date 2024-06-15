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
    setupIconEvents('icon8', function() { openWindow('deathPredictionWindow'); });
    
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

        // Dehighlight icons when clicking outside
        if (!event.target.closest('.icon')) {
            document.querySelectorAll('.icon.highlighted').forEach(function(icon) {
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
            windowElement.classList.add('show');
            windowElement.style.display = 'block'; // Restore the window
        }
        updateTaskbarIcons();
    }
}

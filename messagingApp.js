(function() {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded event fired'); // Log when DOMContentLoaded event fires

        window.openWindow = function(windowId) {
            console.log(`openWindow called with windowId: ${windowId}`); // Log openWindow calls
            const windowElement = document.getElementById(windowId);
            windowElement.classList.add('show');

            // Get screen dimensions
            var screenWidth = window.innerWidth;
            var screenHeight = window.innerHeight;

            // Set window size dynamically
            if (screenWidth <= 768) {
                windowElement.style.width = '95%';
                windowElement.style.height = '90%'; // Slightly less tall to account for the taskbar
                windowElement.style.top = '5%'; // Moved up a bit
                windowElement.style.left = '2.5%';
            } else {
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
            }

            windowElement.style.transform = 'none';
            windowElement.style.position = 'absolute';
        }

        window.minimizeWindow = function(windowId) {
            console.log(`minimizeWindow called with windowId: ${windowId}`); // Log minimizeWindow calls
            document.getElementById(windowId).classList.remove('show');
        }

        window.maximizeWindow = function(windowId) {
            console.log(`maximizeWindow called with windowId: ${windowId}`); // Log maximizeWindow calls
            document.getElementById(windowId).classList.toggle('maximized');
        }

        window.handleTouch = function(event, windowId) {
            console.log(`handleTouch called with event: ${event.type} and windowId: ${windowId}`); // Log handleTouch calls
            event.preventDefault();
            openWindow(windowId);
        }

        console.log('All functions defined and exposed to global scope'); // Confirm function definitions
    });
})();

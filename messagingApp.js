(function() {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded event fired'); // Log when DOMContentLoaded event fires

        window.openWindow = function(windowId) {
            console.log(`openWindow called with windowId: ${windowId}`); // Log openWindow calls
            const windowElement = document.getElementById(windowId);
            console.log(`windowElement: `, windowElement); // Log the window element
        
            if (!windowElement) {
                console.error(`Element with ID ${windowId} not found.`);
                return;
            }
        
            windowElement.classList.add('show');
            windowElement.style.display = 'block';
            console.log(`windowElement after adding show class and setting display block: `, windowElement); // Log after showing window
        
            // Get screen dimensions
            var screenWidth = window.innerWidth;
            var screenHeight = window.innerHeight;
            console.log(`screenWidth: ${screenWidth}, screenHeight: ${screenHeight}`); // Log screen dimensions
        
            // Set window size dynamically
            if (screenWidth <= 768) {
                windowElement.style.width = '95%';
                windowElement.style.height = '90%'; // Slightly less tall to account for the taskbar
                windowElement.style.top = '10%'; // Moved up a bit
                windowElement.style.left = '2.5%';
            } else {
                var defaultWidth = 800;
                var defaultHeight = 500;
        
                var width = parseInt(windowElement.getAttribute('data-width')) || defaultWidth;
                var height = parseInt(windowElement.getAttribute('data-height')) || defaultHeight;
                console.log(`width: ${width}, height: ${height}`); // Log width and height
        
                // Ensure height does not exceed screen height
                if (height > screenHeight) {
                    height = screenHeight * 0.9; // Adjust to fit within the viewport
                }
        
                // Apply width and height
                windowElement.style.width = width + 'px';
                windowElement.style.height = height + 'px';
                console.log(`Adjusted windowElement size: `, windowElement); // Log adjusted size
        
                // Calculate the position to center the window
                var windowWidth = windowElement.offsetWidth;
                var windowHeight = windowElement.offsetHeight;
                var left = (screenWidth - windowWidth) / 2;
                var top = (screenHeight - windowHeight) / 2;
        
                windowElement.style.left = left + 'px';
                windowElement.style.top = top + 'px';
                console.log(`Calculated position left: ${left}, top: ${top}`); // Log calculated position
            }
        
            windowElement.style.transform = 'none';
            windowElement.style.position = 'absolute';
            console.log(`Final windowElement style: `, windowElement); // Log final window element style
        
            // Bring the window to the front
            console.log(`Calling bringToFront with element: `, windowElement); // Log before bringing to front
            try {
                bringToFront(windowElement);
                console.log(`Window brought to front: `, windowElement); // Log after bringing to front
            } catch (error) {
                console.error(`Error calling bringToFront: ${error.message}`);
            }
        
            // Update taskbar icons after opening a window
            console.log('Updating taskbar icons');
            updateTaskbarIcons();
        }
        

        window.minimizeWindow = function(windowId) {
            console.log(`minimizeWindow called with windowId: ${windowId}`); // Log minimizeWindow calls
            const windowElement = document.getElementById(windowId);

            if (!windowElement) {
                console.error(`Element with ID ${windowId} not found.`);
                return;
            }

            windowElement.classList.remove('show');
            windowElement.style.display = 'none'; // Hide the window
            updateTaskbarIcons(); // Update taskbar icons after minimizing a window
        }

        window.maximizeWindow = function(windowId) {
            console.log(`maximizeWindow called with windowId: ${windowId}`); // Log maximizeWindow calls
            const windowElement = document.getElementById(windowId);

            if (!windowElement) {
                console.error(`Element with ID ${windowId} not found.`);
                return;
            }

            const isMaximized = windowElement.classList.toggle('maximized');

            if (isMaximized) {
                windowElement.style.width = '100vw';
                windowElement.style.height = '100vh';
                windowElement.style.top = '0';
                windowElement.style.left = '0';
                windowElement.style.transform = 'none';
            } else {
                openWindow(windowId); // Reset to default size and position
            }
            
            updateTaskbarIcons(); // Update taskbar icons after maximizing a window
        }

        window.closeWindow = function(windowId) {
            console.log(`closeWindow called with windowId: ${windowId}`); // Log closeWindow calls
            const windowElement = document.getElementById(windowId);

            if (!windowElement) {
                console.error(`Element with ID ${windowId} not found.`);
                return;
            }

            windowElement.classList.remove('show');
            windowElement.style.display = 'none'; // Hide the window
            updateTaskbarIcons(); // Update taskbar icons after closing a window
        }

        window.handleTouch = function(event, windowId) {
            console.log(`handleTouch called with event: ${event.type} and windowId: ${windowId}`); // Log handleTouch calls
            event.preventDefault();
            openWindow(windowId);
        }

        console.log('All functions defined and exposed to global scope'); // Confirm function definitions
    });
})();

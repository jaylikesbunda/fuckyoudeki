(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded event fired'); // Log when DOMContentLoaded event fires

        const updateAndLog = (msg, element) => {
            console.log(msg, element);
            updateTaskbarIcons();
        };

        const getElement = (windowId) => {
            const element = document.getElementById(windowId);
            if (!element) {
                console.error(`Element with ID ${windowId} not found.`);
                return null;
            }
            return element;
        };

        window.openWindow = function (windowId) {
            console.log(`openWindow called with windowId: ${windowId}`); // Log openWindow calls
            const windowElement = getElement(windowId);
            if (!windowElement) return;

            windowElement.classList.add('show');
            windowElement.style.display = 'block';
            updateAndLog(`windowElement after adding show class and setting display block: `, windowElement);

            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            console.log(`screenWidth: ${screenWidth}, screenHeight: ${screenHeight}`); // Log screen dimensions

            if (screenWidth <= 768) {
                Object.assign(windowElement.style, {
                    width: '95%',
                    height: '90%',
                    top: '1%',
                    left: '2.5%'
                });
            } else {
                const defaultSize = { width: 800, height: 500 };
                const width = parseInt(windowElement.getAttribute('data-width')) || defaultSize.width;
                let height = parseInt(windowElement.getAttribute('data-height')) || defaultSize.height;
                if (height > screenHeight) {
                    height = screenHeight * 0.9;
                }

                Object.assign(windowElement.style, {
                    width: `${width}px`,
                    height: `${height}px`,
                    left: `${(screenWidth - width) / 2}px`,
                    top: `${(screenHeight - height) / 2}px`
                });

                console.log(`Adjusted windowElement size: `, windowElement);
            }

            Object.assign(windowElement.style, {
                transform: 'none',
                position: 'absolute'
            });
            updateAndLog(`Final windowElement style: `, windowElement);

            try {
                bringToFront(windowElement);
                console.log(`Window brought to front: `, windowElement);
            } catch (error) {
                console.error(`Error calling bringToFront: ${error.message}`);
            }
        };

        window.minimizeWindow = function (windowId) {
            console.log(`minimizeWindow called with windowId: ${windowId}`); // Log minimizeWindow calls
            const windowElement = getElement(windowId);
            if (!windowElement) return;

            windowElement.classList.remove('show');
            windowElement.style.display = 'none'; // Hide the window
            updateAndLog('Window minimized', windowElement);
        };

        window.maximizeWindow = function (windowId) {
            console.log(`maximizeWindow called with windowId: ${windowId}`); // Log maximizeWindow calls
        
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
        
                    // Calculate the height excluding the taskbar
                    var taskbarHeight = 50; // Height of the taskbar
                    var availableHeight = window.innerHeight - taskbarHeight;
        
                    // Maximize the window
                    windowElement.style.width = '100vw';
                    windowElement.style.height = availableHeight + 'px';
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
        
            toggleMaximizeWindow(windowId); // Use the toggleMaximizeWindow function
        };
        
        
        
        window.closeWindow = function (windowId) {
            console.log(`closeWindow called with windowId: ${windowId}`); // Log closeWindow calls
            const windowElement = getElement(windowId);
            if (!windowElement) return;

            windowElement.classList.remove('show');
            windowElement.style.display = 'none'; // Hide the window
            updateAndLog('Window closed', windowElement);
        };

        window.handleTouch = function (event, windowId) {
            console.log(`handleTouch called with event: ${event.type} and windowId: ${windowId}`); // Log handleTouch calls
            event.preventDefault();
            openWindow(windowId);
        };

        console.log('All functions defined and exposed to global scope'); // Confirm function definitions
    });
})();

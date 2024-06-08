(function() {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded event fired'); // Log when DOMContentLoaded event fires

        window.openWindow = function(windowId) {
            console.log(`openWindow called with windowId: ${windowId}`); // Log openWindow calls
            document.getElementById(windowId).classList.add('show');
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

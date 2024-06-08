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

        window.submitMessage = function() {
            console.log('submitMessage called'); // Log submitMessage calls
            const username = document.getElementById('username').value;
            const message = document.getElementById('message').value;
            if (username && message) {
                console.log('Submitting message:', { username, message }); // Log the message being submitted
                // Placeholder for the database submission
                document.getElementById('message').value = ''; // Clear the textarea
            } else {
                console.log('Validation failed: Both username and message are required');
                alert("Please enter both name and message.");
            }
        }

        console.log('All functions defined and exposed to global scope'); // Confirm function definitions
    });
})();

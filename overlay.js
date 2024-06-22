function initOverlay() {
    console.log('Initializing overlay script.');

    const overlay = document.getElementById('overlay');
    console.log('Overlay element:', overlay);

    if (!overlay) {
        console.error('Overlay element not found!');
        return;
    }

    function updateOverlay() {
        console.log('Updating overlay...');
        // Force refresh the overlay by removing and re-adding it
        overlay.style.display = 'none';
        requestAnimationFrame(() => {
            overlay.style.display = 'block';
        });
    }

    // Detect zoom level changes by comparing window dimensions
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    window.addEventListener('resize', function () {
        if (window.innerWidth !== lastWidth || window.innerHeight !== lastHeight) {
            lastWidth = window.innerWidth;
            lastHeight = window.innerHeight;
            console.log('Zoom or resize detected. Updating overlay...');
            updateOverlay();
        }
    });

    // Periodically refresh the overlay to handle mobile zoom issues
    setInterval(updateOverlay, 10000); // Adjust the interval as needed

    console.log('Overlay update script initialized.');
}

document.addEventListener('DOMContentLoaded', initOverlay);

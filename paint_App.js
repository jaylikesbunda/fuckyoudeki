const PaintApp = (() => {
    let paintCanvas, paintCtx, painting = false, brushColor = 'black';

    function initializeElements() {
        paintCanvas = document.getElementById('paintCanvas');
        paintCtx = paintCanvas.getContext('2d');
    }

    function initializePaintCanvas() {
        const toolbarHeight = document.getElementById('toolbar').offsetHeight;
        const parentHeight = paintCanvas.parentElement.clientHeight;
        paintCanvas.width = paintCanvas.parentElement.clientWidth;
        paintCanvas.height = Math.max(parentHeight - toolbarHeight, 500);
        paintCtx.fillStyle = 'white';
        paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
        console.log("Canvas initialized with width:", paintCanvas.width, "and height:", paintCanvas.height);
    }

    function startPaintPosition(e) {
        e.preventDefault();
        painting = true;
        drawPaint(e);
    }

    function finishPaintPosition() {
        painting = false;
        paintCtx.beginPath();
    }

    function drawPaint(e) {
        if (!painting) return;
        paintCtx.lineWidth = 5;
        paintCtx.lineCap = 'round';
        paintCtx.strokeStyle = brushColor;

        const rect = paintCanvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        paintCtx.lineTo(x, y);
        paintCtx.stroke();
        paintCtx.beginPath();
        paintCtx.moveTo(x, y);
    }

    function changePaintColor(color) {
        brushColor = color;
    }

    function resizePaintCanvas() {
        if (paintCanvas.offsetParent === null) {
            console.log("Canvas not visible, skipping resize");
            return;
        }

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = paintCanvas.width;
        tempCanvas.height = paintCanvas.height;
        if (paintCanvas.width > 0 && paintCanvas.height > 0) {
            tempCtx.drawImage(paintCanvas, 0, 0);
        }

        const toolbarHeight = document.getElementById('toolbar').offsetHeight;
        const parentHeight = paintCanvas.parentElement.clientHeight;
        paintCanvas.width = paintCanvas.parentElement.clientWidth;
        paintCanvas.height = Math.max(parentHeight - toolbarHeight, 500);

        paintCtx.fillStyle = 'white';
        paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
        if (tempCanvas.width > 0 && tempCanvas.height > 0) {
            paintCtx.drawImage(tempCanvas, 0, 0);
        }
        console.log("Canvas resized to width:", paintCanvas.width, "and height:", paintCanvas.height);
    }

    function createPaintToolbarButtons() {
        const toolbar = document.getElementById('toolbar');
        const colors = ['black', 'red', 'green', 'blue', 'white'];
        colors.forEach(color => {
            const button = document.createElement('button');
            button.style.backgroundColor = color;
            button.style.width = '24px';
            button.style.height = '24px';
            button.style.border = '1px solid #000';
            button.style.margin = '2px';
            button.style.cursor = 'pointer';
            button.addEventListener('click', () => changePaintColor(color));
            toolbar.appendChild(button);
        });
    }

    function addEventListeners() {
        paintCanvas.addEventListener('mousedown', startPaintPosition);
        paintCanvas.addEventListener('mouseup', finishPaintPosition);
        paintCanvas.addEventListener('mousemove', drawPaint);
        paintCanvas.addEventListener('touchstart', startPaintPosition);
        paintCanvas.addEventListener('touchend', finishPaintPosition);
        paintCanvas.addEventListener('touchmove', drawPaint);
        window.addEventListener('resize', resizePaintCanvas);
    }

    return {
        initialize: function() {
            initializeElements();
            createPaintToolbarButtons();
            initializePaintCanvas();
            addEventListeners();
            window.addEventListener('load', resizePaintCanvas);
        },
        resizePaintCanvas
    };
})();

document.addEventListener('DOMContentLoaded', PaintApp.initialize);

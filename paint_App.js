document.addEventListener('DOMContentLoaded', () => {
    const paintCanvas = document.getElementById('paintCanvas');
    const paintCtx = paintCanvas.getContext('2d');
    let painting = false;
    let brushColor = 'black';

    function startPosition(e) {
        e.preventDefault();
        painting = true;
        draw(e);
    }

    function finishedPosition() {
        painting = false;
        paintCtx.beginPath();
    }

    function draw(e) {
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

    function changeColor(color) {
        brushColor = color;
    }

    function resizeCanvas() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = paintCanvas.width;
        tempCanvas.height = paintCanvas.height;
        tempCanvas.getContext('2d').drawImage(paintCanvas, 0, 0);

        paintCanvas.width = paintCanvas.clientWidth;
        paintCanvas.height = paintCanvas.clientHeight;
        paintCtx.fillStyle = 'white';
        paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
        paintCtx.drawImage(tempCanvas, 0, 0);
    }

    paintCanvas.addEventListener('mousedown', startPosition);
    paintCanvas.addEventListener('mouseup', finishedPosition);
    paintCanvas.addEventListener('mousemove', draw);
    paintCanvas.addEventListener('touchstart', startPosition);
    paintCanvas.addEventListener('touchend', finishedPosition);
    paintCanvas.addEventListener('touchmove', draw);
    window.addEventListener('resize', resizeCanvas);

    document.querySelectorAll('.toolbar button').forEach(button => {
        button.addEventListener('click', () => changeColor(button.textContent.toLowerCase()));
    });

    // Initial canvas setup
    resizeCanvas();
});

const PaintApp = (() => {
    let paintCanvas, paintCtx, painting = false, brushColor = 'black';
    const tools = {
        brush: { lineWidth: 5, lineCap: 'round', strokeStyle: 'black' },
        eraser: { lineWidth: 10, lineCap: 'round', strokeStyle: 'white' }
    };
    let currentTool = 'brush';

    function initializeElements() {
        paintCanvas = document.getElementById('paintCanvas');
        paintCtx = paintCanvas.getContext('2d');
    
        const toolbar = document.getElementById('toolbar');
        toolbar.innerHTML = ''; // Clear any existing buttons
    
        createPaintToolbarButtons(toolbar);
    }
    

    function initializePaintCanvas() {
        const toolbar = document.getElementById('toolbar');
        const titleBar = document.querySelector('.title-bar');
        const toolbarHeight = toolbar.offsetHeight;
        const titleBarHeight = titleBar.offsetHeight;
        const parentWidth = paintCanvas.parentElement.clientWidth;
        const parentHeight = paintCanvas.parentElement.clientHeight;
    
        paintCanvas.width = parentWidth;
        paintCanvas.height = parentHeight - toolbarHeight - titleBarHeight;
    
        paintCtx.fillStyle = 'white';
        paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
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
    
        const rect = paintCanvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
        // Adjust for any scrolling
        const adjustedX = x - window.scrollX;
        const adjustedY = y - window.scrollY;
    
        paintCtx.lineWidth = tools[currentTool].lineWidth;
        paintCtx.lineCap = tools[currentTool].lineCap;
        paintCtx.strokeStyle = currentTool === 'eraser' ? 'white' : brushColor;
    
        paintCtx.lineTo(adjustedX, adjustedY);
        paintCtx.stroke();
        paintCtx.beginPath();
        paintCtx.moveTo(adjustedX, adjustedY);
    }
    
    
    
    function changePaintColor(color) {
        brushColor = color;
    }

    function changeTool(tool) {
        if (tools[tool]) {
            currentTool = tool;
        }
    }

    function resizePaintCanvas() {
        if (paintCanvas.offsetParent === null) {
            return;
        }
    
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = paintCanvas.width;
        tempCanvas.height = paintCanvas.height;
    
        // Ensure tempCanvas is not empty before drawing
        if (paintCanvas.width > 0 && paintCanvas.height > 0) {
            tempCtx.drawImage(paintCanvas, 0, 0);
        }
    
        const toolbarHeight = document.getElementById('toolbar').offsetHeight;
        const parentHeight = paintCanvas.parentElement.clientHeight;
        paintCanvas.width = paintCanvas.parentElement.clientWidth;
        paintCanvas.height = Math.max(parentHeight - toolbarHeight, 500);
    
        paintCtx.fillStyle = 'white';
        paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
    
        // Only draw tempCanvas if it's not empty
        if (tempCanvas.width > 0 && tempCanvas.height > 0) {
            paintCtx.drawImage(tempCanvas, 0, 0);
        }
    }
    
    function createPaintToolbarButtons(toolbar) {
        const toolNames = [
            { name: 'brush', icon: '✏️' }, // Pencil icon
            { name: 'eraser', icon: '🧽' } // Eraser icon
        ];
    
        toolNames.forEach(tool => {
            const button = document.createElement('button');
            button.innerHTML = `<span class="toolbar-icon">${tool.icon}</span>`;
            button.className = 'toolbar-button';
            button.addEventListener('click', () => changeTool(tool.name));
            toolbar.appendChild(button);
        });
    
        // Custom color picker button
        const colorPickerWrapper = document.createElement('div');
        colorPickerWrapper.className = 'color-picker-wrapper';
    
        const colorPickerButton = document.createElement('button');
        colorPickerButton.className = 'toolbar-button';
        colorPickerButton.innerHTML = `<span class="toolbar-icon">🎨</span>`; // Paint palette icon
        colorPickerButton.addEventListener('click', () => {
            colorPicker.click();
        });
        colorPickerWrapper.appendChild(colorPickerButton);
    
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.id = 'colorPicker';
        colorPicker.className = 'hidden-color-picker';
        colorPicker.addEventListener('input', (e) => changePaintColor(e.target.value));
        colorPickerWrapper.appendChild(colorPicker);
    
        toolbar.appendChild(colorPickerWrapper);
    
        // Brush size selector
        const brushSizeWrapper = document.createElement('div');
        brushSizeWrapper.className = 'brush-size-wrapper';
        const brushSizeLabel = document.createElement('label');
        brushSizeLabel.textContent = 'Size';
        brushSizeWrapper.appendChild(brushSizeLabel);
    
        const brushSizeInput = document.createElement('input');
        brushSizeInput.type = 'number';
        brushSizeInput.min = 1;
        brushSizeInput.max = 50;
        brushSizeInput.value = tools.brush.lineWidth;
        brushSizeInput.className = 'brush-size-input';
        brushSizeInput.addEventListener('input', (e) => changeBrushSize(e.target.value));
        brushSizeWrapper.appendChild(brushSizeInput);
    
        toolbar.appendChild(brushSizeWrapper);
    }
    
    function changeBrushSize(size) {
        tools.brush.lineWidth = size;
        tools.eraser.lineWidth = size;
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
            initializePaintCanvas();
            addEventListeners();
            window.addEventListener('load', resizePaintCanvas);
        },
        resizePaintCanvas,
        changeTool
    };


})();

document.addEventListener('DOMContentLoaded', PaintApp.initialize);

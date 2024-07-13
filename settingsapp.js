document.addEventListener('DOMContentLoaded', () => {
    // Function to create settings content
    function createSettingsContent() {
        const settingsContent = document.getElementById('settingsContent');

        // Create and append background color setting
        const bgColorSection = createSettingSection('Change Background Color', 'color', 'backgroundColorPicker', changeBackgroundColor);
        bgColorSection.querySelector('input').value = localStorage.getItem('backgroundColor') || '#008080';

        // Create and append time zone setting
        const timeZoneSection = createSettingSection('Adjust Time Zone', 'select', 'timeZoneSelect', changeTimeZone);
        const timeZoneSelect = timeZoneSection.querySelector('select');
        const timeZones = Intl.supportedValuesOf('timeZone');
        timeZones.forEach(zone => {
            const option = document.createElement('option');
            option.value = zone;
            option.text = zone;
            timeZoneSelect.appendChild(option);
        });
        timeZoneSelect.value = localStorage.getItem('timeZone') || 'UTC';

        // Create and append time format setting (24-hour vs 12-hour)
        const timeFormatSection = createSettingSection('Time Format', 'select', 'timeFormatSelect', changeTimeFormat);
        const timeFormatSelect = timeFormatSection.querySelector('select');
        const timeFormats = ['12-hour', '24-hour'];
        timeFormats.forEach(format => {
            const option = document.createElement('option');
            option.value = format;
            option.text = format;
            timeFormatSelect.appendChild(option);
        });
        timeFormatSelect.value = localStorage.getItem('timeFormat') || '12-hour';

        // Create and append mouse settings
        const mouseSettingsSection = createSettingSection('Mouse Settings', 'range', 'pointerSpeed', changePointerSpeed);
        mouseSettingsSection.querySelector('input').min = 1;
        mouseSettingsSection.querySelector('input').max = 10;
        mouseSettingsSection.querySelector('input').value = localStorage.getItem('pointerSpeed') || 5;

        // Create and append accessibility options
        const accessibilitySection = createSettingSection('Accessibility Options', 'checkbox', 'highContrast', toggleHighContrast);
        const highContrastCheckbox = accessibilitySection.querySelector('input');
        highContrastCheckbox.checked = localStorage.getItem('highContrast') === 'true';

        // Create and append pixelated overlay setting
        const overlaySection = createSettingSection('Disable Pixelated Overlay', 'checkbox', 'pixelatedOverlay', togglePixelatedOverlay);
        const overlayCheckbox = overlaySection.querySelector('input');
        overlayCheckbox.checked = localStorage.getItem('pixelatedOverlay') === 'false';

        // Append sections to settings content
        settingsContent.appendChild(bgColorSection);
        settingsContent.appendChild(timeZoneSection);
        settingsContent.appendChild(timeFormatSection);
        settingsContent.appendChild(mouseSettingsSection);
        settingsContent.appendChild(accessibilitySection);
        settingsContent.appendChild(overlaySection);

        // Load settings from localStorage
        loadSettings();
    }

    // Helper function to create a settings section
    function createSettingSection(titleText, inputType, inputId, changeHandler) {
        const section = document.createElement('div');
        section.className = 'settings-section';
        const title = document.createElement('h3');
        title.innerText = titleText;
        const input = document.createElement(inputType === 'select' ? 'select' : 'input');
        input.type = inputType;
        input.id = inputId;
        input.addEventListener('change', changeHandler);
        section.appendChild(title);
        section.appendChild(input);
        return section;
    }

    // Function to change background color
    function changeBackgroundColor(event) {
        const color = event.target.value;
        document.body.style.backgroundColor = color;
        localStorage.setItem('backgroundColor', color);
    }

    // Function to change time zone
    function changeTimeZone(event) {
        const timeZone = event.target.value;
        localStorage.setItem('timeZone', timeZone);
        updateTime();
    }

    // Function to change time format (24-hour vs 12-hour)
    function changeTimeFormat(event) {
        const timeFormat = event.target.value;
        localStorage.setItem('timeFormat', timeFormat);
        updateTime();
    }

    // Function to change pointer speed
    function changePointerSpeed(event) {
        const speed = event.target.value;
        localStorage.setItem('pointerSpeed', speed);
        // Apply pointer speed change logic here if needed
    }

    // Function to toggle high contrast mode
    function toggleHighContrast(event) {
        const highContrast = event.target.checked;
        localStorage.setItem('highContrast', highContrast);
        document.body.classList.toggle('high-contrast', highContrast);
    }

    // Function to toggle pixelated overlay
    function togglePixelatedOverlay(event) {
        const overlayEnabled = !event.target.checked;
        localStorage.setItem('pixelatedOverlay', overlayEnabled);
        document.querySelector('.overlay').classList.toggle('hidden-overlay', !overlayEnabled);
    }



    // Function to load settings from localStorage
    function loadSettings() {
        const savedBackgroundColor = localStorage.getItem('backgroundColor');
        if (savedBackgroundColor) {
            document.body.style.backgroundColor = savedBackgroundColor;
        }

        const savedTimeZone = localStorage.getItem('timeZone');
        if (savedTimeZone) {
            document.getElementById('timeZoneSelect').value = savedTimeZone;
        }

        const savedTimeFormat = localStorage.getItem('timeFormat');
        if (savedTimeFormat) {
            document.getElementById('timeFormatSelect').value = savedTimeFormat;
        }

        const savedPointerSpeed = localStorage.getItem('pointerSpeed');
        if (savedPointerSpeed) {
            document.getElementById('pointerSpeed').value = savedPointerSpeed;
        }

        const savedHighContrast = localStorage.getItem('highContrast') === 'true';
        document.getElementById('highContrast').checked = savedHighContrast;
        document.body.classList.toggle('high-contrast', savedHighContrast);

        const savedOverlayEnabled = localStorage.getItem('pixelatedOverlay') !== 'false';
        document.getElementById('pixelatedOverlay').checked = !savedOverlayEnabled;
        document.querySelector('.overlay').classList.toggle('hidden-overlay', !savedOverlayEnabled);

        updateTime();
    }

    // Function to handle window actions
    function handleWindowActions() {
        document.querySelectorAll('.title-bar-controls button').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                const windowElement = e.target.closest('.window');
                if (action === 'minimize') {
                    windowElement.style.display = 'none';
                } else if (action === 'maximize') {
                    windowElement.classList.toggle('maximized');
                } else if (action === 'close') {
                    windowElement.style.display = 'none';
                }
            });
        });
    }

    // Initialize the settings, handle window actions, and set the taskbar time to update every minute
    createSettingsContent();
    handleWindowActions();
});

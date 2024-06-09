document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired'); // Log when DOMContentLoaded event fires

    let adventureData = null;
    let currentState = 'start';

    // Function to load the adventure game JSON data
    async function loadAdventureData() {
        try {
            const response = await fetch('./adventure.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.text(); // Get the raw text
            try {
                adventureData = JSON.parse(data); // Attempt to parse the JSON data
                console.log('Adventure game data loaded successfully.');
                return true;
            } catch (jsonError) {
                console.error('Error parsing adventure game data:', jsonError);
                adventureData = tryPartialParse(data); // Attempt partial parsing
                if (adventureData) {
                    console.log('Partially loaded adventure game data.');
                    return true;
                } else {
                    return false;
                }
            }
        } catch (networkError) {
            console.error('Error loading adventure game data:', networkError);
            return false;
        }
    }

    // Function to attempt partial parsing of the JSON data
    function tryPartialParse(data) {
        let sanitizedData = data;

        // Attempt to fix common JSON errors
        sanitizedData = sanitizedData
            .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas
            .replace(/([{,])\s*([^":\s]+)\s*:/g, '$1"$2":') // Quote unquoted keys
            .replace(/,\s*$/, '') // Remove trailing commas at end of file
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":') // Ensure keys are quoted
            .replace(/:\s*(['"])?([a-zA-Z0-9_]+)(['"])?(\s*,?)/g, ': "$2"$4'); // Ensure values are quoted

        try {
            return JSON.parse(sanitizedData);
        } catch (e) {
            console.error('Sanitized parse failed:', e);
            return null;
        }
    }

    // Terminal commands
    const commands = {
        clear: function(outputElement) {
            outputElement.value = '';
        },
        help: function(outputElement) {
            const helpText = `
Available commands:
  clear     - Clears the terminal screen
  help      - Displays this help text
  echo      - Echoes the input text
  list      - Lists mock files
  start     - Starts the text adventure game
  choice    - Make a choice in the text adventure game (usage: choice <option>)
            `;
            outputElement.value += helpText;
        },
        echo: function(outputElement, args) {
            const echoText = args.join(' ') + '\n';
            outputElement.value += echoText;
        },
        list: function(outputElement) {
            const files = `
Mock file listing:
  file1.txt
  file2.txt
  directory1/
  directory2/
            `;
            outputElement.value += files;
        },
        start: async function(outputElement) {
            const loaded = await loadAdventureData();
            if (!loaded) {
                outputElement.value += 'Adventure game data not loaded. Check JSON file for syntax errors.\n';
                return;
            }
            currentState = 'start';
            displayState(outputElement);
        },
        choice: function(outputElement, args) {
            if (!adventureData) {
                outputElement.value += 'Adventure game data not loaded.\n';
                return;
            }
            if (currentState === 'start') {
                outputElement.value += 'Game not started. Use the "start" command to begin.\n';
                return;
            }
            const choiceInput = args.join(' ').toLowerCase();
            const choices = Object.keys(adventureData[currentState].choices);
            const choice = choices.find(c => c.toLowerCase().includes(choiceInput));
            if (choice) {
                currentState = adventureData[currentState].choices[choice];
                displayState(outputElement);
            } else {
                outputElement.value += `Invalid choice: ${choiceInput}. Please try again.\n`;
            }
        }
    };

    // Display the current state of the text adventure game
    function displayState(outputElement) {
        const state = adventureData[currentState];
        outputElement.value += `\n${state.description}\n`;
        Object.keys(state.choices).forEach(choice => {
            outputElement.value += `- ${choice}\n`;
        });
        outputElement.scrollTop = outputElement.scrollHeight; // Scroll to the bottom
    }

    // Terminal input handling
    window.handleTerminalInput = function(event) {
        if (event.key === 'Enter') {
            const input = document.getElementById('terminalInput').value.trim();
            const output = document.getElementById('terminalOutput');
            output.value += `\n$ ${input}\n`;
            document.getElementById('terminalInput').value = ''; // Clear input

            if (input) {
                const [command, ...args] = input.split(' ');
                if (commands[command]) {
                    commands[command](output, args);
                } else {
                    output.value += `Command not found: ${command}\n`;
                }
                output.scrollTop = output.scrollHeight; // Scroll to the bottom
            }
        }
    }

    // Show programs list on hover or touch
    window.showPrograms = function() {
        const programsDropdown = document.getElementById('programsDropdown');
        const programs = document.getElementById('programs');
        programs.innerHTML = ''; // Clear existing items
        const icons = document.querySelectorAll('#desktop .icon');
        icons.forEach(icon => {
            const listItem = document.createElement('li');
            const img = icon.querySelector('img').cloneNode();
            const text = document.createElement('span');
            text.textContent = icon.querySelector('span').textContent;
            listItem.appendChild(img);
            listItem.appendChild(text);

            listItem.onclick = () => {
                const iconId = icon.id;
                if (iconId === 'icon1') {
                    openWindow('mainWindow');
                } else if (iconId === 'icon2') {
                    redirectToURL('https://fuckyoufm.net');
                } else if (iconId === 'icon3') {
                    redirectToURL('https://vapefacts.com.au');
                } else if (iconId === 'icon4') {
                    openWindow('snakeWindow');
                } else if (iconId === 'icon5') {
                    openWindow('paintWindow');
                } else if (iconId === 'icon6') {
                    openWindow('messagingWindow');
                } else if (iconId === 'icon7') {
                    openWindow('terminalWindow');
                }
            };

            programs.appendChild(listItem);
        });
        programsDropdown.style.display = 'block';
    }

    // Hide programs list when not hovering or touching
    document.addEventListener('click', (event) => {
        const programsDropdown = document.getElementById('programsDropdown');
        if (!event.target.closest('#programsList')) {
            programsDropdown.style.display = 'none';
        }
    });

    console.log('All functions defined and exposed to global scope'); // Confirm function definitions
});

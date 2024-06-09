document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');

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
                console.log('Adventure game data loaded successfully as JSON.');
                return true;
            } catch (jsonError) {
                console.error('Error parsing adventure game data as JSON:', jsonError);
                adventureData = tryPartialParse(data); // Attempt partial parsing
                if (adventureData) {
                    console.log('Partially loaded adventure game data.');
                    return true;
                } else {
                    console.log('Attempting plain text parsing as a final backup.');
                    adventureData = parseAsPlainText(data);
                    if (adventureData) {
                        console.log('Plain text parsing successful.');
                        return true;
                    } else {
                        console.error('Plain text parsing failed.');
                        return false;
                    }
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

        // First pass at cleaning the JSON
        sanitizedData = sanitizedData
            .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas
            .replace(/([{,])\s*([^":\s]+)\s*:/g, '$1"$2":') // Quote unquoted keys
            .replace(/,\s*$/, '') // Remove trailing commas at end of file
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":') // Ensure keys are quoted
            .replace(/:\s*(['"])?([a-zA-Z0-9_]+)(['"])?(\s*,?)/g, ': "$2"$4') // Ensure values are quoted
            .replace(/:\s*(['"])?([^",\s\]}]+)(['"])?(\s*,?)/g, ': "$2"$4'); // Quote unquoted string values

        try {
            return JSON.parse(sanitizedData);
        } catch (e) {
            console.error('Sanitized parse failed:', e);

            // Further attempts to sanitize the JSON by fixing specific issues
            sanitizedData = sanitizedData
                .replace(/\\[rn]/g, '') // Remove escape sequences
                .replace(/\s*([{}[\],])\s*/g, '$1') // Remove unnecessary whitespaces
                .replace(/(\w+):/g, '"$1":') // Ensure all keys are quoted
                .replace(/:\s*([^",\s\]}]+)/g, ': "$1"'); // Ensure all values are quoted

            try {
                return JSON.parse(sanitizedData);
            } catch (secondError) {
                console.error('Further sanitized parse failed:', secondError);

                // Attempt a final cleaning with more aggressive strategies
                sanitizedData = sanitizedData
                    .replace(/'/g, '"') // Replace single quotes with double quotes
                    .replace(/(\s+)?\n(\s+)?/g, '') // Remove newlines
                    .replace(/([^,\s])}/g, '$1,}') // Add missing commas before closing braces
                    .replace(/([^,\s])]/g, '$1,]'); // Add missing commas before closing brackets

                try {
                    return JSON.parse(sanitizedData);
                } catch (finalError) {
                    console.error('Final sanitized parse failed:', finalError);
                    return null;
                }
            }
        }
    }

    function parseAsPlainText(data) {
        const adventureData = {};
        const nodePattern = /"(\w+)":\s*{\s*"description":\s*"([^"]+)",\s*"choices":\s*{([^}]*)}\s*}/g;
        const choicePattern = /"([^"]+)":\s*"([^"]+)"/g;
    
        let match;
        while ((match = nodePattern.exec(data)) !== null) {
            const nodeName = match[1];
            const description = match[2];
            const choicesText = match[3].trim();
            const choices = {};
            
            let choiceMatch;
            while ((choiceMatch = choicePattern.exec(choicesText)) !== null) {
                const choiceDescription = choiceMatch[1].trim();
                const nextState = choiceMatch[2].trim();
                choices[choiceDescription] = nextState;
            }
    
            adventureData[nodeName] = {
                description: description,
                choices: choices
            };
        }
    
        return adventureData;
    }
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
      start     - Starts the text adventure game and asks for arch nemesis
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
            try {
                const nemesis = prompt("Who is your arch nemesis?");
                if (!nemesis) throw new Error('No nemesis provided. Please start again.');
                const loaded = await loadAdventureData();
                if (!loaded) {
                    throw new Error('Adventure game data not loaded. Check JSON file for syntax errors.');
                }
                console.log('Adventure data:', adventureData); // Debug: show adventure data
                if (!adventureData['start']) {
                    throw new Error('Initial state "start" not found in adventure data.');
                }
                currentState = 'start';
                adventureData.nemesis = nemesis;
                displayState(outputElement);
            } catch (error) {
                outputElement.value += `${error.message}\n`;
            }
        },
        choice: function(outputElement, args) {
            try {
                if (!adventureData) {
                    throw new Error('Adventure game data not loaded.');
                }
                if (!currentState || !adventureData[currentState]) {
                    throw new Error('Game not started or invalid state. Use the "start" command to begin.');
                }
                const choiceInput = args.join(' ').toLowerCase().replace(/\s+/g, '_');
                const choices = Object.keys(adventureData[currentState].choices);
                const choice = choices.find(c => c.toLowerCase() === choiceInput);
                if (choice) {
                    currentState = adventureData[currentState].choices[choice];
                    displayState(outputElement);
                } else {
                    outputElement.value += `Invalid choice: ${choiceInput}. Please try again.\n`;
                }
            } catch (error) {
                outputElement.value += `${error.message}\n`;
            }
        }
    };
    
    function displayState(outputElement) {
        try {
            if (!adventureData || !adventureData[currentState]) {
                outputElement.value += `It looks like we've hit a snag. This part of the adventure isn't written yet. Please restart the game using the "start" command or choose a different option.\n`;
                return;
            }
            const state = adventureData[currentState];
            let description = state.description.replace(/@\[\]/g, adventureData.nemesis)
                                               .replace(/@\[\]'s Mother/g, `${adventureData.nemesis}'s Mother`);
            outputElement.value += `\n${description}\n`;
    
            if (Object.keys(state.choices).length === 0) {
                outputElement.value += `It seems like this path hasn't been completed yet. Stay tuned for updates or try another choice!\n`;
            } else {
                Object.keys(state.choices).forEach(choice => {
                    outputElement.value += `- ${choice.replace(/_/g, ' ')}\n`;
                });
            }
            outputElement.scrollTop = outputElement.scrollHeight; // Scroll to the bottom
        } catch (error) {
            outputElement.value += `Oops! An error occurred: ${error.message}. Please try restarting the game.\n`;
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

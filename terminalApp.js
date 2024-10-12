document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');

    let adventureData = null;
    let currentState = 'start';

    let hackerModeActive = false;

    // Function to add typewriter effect to any output element
    function addTypewriterEffect(text, outputElement) {
        let i = 0;
        function type() {
            if (i < text.length) {
                outputElement.value += text.charAt(i);
                i++;
                setTimeout(type, 50); // Adjust typing speed as needed
            }
        }
        type();
    }

    // Global usage of the typewriter effect for any text output
    function outputText(text, outputElement) {
        outputElement.value = ''; // Clear existing content
        addTypewriterEffect(text, outputElement);
    }



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
      list      - Lists files
      start     - Starts the text adventure game
      date      - Displays the current date and time
      uptime    - Shows system uptime
      whoami    - Displays the current user
      pwd       - Prints the current working directory
      ls        - Lists directory contents
      cat       - Displays the contents of a file
      df        - Shows disk space usage
      uname     - Displays system information
      history   - Shows command history
      cal       - Displays the current month's calendar
      ipconfig  - Displays IP configuration
      useragent - Displays user agent information
      hackertext - Activates hacker text mode
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
            outputElement.value += "Please enter the name of your arch nemesis:\n";
            currentState = 'awaiting_nemesis';
        },
        receiveNemesis: async function(outputElement, nemesis) {
            if (!nemesis) {
                outputElement.value += 'No nemesis provided. Please start again.\n';
                return;
            }
            try {
                const loaded = await loadAdventureData();
                if (!loaded) {
                    throw new Error('Adventure game data not loaded. Check JSON file for syntax errors.');
                }
                if (!adventureData['start']) {
                    throw new Error('Initial state "start" not found in adventure data.');
                }
                adventureData.nemesis = nemesis;
                currentState = 'start';
                displayState(outputElement);
            } catch (error) {
                outputElement.value += `${error.message}\n`;
            }
        },
        choice: function(outputElement, args) {
            try {
                if (currentState === 'awaiting_nemesis') {
                    commands.receiveNemesis(outputElement, args.join(' '));
                    return;
                }
                if (!adventureData) {
                    throw new Error('Adventure game data not loaded.');
                }
                if (!currentState || !adventureData[currentState]) {
                    throw new Error('Game not started or invalid state. Use the "start" command to begin.');
                }
    
                const choiceInput = args.join(' ').toLowerCase();
                const choices = Object.keys(adventureData[currentState].choices);
                let choice = choices.find(c => c.toLowerCase().replace(/\s+/g, '_') === choiceInput.replace(/\s+/g, '_'));
    
                // Keyword-based matching if no exact match is found
                if (!choice) {
                    let bestMatch = null;
                    let bestMatchScore = 0;
                    choices.forEach(c => {
                        // Calculate match score based on word presence
                        let matchScore = choiceInput.split(' ').reduce((acc, inputWord) => {
                            if (c.toLowerCase().includes(inputWord)) acc += 1;
                            return acc;
                        }, 0);
                        // Update the best match if the current score is higher
                        if (matchScore > bestMatchScore) {
                            bestMatch = c;
                            bestMatchScore = matchScore;
                        }
                    });
                    choice = bestMatchScore > 0 ? bestMatch : null;
                }
    
                if (choice) {
                    currentState = adventureData[currentState].choices[choice];
                    displayState(outputElement);
                } else {
                    outputElement.value += `Invalid choice: ${choiceInput}. Please try again or type more clearly.\n`;
                }
            } catch (error) {
                outputElement.value += `${error.message}\n`;
            }
        },
        date: function(outputElement) {
            const now = new Date();
            outputElement.value += `${now}\n`;
        },
        uptime: function(outputElement) {
            // Simulating system uptime
            const uptime = 'up 1 day, 4 hours, 23 minutes';
            outputElement.value += `System uptime: ${uptime}\n`;
        },
        whoami: function(outputElement) {
            const user = 'guest';
            outputElement.value += `Current user: ${user}\n`;
        },
        pwd: function(outputElement) {
            const directory = '/home/guest';
            outputElement.value += `Current directory: ${directory}\n`;
        },
        ls: function(outputElement) {
            const files = `
    file1.txt
    file2.txt
    directory1/
    directory2/
            `;
            outputElement.value += files;
        },
        cat: function(outputElement, args) {
            const filename = args.join(' ');
            if (filename === 'file1.txt') {
                outputElement.value += `Contents of ${filename}:\nWhy are you here?\n`;
            } else if (filename === 'file2.txt') {
                outputElement.value += `Contents of ${filename}:\nThe FitnessGram Pacer test is a multistage aerobic capacity test that progressively gets more difficult as it continues. The 20 meter Pacer test will begin in 30 seconds. Line up at the start. The running speed starts slowly, but gets faster each minute after you hear this signal *boop*. A single lap should be completed each time you hear this sound *ding*. Remember to run in a straight line, and run as long as possible. The second time you fail to complete a lap before the sound, your test is over. The test will begin on the word start. On your mark, get ready, start.\n`;
            } else {
                outputElement.value += `File ${filename} not found.\n`;
            }
        },
        df: function(outputElement) {
            const diskUsage = `
    Filesystem     1K-blocks     Used Available Use% Mounted on
    /dev/sda1       10240000  6100000   4140000  60% /
    tmpfs             512000        0    512000   0% /dev/shm
            `;
            outputElement.value += diskUsage;
        },
        uname: function(outputElement) {
            const systemInfo = `Linux fuckyoudeki.net 5.4.0-42-generic #46~18.04.1-Ubuntu SMP Fri Jul 24 09:42:33 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux\n`;
            outputElement.value += systemInfo;
        },
        history: function(outputElement) {
            const history = `
    1  help
    2  list
    3  start
    4  echo Hello World!
    5  date
    6  uptime
    7  whoami
            `;
            outputElement.value += history;
        },
        cal: function(outputElement) {
            const calendar = `
        June 2024
    Su Mo Tu We Th Fr Sa
                       1
     2  3  4  5  6  7  8
     9 10 11 12 13 14 15
    16 17 18 19 20 21 22
    23 24 25 26 27 28 29
    30
            `;
            outputElement.value += calendar;
        },
        ipconfig: function(outputElement) {
            const ipconfig = `
    Ethernet adapter Local Area Connection:
    
       Connection-specific DNS Suffix  . : fuckyou.corp
       IPv4 Address. . . . . . . . . . . : 192.168.1.169
       Subnet Mask . . . . . . . . . . . : 255.255.256.0
       Default Gateway . . . . . . . . . : 192.168.1.1
    
    Wireless LAN adapter Wi-Fi:
    
       Connection-specific DNS Suffix  . : fuckyou.deki
       IPv4 Address. . . . . . . . . . . : 192.168.09.101
       Subnet Mask . . . . . . . . . . . : 255.255.256.0
       Default Gateway . . . . . . . . . : 192.168.0.1
            `;
            outputElement.value += ipconfig;
        },
        useragent: function(outputElement) {
            const userAgent = navigator.userAgent;
            outputElement.value += `User Agent: ${userAgent}\n`;
        },
        hackertext: function(outputElement) {
            const generateRandomCode = () => {
                const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'console.log'];
                const variables = ['foo', 'bar', 'baz', 'qux', 'quux'];
                const randomLines = [
                    'console.log("Hacking in progress...");',
                    'let x = Math.random();',
                    'if (x > 0.5) {',
                    'for (let i = 0; i < 10; i++) {',
                    'while (true) {',
                    'return x;',
                    'var secret = "hidden";',
                    'const password = "12345";',
                    'let result = hackSystem();',
                    'break;',
                    '}',
                    '};',
                    '}',
                    'try {',
                    'catch (error) {',
                    'finally {'
                ];
    
                let code = '';
    
                // Generate a random function or block of code
                const keyword = keywords[Math.floor(Math.random() * keywords.length)];
                const variable = variables[Math.floor(Math.random() * variables.length)];
                const randomLineCount = Math.floor(Math.random() * 10) + 5;
    
                code += `${keyword} ${variable}() {\n`;
    
                for (let i = 0; i < randomLineCount; i++) {
                    const randomLine = randomLines[Math.floor(Math.random() * randomLines.length)];
                    code += `    ${randomLine}\n`;
                }
    
                code += '}\n';
    
                return code;
            };
    
            const handleHackerKeyPress = (event) => {
                if (!hackerModeActive) return;
                const randomCode = generateRandomCode();
                outputElement.value += `${randomCode}\n`;
                outputElement.scrollTop = outputElement.scrollHeight; // Scroll to the bottom
            };
    
            if (!hackerModeActive) {
                hackerModeActive = true;
                outputElement.style.color = 'lime';
                outputElement.style.backgroundColor = 'black';
                outputElement.style.fontFamily = 'monospace';
                outputElement.value += `\nEntering hacker text mode...\n`;
                document.addEventListener('keydown', handleHackerKeyPress);
            } else {
                hackerModeActive = false;
                document.removeEventListener('keydown', handleHackerKeyPress);
                outputElement.style.color = '';
                outputElement.style.backgroundColor = '';
                outputElement.style.fontFamily = '';
                outputElement.value += `\nExiting hacker text mode...\n`;
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
    



// Update executeCommand function to use addTypewriterEffect
function executeCommand(command, args, outputElement) {
    try {
        if (commands[command]) {
            commands[command](outputElement, args);
        } else {
            addTypewriterEffect(`Command not found: ${command}\n`, outputElement);
        }
    } catch (error) {
        addTypewriterEffect(`An error occurred while executing the command: ${error.message}\n`, outputElement);
    } finally {
        outputElement.scrollTop = outputElement.scrollHeight; // Scroll to the bottom
    }
}

// Terminal input handling
window.handleTerminalInput = function(event) {
    if (event.key === 'Enter') {
        const inputElement = document.getElementById('terminalInput');
        const outputElement = document.getElementById('terminalOutput');
        const input = inputElement.value.trim();
        
        // Add user command to output
        outputElement.value += `\n$ ${input}\n`;
        inputElement.value = ''; // Clear input

        if (input) {
            const [command, ...args] = input.split(' ');
            executeCommand(command, args, outputElement);
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
            switch(iconId) {
                case 'icon1':
                    openWindow('mainWindow');
                    break;
                case 'icon2':
                    redirectToURL('https://fuckyoufm.net');
                    break;
                case 'icon3':
                    redirectToURL('https://vapefacts.com.au');
                    break;
                case 'icon4':
                    openWindow('snakeWindow');
                    break;
                case 'icon5':
                    openWindow('paintWindow');
                    break;
                case 'icon6':
                    openWindow('messagingWindow');
                    break;
                case 'icon7':
                    showCorruptedError();
                    break;
                case 'icon8':
                    openWindow('deathPredictionWindow');
                    break;
                case 'icon9':
                    openWindow('minesweeperWindow');
                    break;
                default:
                    console.error(`Unknown icon id: ${iconId}`);
                    break;
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

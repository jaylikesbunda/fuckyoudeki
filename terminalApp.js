document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired'); // Log when DOMContentLoaded event fires

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
        }
    };

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

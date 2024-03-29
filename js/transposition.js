/**
 * Text frequency analysis
 */
const frequency = [
    ["Letter", "Plain", "Standard"],
    ["a", 0, 0.082],
    ["b", 0, 0.015],
    ["c", 0, 0.028],
    ["d", 0, 0.043],
    ["e", 0, 0.127],
    ["f", 0, 0.022],
    ["g", 0, 0.02],
    ["h", 0, 0.061],
    ["i", 0, 0.07],
    ["j", 0, 0.0015],
    ["k", 0, 0.0077],
    ["l", 0, 0.04],
    ["m", 0, 0.024],
    ["n", 0, 0.067],
    ["o", 0, 0.075],
    ["p", 0, 0.019],
    ["q", 0, 0.00095],
    ["r", 0, 0.06],
    ["s", 0, 0.063],
    ["t", 0, 0.091],
    ["u", 0, 0.028],
    ["v", 0, 0.0098],
    ["w", 0, 0.024],
    ["x", 0, 0.0015],
    ["y", 0, 0.02],
    ["z", 0, 0.00074]
];

// Load Google-Chart functions
google.charts.load("current", {"packages":["bar"]});
google.charts.setOnLoadCallback(analyzeText);

/**
 * Update google bar chart.
 */
function drawChart() {
    const data = google.visualization.arrayToDataTable(frequency);
    const options = {
        chart: {
            title: "Frequency Graph"
        }
    };
    const chart = new google.charts.Bar(document.getElementById("columnchart"));
    chart.draw(data, google.charts.Bar.convertOptions(options));
}

function analyzeText() {
    const plainText = document.getElementById("plain-text").value.replace(/[^a-zA-Z]/g, "").toLowerCase();

    // Count the frequency of each letter
    const lowerFreq = {};
    for (let c of plainText) {
        lowerFreq[c] = (lowerFreq[c] ?? 0) + 1;
    }
    
    // Update frequency graph
    const lowerBase = "a".charCodeAt(0);
    for (let i = 0; i < 26; i++) {
        frequency[i + 1][1] = (lowerFreq[String.fromCharCode(lowerBase + i)] ?? 0) / (plainText.length || 1);
    }
    drawChart();


    // Count the frequency of each bigram
    const n = plainText.length;
    const bigramFreq = {};
    for (let i = 0; i < n - 2; i++) {
        const bigram = plainText.slice(i, i + 2);
        bigramFreq[bigram] = (bigramFreq[bigram] ?? 0) + 1;
    }

    // Update bigram table
    let bigramTable = "<tr><th>Cipher</th><th>Count</th><th>Frequency (%)</th></tr>\n";
    const sortedBigrams = Object.keys(bigramFreq).sort((a, b) => bigramFreq[b] - bigramFreq[a]);
    const processedBigrams = {};

    // Format each bigram and its frequency into the table
    sortedBigrams.forEach(bigram => {
        if (!processedBigrams[bigram]) {
            const freq = bigramFreq[bigram];
            const oppositeBigram = bigram[1] + bigram[0];
            const oppositeFreq = bigramFreq[oppositeBigram] || 0;

            // Add row for the bigram
            if (freq > 1) {
                bigramTable += `<tr><td>${bigram}</td><td>${freq}</td><td>${Math.round(freq / n * 10_000) / 100}%</td></tr>\n`;
                processedBigrams[bigram] = true;

                // Add row for the opposite bigram if it exists and mark it as processed
                if (oppositeFreq > 0) {
                    bigramTable += `<tr><td>${oppositeBigram}</td><td>${oppositeFreq}</td><td>${Math.round(oppositeFreq / n * 10_000) / 100}%</td></tr>\n`;
                    processedBigrams[oppositeBigram] = true;
                }
            }
        }
    });
    document.getElementById("bigram-freq").innerHTML = bigramTable;
    

    // Count the frequency of each trigram
    const trigramFreq = {};
    for (let i = 0; i < n - 3; i++) {
        const trigram = plainText.slice(i, i + 3);
        trigramFreq[trigram] = (trigramFreq[trigram] ?? 0) + 1;
    }

    // Update trigram table
    let trigramTable = "<tr><th>Cipher</th><th>Count</th><th>Frequency (%)</th></tr>\n";
    const sortedTrigrams = Object.keys(trigramFreq).sort((a, b) => trigramFreq[b] - trigramFreq[a]);

    // Format each trigram and its frequency into the table
    sortedTrigrams.forEach(trigram => {
        const freq = trigramFreq[trigram];
        if (freq > 1) {
            trigramTable += `<tr><td>${trigram}</td><td>${freq}</td><td>${Math.round(freq / n * 10_000) / 100}%</td></tr>\n`;
        }
    });
    document.getElementById("trigram-freq").innerHTML = trigramTable;
}

/**
 * Initialize global variables.
 */
let table = [];
let tableOrder = [];
let colSwap = [];
let lastControl = undefined;
const columnCheckbox = document.getElementById('column');
const rowCheckbox = document.getElementById('row');

// Add event listener to checkboxes
columnCheckbox.addEventListener('change', function() {
    rowCheckbox.checked = this.checked ? false : true;
});
rowCheckbox.addEventListener('change', function() {
    columnCheckbox.checked = this.checked ? false : true;
});

/**
 * Shift the columns of the table array left or right.
 * 
 * @param {Number} direction - 1 for right shift, -1 for left shift
 */
function shiftColumns(direction) {
    // Apply the column shifting to each row of the table array
    table.forEach(row => {
        if (direction === 1) {
            row.unshift(row.pop());
        } else {
            row.push(row.shift());
        }
    });

    // Shift column order as well;
    if (direction === 1) {
        tableOrder.unshift(tableOrder.pop());
    } else {
        tableOrder.push(tableOrder.shift());
    }

    // Re-render the table with the updated table array
    renderTable();
}

/**
 * Creates the array and HTML table given text and size.
 * 
 * @param {Number} size - Max size of each row of table.
 * @param {String} textID - ID of HTML text element to be used.
 */
function setTable(size, textID) {
    table = [[]];
    tableOrder = [];

    const text = document.getElementById(textID).value.replace(/[^a-zA-Z]/g, "");
    size = Math.min(size, text.length);
    if (document.getElementById("row").checked) {
        // Create table row by row
        for (let c of text) {
            let lastRow = table[table.length - 1];
            if (lastRow.length < size) {
                lastRow.push(c);
            } else {
                table.push([c]);
            }
        }
    } else {
        // Create table column by column
        const rows = Math.ceil(text.length / size);
        for (let i = 1; i < rows; i++) table.push([]);

        for (let i in text) {
            table[i % rows].push(text[i]);
        }
    }

    // Set table ordering to default
    for (let i = 1; i <= table[0].length; i++) tableOrder.push(i);

    renderTable();
}

/**
 * Creates and set HTML elements and listeners
 */
function renderTable() {
    // Create table header
    let tpTable = "<tr>";
    for (let i in tableOrder) {
        tpTable += `<th id="col-${parseInt(i) + 1}" class="selectable">${tableOrder[i]}</th>`;
    }
    tpTable += ' <th><button id="left-button">&lt</button> Cnsnts</th><th>Vowels <button id="right-button">&gt</button></th> </tr>';

    // Create table body using cipher text and get plain text
    for (let i = 0; i < table.length; i++) {
        let vowels = 0;

        tpTable += "<tr>";
        for (let j = 0; j < tableOrder.length; j++) {
            tpTable += `<td>${table[i][j] ?? ""}</td>`;
            if (table[i][j] !== undefined && /[aeiouAEIOU]/.test(table[i][j])) vowels++;
        }

        let consonants = tableOrder.length - vowels;
        tpTable += `<td>${consonants} (${Math.round(consonants / tableOrder.length * 1_000) / 10}%)</td>`;
        tpTable += `<td>${vowels} (${Math.round(vowels / tableOrder.length * 1_000) / 10}%)</td></tr>`;
    }

    // Update HTML elements
    document.getElementById("tp-table").innerHTML = tpTable;
    document.getElementById("left-button").onclick = () => { shiftColumns(-1) };
    document.getElementById("right-button").onclick = () => { shiftColumns(1) };

    // Set column swapping
    colSwap = [];
    for (let i = 0; i < tableOrder.length; i++) {
        let colElement = document.getElementById(`col-${i + 1}`);
        colElement.onclick = () => {
            const index = colSwap.indexOf(i);
            if (index !== -1) {
                colSwap.splice(index, 1);
                colElement.classList.toggle("selected");
            } else {
                colSwap.push(i);
    
                // Swap if two columns selected
                if (colSwap.length === 2) {
                    for (let row = 0; row < table.length; row++) {
                        let temp = table[row][colSwap[0]];
                        table[row][colSwap[0]] = table[row][colSwap[1]];
                        table[row][colSwap[1]] = temp;
                    }

                    // Swap ordering
                    let tempOrder = tableOrder[colSwap[0]];
                    tableOrder[colSwap[0]] = tableOrder[colSwap[1]];
                    tableOrder[colSwap[1]] = tempOrder;
    
                    renderTable();
                    if (lastControl === "encrypt") encryptCipher();
                    else decryptCipher();
                } else colElement.classList.toggle("selected");
            }
        }
    }

    // Frequency analysis
    analyzeText();
}

/**
 * Determines the character ordering of provided string.
 * 
 * @param {String} key - Key to analyze character ordering of.
 * @returns {Number[]} - Array of indicies representing letter order.
 */
function getKeyOrder(key) {
    // Create an array to hold the positions of letters
    const base = "A".charCodeAt(0);
    const codes = key.split("").map(c => c.charCodeAt(0) - base);
    const orderedCodes = codes.slice();

    // Increment codes if necessary
    const records = new Set();
    for (let i in codes) {
        let c1 = codes[i];

        if (records.has(c1)) {
            // Nested loop to increment all greater/equal char codes
            for (let j in codes) {
                let c2 = codes[j]

                if (c2 > c1 || (c2 === c1 && j >= i)) {
                    orderedCodes[j]++;
                }
            }
        } else records.add(c1);
    }
  
    // Sort the ordered codes and get their positions
    const sortedArray = orderedCodes.slice().sort((a, b) => a - b);
    const positions = {};
    sortedArray.forEach((element, index) => {
        positions[element] = index;
    });

    // Create an array to store position indices
    const indices = orderedCodes.map(element => positions[element] + 1);

    // Return the array of position indices in sorted order
    return indices;
}

/**
 * Caclualtes all possible factors of provided number.
 * 
 * @param {Number} number - Original number to factorize.
 * @returns {Number[]} - Array of all possible factors.
 */
function getFactors(number) {
    // Initialize an array to store factors
    let factors = [];

    // Iterate up to the square root of the number
    for (let i = 1; i <= Math.sqrt(number); i++) {
        if (number % i === 0) {
            factors.push(i);
            if (number / i !== i) factors.push(number / i);
        }
    }
    factors.sort((a, b) => a - b);

    return factors;
}

/**
 * Analyzes cipher text to create factor table.
 */
function analyzeCipher() {
    const cipherText = document.getElementById("cipher-text").value.replace(/[^a-zA-Z]/g, "");
    const factors = getFactors(cipherText.length);

    let sizeTable = "<tr>";
    for (let factor of factors) {
        sizeTable += `<th><button id="s${factor}">${factor}</button></th>`;
    }
    document.getElementById("size-table").innerHTML = sizeTable + "</tr>";

    // Set button listeners
    for (let factor of factors) {
        document.getElementById(`s${factor}`).onclick = () => {
            setTable(factor, "cipher-text");
            decryptCipher();
        }
    }
}
document.getElementById("analyze-button").onclick = analyzeCipher;

/**
 * Converts cipher text to plain text using decryption key or table.
 */
function decryptCipher() {
    lastControl = "decrypt";
    const key = document.getElementById("decrypt-key").value;
    if (key !== "") {
        getKeyOrder(key);

        // Set initial table
        setTable(key.length, "cipher-text");
    
        // Reorder table based on key
        tableOrder = getKeyOrder(key);
        table = table.map(row => tableOrder.map(index => row[index - 1]));
        renderTable();
    }

    // Create table body using cipher text and get plain text
    let plainText = "";
    for (let i = 0; i < table.length; i++) {
        plainText += table[i].join("").toLowerCase();
    }

    // Update HTML elements
    document.getElementById("plain-text").value = plainText;
}
document.getElementById("decrypt-button").onclick = decryptCipher;

/**
 * Converts plain text to cipher text using encryption key or table.
 */
function encryptCipher() {
    lastControl = "encrypt";
    const key = document.getElementById("encrypt-key").value.replace(/[^a-zA-Z]/g, "").toUpperCase();
    if (key !== "") {
        getKeyOrder(key);

        // Set initial table
        setTable(key.length, "plain-text");
    
        // Reorder table based on key
        tableOrder = getKeyOrder(key);
        table = table.map(row => tableOrder.map(index => row[index - 1]));
        renderTable();
    }

    // Create table body using cipher text and get plain text
    let cipherText = "";
    for (let i = 0; i < table.length; i++) {
        cipherText += table[i].join("").toUpperCase();
    }

    // Update HTML elements
    document.getElementById("cipher-text").value = cipherText;
}
document.getElementById("encrypt-button").onclick = encryptCipher;

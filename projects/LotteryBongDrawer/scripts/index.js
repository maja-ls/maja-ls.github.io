
const getCurrentPrefixNames = () => {
    const prefixInputs = Array.from(document.querySelectorAll(".prefix-definition:not(.template) .prefix-name"));

    return prefixInputs.map(input => input.value);
};

const onTotalPrefixesChange = () => {
    const totalPrefixesInput = document.getElementById("total-prefixes");
    const totalPrefixesTarget = parseInt(totalPrefixesInput.value, 10);
    const prefixDefinitionsContainer = document.getElementById("prefix-definitions-container");
    // get all prefix definitions except the template
    const existingPrefixDefinitions = prefixDefinitionsContainer.querySelectorAll(".prefix-definition:not(.template)");
    const existingCount = existingPrefixDefinitions.length;

    if (totalPrefixesTarget > existingCount) {
        // Add more prefix definitions
        const template = prefixDefinitionsContainer.querySelector(".prefix-definition.template");
        for (let i = existingCount; i < totalPrefixesTarget; i++) {
            const newPrefixDef = template.cloneNode(true);
            newPrefixDef.classList.remove("template");
            newPrefixDef.hidden = false;
            // Update the label and input names
            const label = newPrefixDef.querySelector("label");
            const input = newPrefixDef.querySelector("input");
            input.required = true;
            label.setAttribute("for", `prefix-name-${i}`);
            input.setAttribute("id", `prefix-name-${i}`);
            prefixDefinitionsContainer.appendChild(newPrefixDef);
        }
    } else if (totalPrefixesTarget < existingCount) {
        // Remove excess prefix definitions
        for (let i = existingCount - 1; i >= totalPrefixesTarget; i--) {
            existingPrefixDefinitions[i].remove();
        }
    }

    updateAllSeries();
};

const onSeriesAmountChange = () => {
    const amountOfSeriesInput = document.getElementById("amount-of-series");
    const amountOfSeries = parseInt(amountOfSeriesInput.value, 10);
    const seriesContainer = document.getElementById("series-container");
    const existingSeries = seriesContainer.querySelectorAll(".series");
    const existingCount = existingSeries.length;
    const currentPrefixNames = getCurrentPrefixNames();
    console.log("Amount of series requested:", amountOfSeries);
    console.log("Existing series count:", existingCount);
    console.log("Current prefix names:", currentPrefixNames);

    if (amountOfSeries > existingCount) {
        // Add more series definitions
        const template = seriesContainer.querySelector(".series.template");
        for (let i = existingCount; i < amountOfSeries; i++) {
            const newSeriesDef = template.cloneNode(true);
            newSeriesDef.classList.remove("template");
            newSeriesDef.hidden = false;
            const heading = newSeriesDef.querySelector("h3");
            heading.textContent = `Loddbok ${i + 1}`;
            const allPrefixes = newSeriesDef.querySelectorAll(`.series-prefix`);
            allPrefixes.forEach((prefixElement, index) => {
                const label = prefixElement.querySelector("label");
                const input = prefixElement.querySelector("input");
                label.setAttribute("for", `series-${i + 1}-prefix-${index}`);
                input.setAttribute("id", `series-${i + 1}-prefix-${index}`);
                input.value = "";
            });

            seriesContainer.appendChild(newSeriesDef);
        }
    } else if (amountOfSeries < existingCount) {
        // Remove excess series definitions
        for (let i = existingCount - 1; i >= amountOfSeries; i--) {
            existingSeries[i].remove();
        }
    }

    updateAllSeries();
};

const updateAllSeries = () => {
    const allSeries = document.querySelectorAll(".series");
    const currentPrefixNames = getCurrentPrefixNames();
    console.log("Updating all series with prefixes:", currentPrefixNames);
    allSeries.forEach((series, k) => {
        const currentSeriesPrefixes = series.querySelectorAll(`.series-prefix:not(.template)`);
        console.log(`Series ${k + 1} current prefixes:`, currentSeriesPrefixes);
        if (currentPrefixNames.length < currentSeriesPrefixes.length) {
            // Remove excess prefixes
            for (let i = currentSeriesPrefixes.length - 1; i >= currentPrefixNames.length; i--) {
                currentSeriesPrefixes[i].remove();
            }
        } else if (currentPrefixNames.length > currentSeriesPrefixes.length) {
            // Add missing prefixes
            const prefixContainer = series.querySelector(".prefixes-container");
            for (let i = currentSeriesPrefixes.length; i < currentPrefixNames.length; i++) {
                const prefixName = currentPrefixNames[i];

                const template = prefixContainer.querySelector(`.series-prefix.template`);
                const newPrefix = template.cloneNode(true);
                newPrefix.classList.remove("template");
                newPrefix.hidden = false;
                const label = newPrefix.querySelector("label");
                const input = newPrefix.querySelector("input");
                input.required = true;
                console.log("Adding prefix:", prefixName);
                console.log("to series:", k + 1);
                console.log("label", label);
                console.log("input", input);

                label.setAttribute("for", `series-${k + 1}-prefix-${i}`);
                label.textContent = prefixName;
                input.setAttribute("id", `series-${k + 1}-prefix-${i}`);
                input.value = "";
                console.log("newPrefix", newPrefix);
                prefixContainer.appendChild(newPrefix);
            }
        }

        // iterate over all existing prefixes and update their labels
        const updatedSeriesPrefixes = series.querySelectorAll(`.series-prefix:not(.template)`);
        console.log("updatedSeriesPrefixes", updatedSeriesPrefixes);
        updatedSeriesPrefixes.forEach((prefixElement, index) => {
            const label = prefixElement.querySelector("label");
            console.log("label", label);

            let prefixName = currentPrefixNames[index];
            if (!prefixName) {
                prefixName = `<span style="color: red;">Prefix trenger navn</span>`;
                label.innerHTML = prefixName;
            } else{
                label.textContent = prefixName;
            }
        });
    });
};


const onPrefixNameChange = () => {
    updateAllSeries();
};


const onFormSubmit = (event) => {
    event.preventDefault();
    processLotteryDraw();
};


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("form").addEventListener("submit", onFormSubmit);
});


const processLotteryDraw = () => {
    // get all series data. for each series, get all prefixes, start and end numbers
    // put everything into an array of objects, and then select random numbers based on the input
    const allSeries = document.querySelectorAll(".series");
    console.log("Processing lottery draw for series:", allSeries);
    let lotteryData = [];

    // get the highest end number across all series
    let highestNumber = 0;
    const allEndNumberInputs = document.querySelectorAll(".series-end");
    allEndNumberInputs.forEach(input => {
        const endNumber = parseInt(input.value, 10);
        if (endNumber > highestNumber) highestNumber = endNumber;
    });
    // determine how many digits in the highest number
    const highestNumberDigits = highestNumber.toString().length;


    allSeries.forEach((series, index) => {
        const prefixElements = series.querySelectorAll(".series-prefix:not(.template) input");
        const prefixes = Array.from(prefixElements).map(input => input.value);
        const startInput = series.querySelector(".series-start");
        const endInput = series.querySelector(".series-end");
        const startNumber = parseInt(startInput.value, 10);
        const endNumber = parseInt(endInput.value, 10);

        if (endNumber < startNumber) throw new Error(`End number must be greater than start number in series ${index + 1}`);

        const prefixString = prefixes.length > 0 ? prefixes.join(" ") : "";

        for (let num = startNumber; num <= endNumber; num++) {
            const fullNumber = `${prefixString} ${num.toString().padStart(highestNumberDigits, '0')}`.trim();
            lotteryData.push(fullNumber);
        }
    });

    console.log("Total lottery entries:", lotteryData.length);

    // select random winners
    const numberOfWinnersInput = document.getElementById("draw-amount");
    const numberOfWinners = parseInt(numberOfWinnersInput.value, 10);
    const shuffledLotteryData = shuffle([...lotteryData]);
    const winners = shuffledLotteryData.slice(0, numberOfWinners);

    const resultsTable = document.getElementById("lottery-results-table");
    resultsTable.hidden = false;
    const resultsTableBody = document.getElementById("lottery-results-tbody");
    resultsTableBody.innerHTML = "";

    winners.forEach((winner, index) => {
        const row = document.createElement("tr");
        const cellIndex = document.createElement("td");
        cellIndex.textContent = (index + 1).toString();
        const cellWinner = document.createElement("td");
        winner = getWinnerHtml(winner);
        cellWinner.innerHTML = winner;
        row.appendChild(cellIndex);
        row.appendChild(cellWinner);
        resultsTableBody.appendChild(row);
    });
    
    
    console.log("Lottery data prepared:", lotteryData);
    console.log("Shuffled lottery data:", shuffledLotteryData);
    console.log("Number of winners to select:", numberOfWinners);
    console.log("Winners selected:", winners);
    console.log("Trekning gjennomført!");

};


const getWinnerHtml = (winner) => {
    // the last set of characters in winner are numbers. if the number begins with 0, all zeros should be wrapped in a span with class "leading-zero" to style them differently
    const match = winner.match(/(\D*)(0*)(\d+)$/);
    if (!match) return winner; // if no match, return the original string
    const [, prefix, leadingZeros, number] = match;
    if (leadingZeros) {
        return `${prefix}<span class="leading-zero">${leadingZeros}</span>${number}`;
    }
    return winner;
};


const shuffle = (array) => {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const onReset = () => {
    if (confirm("Er du sikker på at du vil tilbakestille alt?")) {
       // go to the url without any query parameters to reset the form
       window.location.href = window.location.pathname;
    }
};
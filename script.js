document.addEventListener("DOMContentLoaded", function () {
    const letterGrid = document.getElementById("letterGrid");
    const targetLetterElement = document.getElementById("targetLetter");
    const roundNumberElement = document.getElementById("roundNumber");
    const restartButton = document.getElementById("restart");
    const summaryDataElement = document.getElementById("summaryData");
    const gameSummaryElement = document.getElementById("gameSummary");
    const downloadCSVButton = document.getElementById("downloadCSV");

    let targetLetter = "";
    let rounds = [4, 12, 26, 27];
    let roundIndex = 0;
    let attempts = 0;
    let correctClicks = 0;
    let incorrectClicks = 0;
    let score = 0;
    let clickTimes = [];
    let roundData = [];

    function generateLetters() {
        if (roundIndex >= rounds.length) {
            endGame();
            return;
        }

        letterGrid.innerHTML = "";
        let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        targetLetter = letters[Math.floor(Math.random() * letters.length)];
        targetLetterElement.textContent = targetLetter;
        roundNumberElement.textContent = rounds[roundIndex];

        let letterSet = new Set();
        letterSet.add(targetLetter);
        while (letterSet.size < 8) {
            letterSet.add(letters[Math.floor(Math.random() * letters.length)]);
        }

        let letterArray = Array.from(letterSet).sort(() => Math.random() - 0.5);
        letterArray.forEach(letter => {
            const div = document.createElement("div");
            div.classList.add("letter");
            div.textContent = letter;
            div.dataset.letter = letter;
            div.addEventListener("click", handleClick);
            letterGrid.appendChild(div);
        });

        clickTimes = [performance.now()];
    }

    function handleClick(event) {
        let clickedLetter = event.target.dataset.letter;
        let currentTime = performance.now();
        let reactionTime = (currentTime - clickTimes[clickTimes.length - 1]) / 1000;
        clickTimes.push(currentTime);
        attempts++;

        if (clickedLetter === targetLetter) {
            correctClicks++;
            score += 10;
        } else {
            incorrectClicks++;
            score -= 5;
        }

        if (attempts >= rounds[roundIndex]) {
            storeRoundData();
            roundIndex++;
            attempts = 0;
            correctClicks = 0;
            incorrectClicks = 0;
            score = 0;
        }

        generateLetters();
    }

    function storeRoundData() {
        let accuracy = (correctClicks / (correctClicks + incorrectClicks)) * 100 || 0;
        let missRate = 100 - accuracy;

        roundData.push({
            Round: rounds[roundIndex],
            Clicks: attempts,
            Hits: correctClicks,
            Misses: incorrectClicks,
            Score: score,
            Accuracy: accuracy.toFixed(2),
            Missrate: missRate.toFixed(2)
        });
    }

    function endGame() {
        letterGrid.innerHTML = "";
        gameSummaryElement.classList.remove("hidden");
        summaryDataElement.textContent = JSON.stringify(roundData, null, 2);
    }

    downloadCSVButton.addEventListener("click", function () {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Round,Clicks,Hits,Misses,Score,Accuracy,Missrate\n";

        roundData.forEach(row => {
            csvContent += `${row.Round},${row.Clicks},${row.Hits},${row.Misses},${row.Score},${row.Accuracy},${row.Missrate}\n`;
        });

        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "game_results.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    restartButton.addEventListener("click", function () {
        roundIndex = 0;
        roundData = [];
        gameSummaryElement.classList.add("hidden");
        generateLetters();
    });

    generateLetters();
});

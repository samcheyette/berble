
export function letInWord(letter, word) {
    for (const l of word) {
        if (l == letter) {
            return true;
        }
    }
    return false;
};

export function getRemainingWords(true_word, words, guess) {
    let overlap = [];
    for (let i=0; i < guess.length; i++) {
        if (guess[i] == true_word[i]) {
            overlap[i] = "g";
        } else if (letInWord(guess[i], true_word)) {
            overlap[i] = "o";
        } else {
            overlap[i] = "r";
        }
    }
    let remaining_words = [];
    for (const word of words) {
        let i = 0;
        let valid = true;
        while ((i < word.length) & valid) {
            if (overlap[i] == "g"){
                if (word[i] != guess[i]){
                    valid = false;
                }
            } else if (overlap[i] == "o") {
                if (!letInWord(guess[i], word)) {
                    valid = false;
                }
                if (word[i] == guess[i]){
                    valid = false;
                }
            } else if (overlap[i] == "r") {
                if (letInWord(guess[i], word)) {
                    valid = false;
                }
            }
            i++;

        }

        if (valid){
            remaining_words[remaining_words.length] = word;
        }

    }
    return remaining_words;
};

function sampleFrom(arr, n) {
    if (n > arr.length) {
        return (arr.slice());
    } else {
        let sampleSet = new Set();
        for (let i=0; i < n; i++) {
            let index = Math.floor(Math.random()*arr.length);
            sampleSet.add(arr[index]);
        }
        return Array.from(sampleSet);

    }

};


function getInfoGain(guess, words){
    var pRemain = 0.;
    for (const word of words) {
        let nRemain = (getRemainingWords(word, words, guess)).length;
        pRemain += nRemain/(words.length);    
    }
    
    pRemain = pRemain / words.length;

    return(pRemain);
};

export function makeGuess(allWords, remainingWords, nSubsampleGuesses, nSubsampleWords) {
    if (remainingWords.length <= 2) {
        return (remainingWords[0]);
    } else {

        let sampleGuesses1 = sampleFrom(remainingWords, 100);
        let sampleGuesses2 = sampleFrom(allWords, nSubsampleGuesses);
        let sampleGuesses = sampleGuesses1.concat(sampleGuesses2);

        let sampleWords = sampleFrom(remainingWords, nSubsampleWords);
        let sampleWords2 = sampleFrom(remainingWords, nSubsampleWords);

        var bestSoFar = "";
        var bestRemain = 1.;

        for (const sampleGuess of sampleGuesses) {
            let pRemain = getInfoGain(sampleGuess, sampleWords);
            if (pRemain <= bestRemain) {
                bestSoFar = sampleGuess;
                bestRemain = pRemain;

            }
        }
        return bestSoFar;

    }

};


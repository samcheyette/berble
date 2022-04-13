import { WORDS } from "./words.js";
import * as wordleAI from './wordleAI.js';

var remainingWords = WORDS.slice();

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
let startTime = new Date().getTime();
let timeLimit = 120;
let enforceTime = false;
//console.log(rightGuessString)


function timer(minutes, seconds) {

    if ((minutes == 0) & (seconds == 0)) {
        document.getElementById("timer").innerHTML = "Time's up!";
        toastr.error("You've run out of time! Game over!")
    } else {
        if (seconds < 10) {
            document.getElementById("timer").innerHTML = minutes + ":0" + seconds;
        } else {
            document.getElementById("timer").innerHTML = minutes + ":" + seconds;

        }
    }

};



function clock(minutes, seconds) {
    console.log(minutes, seconds);

        if (seconds < 10) {
            document.getElementById("timer").innerHTML = minutes + ":0" + seconds;
        } else {
            document.getElementById("timer").innerHTML = minutes + ":" + seconds;

        }
};

function timer_wrapper() {
    let currentTime = new Date().getTime();
    var timeElapsed = currentTime-startTime;
    var secondsElapsed = timeElapsed / 1000;
    if (enforceTime) {
        var secondsRemain = timeLimit - secondsElapsed;
        var minutes = Math.floor(secondsRemain / 60);
        var seconds = Math.floor(secondsRemain % 60);
        if ((secondsRemain >= 0) & (guessesRemaining > 0)) {

            timer(minutes, seconds);
        } else {
            clearInterval(timer_wrapper);

        }
    } else {
        var minutes = Math.floor(secondsElapsed / 60);
        var seconds = Math.floor(secondsElapsed % 60);
        clock(minutes, seconds);
    }


};

function initBoard() {
    let board = document.getElementById("game-board");

    setInterval(timer_wrapper, 1000);


    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'green') {
                return
            } 

            if (oldColor === 'yellow' && color !== 'green') {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}



function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)

    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length != 5) {
        toastr.error("Not enough letters!")
        return
    }

    if (!WORDS.includes(guessString)) {
        toastr.error("Word not in list!")
        return
    }

    remainingWords = wordleAI.getRemainingWords(rightGuessString, remainingWords.slice(), guessString);
    //console.log(remainingWords);
    for (let i = 0; i < 5; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = currentGuess[i]
        
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = 'grey'
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position 
            if (currentGuess[i] === rightGuess[i]) {
                // shade green 
                letterColor = 'green'
            } else {
                // shade box yellow
                letterColor = 'yellow'
            }

            rightGuess[letterPosition] = "#"
        }

        let delay = 250 * i
        setTimeout(()=> {
            //flip box
            animateCSS(box, 'flipInX')
            //shade box
            box.style.backgroundColor = letterColor
            shadeKeyBoard(letter, letterColor)
        }, delay)
    }

    if (guessString === rightGuessString) {
        clearInterval(timer_wrapper);
        toastr.success("You guessed right! Game over!")
        guessesRemaining = 0
        return
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            clearInterval(timer_wrapper);
            
            toastr.error("You've run out of guesses! Game over!")
            toastr.info(`The right word was: "${rightGuessString}"`)
        }
    }
}

function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
    let box = row.children[nextLetter]
    animateCSS(box, "pulse")
    box.textContent = pressedKey
    box.classList.add("filled-box")
    currentGuess.push(pressedKey)
    nextLetter += 1
}

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element
    node.style.setProperty('--animate-duration', '0.3s');
    
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});

document.addEventListener("keyup", (e) => {

    let currentTime = new Date().getTime();
    var timeElapsed = currentTime-startTime;
    var secondsElapsed = timeElapsed / 1000;
    var secondsRemain = Math.max(0, timeLimit - secondsElapsed);
    let timesUp = (secondsRemain <= 0) && (enforceTime == true);

    let pressedKey = String(e.key)


    if ((guessesRemaining === 0) || timesUp) {
        if (pressedKey === "Enter") {
            document.getElementById("new-game").click();
        }
        return
    }

    if (pressedKey == "Tab") {
        let AIGuess = wordleAI.makeGuess(WORDS,remainingWords,
                    Math.min(2500,WORDS.length),80);
        for (const letter of AIGuess) {
            insertLetter(letter);
        }
        checkGuess()

    }

    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {

        checkGuess()
        return
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target

    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    console.log(key);
    if (key === "Del") {
        key = "Backspace";
    } 

    if (key === "AI") {
        key = "Tab";
    }


    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

initBoard();
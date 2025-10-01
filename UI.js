import { dropModels } from "./main";

function languageSwitch() {
    //toggle for language switch logic
}

function information() {
    //the information button, no language difference
    const infoBtn = document.createElement("i");
    infoBtn.classList.add("fa-regular");
    infoBtn.classList.add("fa-circle-question");
    infoBtn.classList.add("info-btn");
    document.body.appendChild(infoBtn);
}

function cast(castingFunction) {
    //the button to control casting and activating gravity
    const castBtn = document.createElement("button");
    castBtn.classList.add("cast-btn");
    castBtn.textContent = "Cast";

    castBtn.addEventListener('click', (e) => {
        castingFunction();
    });

    document.body.appendChild(castBtn);
}

function showResult(result) {
    //get result from 3d logic and display on screen

    try {
        // Throw error if no viable result
        if (!result) {
            throw new Error("No viable result to display");
        }
        
        // If we get here, result exists
        const resultDisplay = document.createElement("p");
        resultDisplay.classList.add("display-msg");
        resultDisplay.textContent = "\\\\" + result + "//";
        document.body.appendChild(resultDisplay);
        
    } catch (error) {
        const errorDisplay = document.createElement("p");
        errorDisplay.classList.add("display-msg");
        errorDisplay.textContent = error.message;
        document.body.appendChild(errorDisplay);
    }
    
}

function initUI() {
    //putting the whole ui display together and dynamically control html
    cast(dropModels);
    information();
}

export {initUI, showResult}

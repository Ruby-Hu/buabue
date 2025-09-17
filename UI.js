function languageSwitch() {
    //toggle for language switch logic
}

function information() {
    //the information button, no language difference
}

export function cast(castingFunction) {
    //the button to control casting and activating gravity
    const castBtn = document.createElement("button");
    castBtn.classList.add("cast-btn");
    castBtn.textContent = "Cast";
    castBtn.style.position = "absolute";
    castBtn.style.top = "20px";
    castBtn.style.left = "20px";
    castBtn.style.zIndex = "1000";
    castBtn.style.padding = "10px 20px";
    castBtn.style.fontSize = "16px";

    castBtn.addEventListener('click', (e) => {
        castingFunction();
    });

    document.body.appendChild(castBtn);
}

function showResult(result) {
    //get result from 3d logic and display on screen
}

function initUI() {
    //putting the whole ui display together and dynamically control html
    cast();
}

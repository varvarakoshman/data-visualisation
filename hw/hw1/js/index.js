const g = document.querySelector('g');
const circle = document.querySelector('circle');
const line = document.querySelector('path');
const line_happy = line.getAttribute('d');
const happy_coordinates = line.getAttribute('d').split(" ")
const delta = 180;
happy_coordinates[5] = String(happy_coordinates[5] - delta);
const line_sad = happy_coordinates.join(" ");
const happy_text = document.getElementById("defaultOption").textContent;
const sad_text = "Sad";

function switchFace() {
    var checkBox = document.getElementById("face");
    var text = document.getElementById("defaultOption");
    if (checkBox.checked){
        text.innerHTML = happy_text;
        line.setAttribute('d', line_happy);
    }else{
        text.innerHTML = sad_text;
        line.setAttribute('d', line_sad);
    }
  }
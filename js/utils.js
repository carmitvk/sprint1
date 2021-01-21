function logMouseButton(e) {
  if (typeof e === 'object') {
    switch (e.button) {
      case 0:
        log.textContent = 'Left button clicked.';
        break;
      case 1:
        log.textContent = 'Middle button clicked.';
        break;
      case 2:
        log.textContent = 'Right button clicked.';
        break;
      default:
        log.textContent = `Unknown button code: ${e.button}`;
    }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}


function popsound() {
  var audio = new Audio('pop.wav');
  audio.play();
}


function renderCell(location, value) {
  var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function addClsToElByPos(pos, clsNm) {
  var elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`);
  console.log(elCell);
  elCell.classList.add(clsNm);
}

function removeClsToElByPos(pos, clsNm) {
  var elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`);
  console.log(elCell);
  elCell.classList.remove(clsNm);
}


function renderCellByNm(strCls,value) {
  var elCell = document.querySelector(strCls);
  elCell.innerHTML = value;
}
'use restrict'
// let button = document.querySelector('#button');
// let log = document.querySelector('#log');
// button.addEventListener('mouseup', logMouseButton);

const EMPTY = ' ';
const FLAG = '⛳';
const MINE = '💣';
const WIN = '😎';
const NORMAL = '😀';
const LOSE = '🥺';
const HINT = '💡';

var gStartGameTime;
var gBoard; //A Matrix containing cell objects:

gLevel = {
    SIZE: 4,
    MINES: 2
};

gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};

function createCell() {
    var cell = {
        minesAroundCount: 4,
        isShown: false,
        isMine: false,
        isMarked: false //true 
    }
    return cell;
}

function initialByLevel(size, mines) {
    gStartGameTime = Date.now();
    startTimer();
    if (!gGame.isOn) return;
    gLevel.SIZE = size;
    gLevel.MINES = mines;
    initGame();
    var elRestBtn = document.querySelector('.restart-btn');
    elRestBtn.innerText = NORMAL;
}

function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = createCell();
        }
    }
    // put mines in rand places
    setMinesRandom(board);

    // set the cell's minesAroundCount
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var pos = { i: i, j: j }
            setMinesNegsCount(pos, board);
        }
    }
    return board;
}

function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j })

            strHTML += '\t<td class="cell ' + cellClass + `"  onclick="cellClicked(this,${i},${j})" >\n`;

            if (!currCell.isShown && currCell.isMarked) {
                strHTML += FLAG;
            } else if (currCell.isShown && currCell.isMine) {
                strHTML += MINE;
            } else if (currCell.isShown && currCell.minesAroundCount) {
                strHTML += currCell.minesAroundCount;
            }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.sweeper-board');
    elBoard.innerHTML = strHTML;
}

function setMinesNegsCount(pos, board) {
    var cellMinesCount = 0;
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > board.length - 1) continue;
            if (i === pos.i && j === pos.j) {
                continue
            }
            if (board[i][j].isMine) {
                cellMinesCount++;
            }
        }
    }
    board[pos.i][pos.j].minesAroundCount = cellMinesCount;
}

function setMinesRandom(board) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var randIdxI = getRandomInt(0, board.length);
        var randIdxJ = getRandomInt(0, board.length);
        board[randIdxI][randIdxJ].isMine = true;
    }
}

function cellClicked(elCell, i, j) {
    // if (!gGame.isOn) return; 
    var cell = gBoard[i][j];
    if (cell.isMine) {
        mineOccured(elCell);// , i, j);//expand curr boom red background-color + expand all booms cells
    } else {
        expandShown({ i: i, j: j }); //elCell, { i: i, j: j });
    }
}

function expandShown(pos) {  //elCell, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue;
            if (i === pos.i && j === pos.j) { //pressed btn
                expandCell({ i: i, j: j }, false);

            } else {//not pressed btn - show num of nigbours
                if (!gBoard[i][j].isMine) {//neig not a boom
                    expandCell({ i: i, j: j });
                }
            }
        }
    }
}

function setCellColor(location) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);

    switch (gBoard[location.i][location.j].minesAroundCount) {
        case 1:
            elCell.style.color = 'blue';
            break;
        case 2:
            elCell.style.color = 'green';
            break;
        default: // case 3 and up
            elCell.style.color = 'red';
    }
}

function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function expandCell(location, toUpdtNeg = true) {
    //model
    gBoard[location.i][location.j].isShown = true;

    //DOM:
    var elCellSelector = '.' + getClassName({ i: location.i, j: location.j })
    var elCell = document.querySelector(elCellSelector);
    elCell.classList.add('expand');
    if (toUpdtNeg && gBoard[location.i][location.j].minesAroundCount) { //not for 0 neighbours
        setCellColor(location);
        elCell.innerHTML = gBoard[location.i][location.j].minesAroundCount;
    }
}


function mineOccured(elCell) { //, i, j) {
    elCell.classList.add('mine'); //put red in cell
    //expand all booms
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                var elCellSelector = '.' + getClassName({ i: i, j: j })
                var elCell = document.querySelector(elCellSelector);
                elCell.classList.add('expand');
                elCell.innerHTML = MINE;
            }
        }
    }
    gameover(false);
}

//Called on right click to mark a cell (suspected to be a mine)
// Search the web (and implement) how to hide the context menu on right click
function cellMarked(elCell) {

}

//Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {

}

function gameover(isWin) {
    stopTimer();

    gGame.isOn = false;

    //hide level buttons
    var elResBt = document.querySelector('.level-btn');
    elResBt.classList.add('hide');

    //change to press on smile to restart
    var elMsg = document.querySelector('.message');
    elMsg.innerText = 'Press the Smile to restart';
    elMsg.style.color = 'rgb(147, 152, 221)';

    var elRestBtn = document.querySelector('.restart-btn');
    elRestBtn.innerText = isWin ? WIN : LOSE;

    renderBtn('.restart-btn');
    //update score ????????????
}

function renderBtn(btnClsNm) {
    var elResBt = document.querySelector(btnClsNm);
    elResBt.classList.remove('hide');
}

function restartClicked() {
    gGame.isOn = true;

    var elMsg = document.querySelector('.message');
    elMsg.innerText = 'Choose Game Level';
    elMsg.style.color = 'white';

    renderBtn('.level-btn');

    var elResBt = document.querySelector('.restart-btn');
    elResBt.classList.add('hide');

    var elMsg = document.querySelector('.sweeper-board');
    elMsg.innerText = EMPTY;

}


function startTimer() {
    gTimerInterval = setInterval(() => {
        var currTime = new Date().getTime();
        var passedTime = currTime - gStartGameTime;
        var seconds = Math.floor((passedTime % (1000 * 60)) / 1000);

        var elTimerDiv = document.querySelector('.timer');
        console.log('timer', gStartGameTime)
        elTimerDiv.innerHTML = `${seconds}`;
    }, 1);
}
function stopTimer() {
    clearInterval(gTimerInterval);
    gStartGameTime = Date.now();
}
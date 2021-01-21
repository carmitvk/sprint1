'use restrict'

const EMPTY = ' ';
const FLAG = '🚩';
const MINE = '💣';
const WIN = '😎';
const NORMAL = '😀';
const LOSE = '🥺';
const HINT = '💡';

const ONE_LIFE = '⚓';
const MAX_LIFE = 3;
const ONE_SAFE = '🏝️';
const MAX_SAFE = 3;
const ONE_FULL_SAFE = '💡';//'🔭';
const MAX_FULL_SAFE = 3;  

//🧷 🔍

var gStartGameTime;
var gBoard; //A Matrix containing cell objects:
var gTimerInterval;


gLevel = {
    SIZE: 4,
    MINES: 2
};

gGame = {
    life: 3,
    safeClickCount: MAX_SAFE,
    fullSafeClickCount: MAX_FULL_SAFE,
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
    isFirstMove = true; // re initial also for switch levels
    stopTimer();
    gGame.markedCount = 0;
    if (!gGame.isOn) return;
    gLevel.SIZE = size;
    gLevel.MINES = mines;
    updateLife();
    updateSafe();
    updateFullSafe();
    initGame();
    updateBestScore(99999999);
}

function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
    var elRestBtn = document.querySelector('.restart-btn');
    elRestBtn.innerText = NORMAL;
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = createCell();
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
            strHTML += '\t<td ' + 'class="cell ' + cellClass + `" onmousedown="mouseDown(this,event,${i},${j})" onclick="cellClicked(this,${i},${j})" >\n`;
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

function setMinesRandom(board, cellClickedPos) {
    for (var i = 0; i < gLevel.MINES; i++) {

        var randIdxI = getRandomInt(0, board.length);
        var randIdxJ = getRandomInt(0, board.length);
        while ((cellClickedPos.i === randIdxI && cellClickedPos.j === randIdxJ) || board[randIdxI][randIdxJ].isMine) {
            randIdxI = getRandomInt(0, board.length);
            randIdxJ = getRandomInt(0, board.length);
        }
        board[randIdxI][randIdxJ].isMine = true;
    }
}

function cellClicked(elCell, i, j) {
    if (isFirstMove) {
        startTimer();
        isFirstMove = false;
        addMinesAndNeig({ i: i, j: j });
    }
    var cell = gBoard[i][j];
    if (cell.isMine) {
        updateLife();
        if (gGame.life >= 0) return; //life=0 is ok
        mineOccured(elCell);//expand curr boom red background-color + expand all booms cells
        gameover(false);
    } else {
        expandShown({ i: i, j: j });
    }
    upMinesToMark();
    if (isWinOccured()) {
        gameover(true);
    }
}

function updateLife() {
    if (!gGame.isOn) return;
    if (isFirstMove) {
        gGame.life = MAX_LIFE;
    } else {
        gGame.life--;
        popsound();
    }
    var strLife = '';
    for (var i = 0; i < gGame.life; i++) {
        strLife += ONE_LIFE;
    }
    renderCellByNm('.life-container', strLife)
}
function safeClicked() {
    if (isFirstMove) return;   // no mines are on board before the first move. also every step is good - so no clue is needed.
    var infoCell = countShownAndMinePos();
    var isEndOfSafeCells = (infoCell.countShown === gLevel.SIZE * gLevel.SIZE - gLevel.MINES);
    if (isEndOfSafeCells) {
        pos = { i: infoCell.i, j: infoCell.j };
        addClsToElByPos(pos, 'mine');
        setTimeout(() => {
            removeClsToElByPos(pos, 'mine');
        }, 1000);
    } else {
        //light the safe random cell
        var randIdxI = getRandomInt(0, gBoard.length);
        var randIdxJ = getRandomInt(0, gBoard.length);
        while ((gBoard[randIdxI][randIdxJ].isMine && !isEndOfSafeCells) ||
            gBoard[randIdxI][randIdxJ].isShown) {

            randIdxI = getRandomInt(0, gBoard.length);
            randIdxJ = getRandomInt(0, gBoard.length);
        }
        pos = { i: randIdxI, j: randIdxJ };
        addClsToElByPos(pos, 'safe-step');
        setTimeout(() => {
            removeClsToElByPos(pos, 'safe-step');
        }, 1000);
    }
    updateSafe();
}

function updateSafe() {
    if (isFirstMove) {
        gGame.safeClickCount = MAX_SAFE;
    } else {
        gGame.safeClickCount--;
        popsound();
    }
    var strSafe = '';
    for (var i = 0; i < gGame.safeClickCount; i++) {
        strSafe += ONE_SAFE;
    }
    renderCellByNm('.safe-container', strSafe)
}

function addMinesAndNeig(cellClickedPos) {
    // put mines in rand places
    setMinesRandom(gBoard, cellClickedPos);

    // set the cell's minesAroundCount
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var pos = { i: i, j: j }
            setMinesNegsCount(pos, gBoard);
        }
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

    //DOM:
    var elCellSelector = '.' + getClassName({ i: location.i, j: location.j })
    var elCell = document.querySelector(elCellSelector);
    elCell.classList.add('expand');
    //model
    if (toUpdtNeg && gBoard[location.i][location.j].minesAroundCount) { //not for 0 neighbours
        setCellColor(location);
        elCell.innerHTML = gBoard[location.i][location.j].minesAroundCount;
    }
    if (gBoard[location.i][location.j].isMarked) { //remove flg
        elCell.innerHTML = EMPTY;
        gGame.markedCount--;
    }

    gBoard[location.i][location.j].isShown = true;
    gBoard[location.i][location.j].isMarked = false;
}

function mineOccured(elCell) {
    //expand all booms
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                var elCellSelector = '.' + getClassName({ i: i, j: j })
                var elMineCell = document.querySelector(elCellSelector);
                elMineCell.classList.add('expand');
                elMineCell.innerHTML = MINE;
            }
        }
    }
    elCell.classList.remove('expand');
    elCell.classList.add('mine'); //put red in cell
}

function gameover(isWin) {
    stopTimer();
    var bestScore = getBestScore();
    if (isWin && (gGame.secsPassed < bestScore)) {  //update best score
        updateBestScore(gGame.secsPassed);
        //update div with best score
        var elBestScore = document.querySelector('.best-score');
        elBestScore.innerHTML = gGame.secsPassed;
    }
    gGame.isOn = false;

    //hide level buttons
    // var elResBt = document.querySelector('.level-btn');
    // elResBt.classList.add('hide');

    var elRestBtn = document.querySelector('.restart-btn');
    elRestBtn.innerText = isWin ? WIN : LOSE;

    renderBtn('.restart-btn');
}

function renderBtn(btnClsNm) {
    var elResBt = document.querySelector(btnClsNm);
    elResBt.classList.remove('hide');
}

function restartClicked() {
    gGame.isOn = true;
    stopTimer();
    initialByLevel(4, 2);//default level
}


function startTimer() {
    gStartGameTime = Date.now();
    gTimerInterval = setInterval(() => {
        var currTime = new Date().getTime();
        var passedTime = currTime - gStartGameTime;
        gGame.secsPassed = Math.floor((passedTime % (1000 * 60)) / 1000);

        var elTimerDiv = document.querySelector('.timer');
        elTimerDiv.innerHTML = `${gGame.secsPassed}`;
    }, 1);
}

function stopTimer() {
    clearInterval(gTimerInterval);
    gStartGameTime = null;
}

function mouseDown(elCell, e, i, j) {
    if (!gGame.isOn) return;
    if (e.which === 3)
        cellMarked(elCell, i, j)
}

//Called on right click to mark a cell (suspected to be a mine)
function cellMarked(elCell, i, j) {
    if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        elCell.innerText = FLAG;
    } else {
        if (!gBoard[i][j].isShown && elCell.innerText === FLAG) {//not remove neig numbers
            gBoard[i][j].isMarked = false;
            gGame.markedCount--;
            elCell.innerText = EMPTY;
        }
    }
    upMinesToMark();
    if (isWinOccured()) {
        gameover(true);
    }
}

window.oncontextmenu = function () {
    return false;     // cancel default menu
}

//Game ends when all mines are marked, and all the other cells are shown
function isWinOccured() {
    var correctMarkedMines = 0;
    var countShowed = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isShown && gBoard[i][j].isMine) {
                return false;
            }
            if (!gBoard[i][j].isShown && gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
                return false;
            }
            if (gBoard[i][j].isMine && gBoard[i][j].isMarked) {
                correctMarkedMines++;
            }//correct marked
            if (gBoard[i][j].isShown) {
                countShowed++;
            }
        }
    }
    if (correctMarkedMines === gLevel.MINES &&
        countShowed + correctMarkedMines === gLevel.SIZE * gLevel.SIZE &&
        gGame.markedCount === correctMarkedMines) {
        return true;
    }
    return false;
}

function upMinesToMark() {
    var minesToMark = gLevel.MINES - gGame.markedCount;
    var elMsg = document.querySelector('.marked-mines');
    elMsg.innerText = minesToMark;
}

function countShownAndMinePos() {
    var countShown = 0;
    var mineIndI;
    var mineIndJ;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isShown) {
                countShown++;
            }
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
                mineIndI = i;
                mineIndJ = j;
            }
        }
    }
    return { countShown: countShown, i: mineIndI, j: mineIndJ };
}


function updateBestScore(bestScoreSec) {
    var LsBestScore = { 'bestScore': bestScoreSec };
    // Put the object into storage
    localStorage.setItem('LsBestScore', JSON.stringify(LsBestScore));
}

function getBestScore() {
    // Retrieve the object from storage
    var bestScoreObj = JSON.parse(localStorage.getItem('LsBestScore'));
    return bestScoreObj.bestScore
}

function updateFullSafe() {
    if (isFirstMove) {
        gGame.fullSafeClickCount = MAX_FULL_SAFE;
    } else {
        gGame.fullSafeClickCount--;
        popsound();
    }
    var strSafe = '';
    for (var i = 0; i < gGame.fullSafeClickCount; i++) {
        strSafe += ONE_FULL_SAFE;
    }
    renderCellByNm('.full-safe-container', strSafe)
}


function fullSafeClicked() {
    //TODO ::action


    updateFullSafe(); //reduce in model and DOM
}
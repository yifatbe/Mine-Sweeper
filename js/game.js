'use strict'

var gBoard
var gLevel
var gGame
var gPoses
const MINE = '💣'
const FLAG = '⛳'


function onInit(size=4, numMines=2) {
    console.log('onInit')
    gGame = {
        isOn: true,
        isFirstClick : true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 1
    }

    gLevel = {
        SIZE: size,
        MINES: numMines
    }

    gPoses = initPoses()
    gBoard = buildBoard()
    renderBoard(gBoard)
   
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}
 function firstClick(idxI, idxJ){
      setRandtMines(gBoard,idxI, idxJ)
    //   board[0][0].isMine = true
    //   board[2][2].isMine = true
     setMinesNegsCount(gBoard)
     renderBoard(gBoard)
     gGame.isFirstClick = false

 }

function setRandtMines(board, idxI, idxJ) {
    var randInd
    var pos
    var numMines = 0
    while (numMines <gLevel.MINES){
        randInd = getRandomInt(0, gPoses.length)
        pos = gPoses.splice(randInd, 1)[0]
        
        if (pos.i!==idxI && pos.j!==idxJ){
            board[pos.i][pos.j].isMine = true
            numMines++
        }     
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                setMinesAroundCell(i, j)
            }
        }
    }
}

function setMinesAroundCell(idxI, idxJ) {
    var minesCount = 0

    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (i === idxI && j === idxJ) continue
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j]
            if (currCell.isMine) minesCount++
        }
    }

    gBoard[idxI][idxJ].minesAroundCount = minesCount
    return minesCount
}

function renderBoard(board) {

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {

            const cell = board[i][j]
            var className = ''
            var txt = String(cell.minesAroundCount)
            if (cell.isShown) {
                className += 'shown'
                if (cell.isMine) {
                    // className += 'mine'
                    txt = MINE
                }
            }
            if (cell.isMarked) {
                // className += 'marked'
                // debugger
                txt = FLAG
            }
            strHTML += `\t<td class="cell ${className}"                                                                     
                             data-i="${i}" data-j="${j}"
                            onclick="onCellClicked(this, ${i}, ${j})" 
                            oncontextmenu="onCellMarked(event, ${i}, ${j})"   
                            > ${txt}
                         </td>\n`

        }
        strHTML += '</tr>'
    }
    // 

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}


function onSmileClick (elImg){
    if (gGame.isOn) return
    elImg.src="img/happy.jpg"
    onInit(gLevel.SIZE,gLevel.MINES)
}

function onCellClicked(elCell, idxI, idxJ) {
    if (!gGame.isOn) return
    if (gGame.isFirstClick) firstClick(idxI, idxJ)

    gBoard[idxI][idxJ].isShown = true
    if (gBoard[idxI][idxJ].isMine) {
        clickOnMine(idxI, idxJ)
    }
    //else if (gBoard[idxI][idxJ].minesAroundCount > 0) {
    // }        
    else if (gBoard[idxI][idxJ].minesAroundCount === 0) {
        expandShown(gBoard, elCell, idxI, idxJ)
    }
    checkGameOver()
    renderBoard(gBoard)
}

function clickOnMine(){
    gGame.lives--
    document.querySelector('h2 span').innerText = gGame.lives
    if (gGame.lives === 0)gameOver()
}

function expandShown(board, elCell, idxI, idxJ) {
    board[idxI][idxJ].isShown = true
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (i === idxI && j === idxJ) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (!currCell.isMarked) currCell.isShown = true
        }
    }

}

function onCellMarked(ev, idxI, idxJ) {
    console.log('onCellMarked')
    ev.preventDefault();
    console.log('ev', ev)
    gBoard[idxI][idxJ].isMarked = !gBoard[idxI][idxJ].isMarked
    console.log('gBoard', gBoard)
    renderBoard(gBoard)
    checkGameOver()
}

function checkGameOver() {
    console.log('checkGameOver')
    if (!gGame.isOn) return false

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = gBoard[i][j]
            if (!((currCell.isMine && currCell.isMarked) || (currCell.isShown))) {
                return false
            }
        }
    }
    console.log('game over victory!')
    var elImg = document.querySelector('.smile_img')
    elImg.src="img/sunglasses.jpg"
    gGame.isOn = false
    return true
}

function gameOver() {
    console.log('game over loos')
    gGame.isOn = false
    var elImg = document.querySelector('.smile_img')
    elImg.src="img/sad.jpg"
    
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine) currCell.isShown = true
        }
    }
}



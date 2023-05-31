'use strict'

var gBoard
var gLevel
var gGame
var gPoses
const MINE = '💣'
const FLAG = '⛳'

function onInit() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    gLevel = {
        SIZE: 4,
        MINES: 2
    }
    gPoses = initPoses()
    gBoard = buildBoard()
    setMinesNegsCount(gBoard)
    // console.log('gPoses',gPoses)
    // // console.log('gBoard', gBoard)
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
    setRandtMines(board)
    // board[0][0].isMine = true
    // board[2][2].isMine = true
   
    return board
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
                if (cell.isMarked) {
                    // className += 'marked'
                    txt = FLAG
                }
            }
            strHTML += `\t<td class="cell ${className}"                                                                     
                             data-i="${i}" data-j="${j}"
                            onclick="onCellClicked(this, ${i}, ${j})"> ${txt}
                         </td>\n`

        }
        strHTML += '</tr>'
    }

   
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, idxI, idxJ) {
    if (!gGame.isOn) return 
    gBoard[idxI][idxJ].isShown = true
    if (gBoard[idxI][idxJ].isMine) {
        console.log('game over')  
        gGame.isOn = false
    } 
    //else if (gBoard[idxI][idxJ].minesAroundCount > 0) {
    // }        
    else if (gBoard[idxI][idxJ].minesAroundCount === 0) {
        expandShown(gBoard, elCell, idxI, idxJ)
    }
    renderBoard(gBoard)
}

// function handleEmptyCell(elCell, idxI, idxJ) {
 
    
// }

function setRandtMines(board){
    var randInd 
    var pos
    for (var i=0 ;i<gLevel.MINES;i++)
    {
        randInd = getRandomInt (0, gPoses.length)  
        pos = gPoses.splice(randInd,1)[0]
        board[pos.i][pos.j].isMine = true
    }
}

function onCellMarked(elCell) {

}

function checkGameOver() {

}

function expandShown(board, elCell, idxI, idxJ) {
    board[idxI][idxJ].isShown = true
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (i === idxI && j === idxJ) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            currCell.isShown = true
        }
    }

}
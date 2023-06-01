'use strict'

var gBoard
var gLevel
var gGame
var gPoses
const MINE = '💣'
const FLAG = '⛳'
const HINT = '💡'


function onInit(size = 4, numMines = 2) {
    console.log('onInit')
    gGame = {
        isOn: true,
        isFirstClick: true,
        isHint: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        hints: 3,
        safeClick:3,
        megaHintStep : 0,
        megaHintPos: []
    }

    gLevel = {
        SIZE: size,
        MINES: numMines
    }

    if (size ===4) gGame.lives = 1
    
    gPoses = initPoses()
    gBoard = buildBoard()
    stopTimer()
    clearTimer()
    var elImg = document.querySelector('.smile_img')
    elImg.src = "img/happy.jpg"
    document.querySelector('h2 span').innerText = gGame.lives
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
                isMarked: false,
                isExpand: false
            }
        }
    }
    return board
}


function renderBoard(board) {

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {

            const cell = board[i][j]
            var className = ''
            var txt = cell.minesAroundCount >0 ? String(cell.minesAroundCount) : ''
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
                            oncontextmenu="onRightClick(event, ${i}, ${j})"   
                            > ${txt}
                         </td>\n`

        }
        strHTML += '</tr>'
    }
    

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function firstClick(idxI, idxJ) {
    setRandtMines(gBoard, idxI, idxJ)

    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    gGame.isFirstClick = false

    var elSafeBtn = document.querySelector('.safe_btn')
    elSafeBtn.classList.remove('nonshow')
    var elH5 = document.querySelector('h5')
    elH5.classList.remove('nonshow')
    var elMegaBtn = document.querySelector('.mega_btn')
    elMegaBtn.classList.remove('nonshow')

    startTimer()
}

function setRandtMines(board, idxI, idxJ) {
    var randInd
    var pos
    var numMines = 0
    while (numMines < gLevel.MINES) {
        randInd = getRandomInt(0, gPoses.length)
        pos = gPoses.splice(randInd, 1)[0]

        if (pos.i !== idxI && pos.j !== idxJ) {
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


function onSmileClick(elImg) {
    if (gGame.isOn) return
    elImg.src = "img/happy.jpg"
    onInit(gLevel.SIZE, gLevel.MINES)
}

function onCellClicked(elCell, idxI, idxJ) {
    if (!gGame.isOn) return
    if (gGame.isHint) {
        openHint(idxI, idxJ)
        return
    }

    if (gGame.isFirstClick) firstClick(idxI, idxJ)

    if (gGame.megaHintStep >0) {
        var pos = {
            i:idxI,
            j:idxJ
        }
        elCell.classList.add('mark')
        gGame.megaHintPos.push(pos)
        gGame.megaHintStep++
        if (gGame.megaHintStep ===3) {
            openMegaHint()
        }
        return
    }

    gBoard[idxI][idxJ].isShown = true
    if (gBoard[idxI][idxJ].isMine) {
        clickOnMine(idxI, idxJ)
    }
    //else if (gBoard[idxI][idxJ].minesAroundCount > 0) {
    // }        
    else if (gBoard[idxI][idxJ].minesAroundCount === 0) {
        expandShown(gBoard, idxI, idxJ)
    }
    checkGameOver()
    renderBoard(gBoard)
}


function clickOnMine() {
    gGame.lives--
    document.querySelector('h2 span').innerText = gGame.lives
    if (gGame.lives === 0) gameOver()
}

function expandShown(board, idxI, idxJ) {
    board[idxI][idxJ].isShown = true
    // if (board[idxI][idxJ].isExpand) return
    console.log('expandshown: ',idxI, idxJ )
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (i === idxI && j === idxJ) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            console.log('show cell:' ,i,j,'num negs:' ,currCell.minesAroundCount)
            if (!currCell.isMarked) currCell.isShown = true
            if (currCell.minesAroundCount === 0 && !currCell.isExpand) {   
                currCell.isExpand = true
                expandShown (board, i,j)
            }
        }
    }

}

function onRightClick(ev, idxI, idxJ) {
    console.log('onRightClick')
    ev.preventDefault();
    console.log('ev', ev)
    gBoard[idxI][idxJ].isMarked = !gBoard[idxI][idxJ].isMarked
    console.log('gBoard', gBoard)
    renderBoard(gBoard)
    checkGameOver()
}

function onSafeClick(){  
    console.log('onSafeClick')    
    if (gGame.safeClick <=0) return

    var poses = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine){
                const pos = {
                    i: i,
                    j: j
                }
                poses.push(pos)
            }
        }
    }

    gGame.safeClick--
    var randPos = poses[getRandomInt(0,poses.length)]
    var selector = `[data-i="${randPos.i}"][data-j="${randPos.j}"]`            
    var elCell = document.querySelector(selector)
    elCell.classList.add('mark')
    document.querySelector('h5 span').innerText = gGame.safeClick
    
    if (gGame.safeClick <=0) {
        
        var elSafeBtn = document.querySelector('.safe_btn')
        // elSafeBtn.classList.add('nonshow')
        elSafeBtn.style.display = 'none'
        var elH5 = document.querySelector('h5')
        elH5.style.display = 'none'
    }

    setTimeout(clearSafe, 1000, elCell)
    
}

function onMegaHint(){
    gGame.megaHintStep++
    openModal()

}


function onHintsClick() {
    console.log('onHintsClick')
    if (gGame.hints > 0) {
        gGame.hints--
        gGame.isHint = true
        var elh3 = document.querySelector('h3') 
        elh3.classList.add('highlight')
    }
}

function openMegaHint(){
    var fromI = gGame.megaHintPos[0].i
    var toI = gGame.megaHintPos[1].i
    var fromJ= gGame.megaHintPos[0].j
    var toJ = gGame.megaHintPos[1].j
    var hints = showHints(fromI, toI, fromJ,toJ)
    closeModal()

    var selector = `[data-i="${fromI}"][data-j="${fromJ}"]`
    var elCell = document.querySelector(selector)
    elCell.classList.remove('mark')
   
    selector = `[data-i="${toI}"][data-j="${toJ}"]`
    elCell = document.querySelector(selector)
    elCell.classList.remove('mark')

    var elMegaBtn = document.querySelector('.mega_btn')
    elMegaBtn.classList.add('nonshow')

    gGame.megaHintStep =0

   
    setTimeout(closeHint, 1000, hints)

}

function clearSafe(elCell){
    elCell.classList.remove('mark')
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
    stopTimer()
    console.log('game over victory!')
    var elImg = document.querySelector('.smile_img')
    elImg.src = "img/sunglasses.jpg"
    gGame.isOn = false
    return true
}

function gameOver() {
    console.log('game over loos')
    gGame.isOn = false
    stopTimer()
    var elImg = document.querySelector('.smile_img')
    elImg.src = "img/sad.jpg"

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine) currCell.isShown = true
        }
    }
}


function openHint(idxI, idxJ) {
    
    if (!gGame.isHint) return

    var txt = ''
    for (var i = 0; i < gGame.hints; i++) {
        txt += HINT
    }
    
    var elh3 = document.querySelector('h3')
    elh3.innerText = txt
    elh3.classList.remove('highlight')

    var hints = showHints( (idxI - 1), (idxI + 1), (idxJ - 1), (idxJ + 1))
   

    console.log('hints', hints)
    gGame.isHint = false
    
    setTimeout(closeHint, 1000, hints)
}

function showHints(fromIdxI, toIdxI, fromIdxJ, toIdxJ){
    var hints = []
    for (var i = fromIdxI; i <= toIdxI; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = fromIdxJ; j <= toIdxJ; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j]
            var hint = {
                idxI: i,
                idxJ: j,
                isShown: currCell.isShown
            }
            hints.push(hint)
            currCell.isShown = true
        }
    }
    renderBoard(gBoard)
    return hints
}

function closeHint(hints) {
    for (var i = 0; i < hints.length; i++) {
        var hint = hints[i]
        gBoard[hint.idxI][hint.idxJ].isShown = hint.isShown
    }

    renderBoard(gBoard)
}


'use strict'


var gStartTime
var gTimerInterval

function initPoses() {
   
    var poses = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const pos = {
                i: i,
                j: j
            }
            poses.push(pos)
        }
    }
    return poses
}


function openModal(msg) {
    const elModal = document.querySelector('.modal')
    elModal.style.display = 'block'
}

function closeModal() {
    const elModal = document.querySelector('.modal')
    elModal.style.display = 'none'
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function stopTimer() {
    clearInterval(gTimerInterval)
}

function startTimer() {
    gStartTime = Date.now()
    gTimerInterval = setInterval(updateTimer, 1)
    // setTimeout(stopTimer,3000)
    // setTimeout(clearTimer,3000)
}

function updateTimer() {
    var currentTime = Date.now()
    var elapsedTime = currentTime - gStartTime
    var formattedTime = (elapsedTime / 1000).toFixed(3)
    document.getElementById('timer').textContent = formattedTime
}

function clearTimer() {
    document.getElementById('timer').textContent = (0 / 1000).toFixed(3)
}


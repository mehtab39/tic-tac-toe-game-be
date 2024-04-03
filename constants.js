const GameState = {
    PENDING: 'PENDING',
    STARTED: 'STARTED',
    READY: 'READY',
    ONGOING: 'ONGOING',
    FINISHED: 'FINISHED'
}

const EmptyBoard = 
   [ ['', '', ''],
    ['', '', ''],
    ['', '', '']]

const Signs = {
    Zero: 'O',
    Cross: 'X'
}
const Constants = {
    GameState,
    Signs,
    EmptyBoard
}


module.exports = {
    Constants
}
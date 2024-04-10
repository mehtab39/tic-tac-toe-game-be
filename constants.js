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

const Tokens = {
    Zero: 'O',
    Cross: 'X'
}

const Constants = {
    GameState,
    Tokens,
    EmptyBoard,
}


module.exports = {
    Constants
}
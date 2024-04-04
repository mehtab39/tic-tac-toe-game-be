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

const AiPlayers= {
    GO: 'ai-go'
}
const Constants = {
    GameState,
    Signs,
    EmptyBoard,
    AiPlayers
}


module.exports = {
    Constants
}
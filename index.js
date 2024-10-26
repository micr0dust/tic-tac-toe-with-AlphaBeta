const winState = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const board = Array(9).fill(' ');
const players = ['O', 'X'];
let counter = 0;

function printBoard(board) {
    for (let i = 0; i < 9; i++)
        document.getElementById('btn' + i).innerText = board[i];
}

function getLegalMoves(board) {
    return board.map((val, idx) => val === ' ' ? idx : null).filter(val => val !== null);
}

function positionOccupied(board, position) {
    return board[position] !== ' ';
}

function boardIsFull(board) {
    return !board.includes(' ');
}

function checkWinLine(board) {
    for (let i = 0; i < 8; i++) {
        if (board[winState[i][0]] === board[winState[i][1]] && board[winState[i][1]] === board[winState[i][2]] && board[winState[i][0]] !== ' ') {
            return winState[i];
        }
    }
    return [];
}

function minimax(board, isMe, alpha, beta, team) {
    const winline = checkWinLine(board);
    if (winline.length > 0) return isMe ? -1 : 1;
    if (boardIsFull(board)) return 0;

    if (isMe) {
        let bestScore = -Infinity;
        for (const move of getLegalMoves(board)) {
            board[move] = players[team%2];
            const score = minimax(board, false, alpha, beta, team);
            board[move] = ' ';
            bestScore = Math.max(score, bestScore);
            alpha = Math.max(alpha, bestScore);
            if (beta <= alpha) {
                break;
            }
        }
        return bestScore;
    }

    let bestScore = Infinity;
    for (const move of getLegalMoves(board)) {
        board[move] = players[(team+1)%2];
        const score = minimax(board, true, alpha, beta, team);
        board[move] = ' ';
        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) {
            break;
        }
    }
    return bestScore;
}

function randomMove() {
    const legalMoves = getLegalMoves(board);
    const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    board[move] = players[counter%2];
}

function AlphaBetaMove(team) {
    const role = players[team%2];
    let bestScore = -Infinity;
    let bestMove = -1;
    for (const move of getLegalMoves(board)) {
        board[move] = role;
        const score = minimax(board, false, -Infinity, Infinity, team);
        board[move] = ' ';
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    board[bestMove] = role;
}

function next(ele){
    document.getElementById('first').disabled = true;
    const id = ele.id;
    if(document.getElementById(id).innerText != '')
        return;
    
    const legalMoves = getLegalMoves(board);

    if (legalMoves.length > 0) {
        const move = parseInt(id[3]);
        if (positionOccupied(board, move)) return;
        board[move] = players[++counter%2];
    } else {
        end();
        return;
    }

    AlphaBetaMove(++counter);
    printBoard(board);

    if (boardIsFull(board)) {
        end();
        return;
    }
    const winline = checkWinLine(board);
    if (winline.length > 0) {
        end(winline);
        return;
    }
}

function first(){
    document.getElementById('first').disabled = true;
    AlphaBetaMove(++counter);
    printBoard(board);
}

function updateProgressBar(counts, label) {
    // 計算總次數
    const total = counts[0] + counts[1] + counts[2];
  
    // 避免 total 為 0 時出現 NaN
    const oPercent = total ? (counts[0] / total) * 100 : 0;
    const xPercent = total ? (counts[1] / total) * 100 : 0;
    const tiePercent = total ? (counts[2] / total) * 100 : 0;
  
    // 更新進度條的寬度及文字
    document.getElementById('progress-o').style.width = `${oPercent}%`;
    document.getElementById('progress-o').textContent = `O: ${counts[0]} (${label[0]})`;
  
    document.getElementById('progress-x').style.width = `${xPercent}%`;
    document.getElementById('progress-x').textContent = `X: ${counts[1]} (${label[1]})`;
  
    document.getElementById('progress-tie').style.width = `${tiePercent}%`;
    document.getElementById('progress-tie').textContent = `平手: ${counts[2]}`;
}

function selfPlay(){
    const loader = document.getElementById('loader');
    loader.classList.add('is-active');
    setTimeout(() => {
        const config = document.getElementById('bots').value;
        let agent = [], label = [];
        if (config == 'abvab') {
            agent = [AlphaBetaMove, AlphaBetaMove];
            label = ['AlphaBeta', 'AlphaBeta'];
        }else if (config == 'rvab') {
            agent = [AlphaBetaMove, randomMove];
            label = ['AlphaBeta', 'Random'];
        }else if (config == 'rvr') {
            agent = [randomMove, randomMove];
            label = ['Random', 'Random'];
        }

        const times = parseInt(document.getElementById('times').value);
        if (isNaN(times)) return;

        let win_rec = [0, 0, 0]; // [O, X, tie]
        for (let i = 0; i < times; i++) {
            reset();
            while (true) {
                counter++;
                agent[counter%2](counter);
                if (boardIsFull(board)) {
                    win_rec[2]++;
                    end();
                    break;
                }
                const winline = checkWinLine(board);
                if (winline.length > 0) {
                    win_rec[board[winline[0]]==='X'?1:0]++;
                    end(winline);
                    break;
                }
            }
        }
        updateProgressBar(win_rec, label);
        loader.classList.remove('is-active');
    }, 10);
}

function disable(bool) {
    for (let i = 0; i < 9; i++)
        document.getElementById('btn' + i).disabled = bool;
}

function end(winline=[]){
    printBoard(board);
    disable(true);
    for (let i = 0; i < winline.length; i++)
        document.getElementById('btn' + winline[i]).style.backgroundColor = 'red';
}

function reset(){
    counter = 0;
    disable(false);
    document.getElementById('first').disabled = false;
    for (let i = 0; i < 9; i++){
        board[i] = ' ';
        const btn = document.getElementById('btn' + i);
        btn.style.backgroundColor = '#343a40';
    }
    printBoard(board);
}

reset();

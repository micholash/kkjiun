// 맵 정의: 0=빈 공간, 1=벽, 2=먹이, 3=팩맨 시작, 4=유령 시작
// 20x20 맵을 예시로 만듭니다.
const layout = [
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1,
    1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1,
    1,2,1,1,2,1,2,2,2,2,2,2,2,2,1,2,1,1,2,1,
    1,2,2,2,2,1,2,1,1,0,0,1,1,2,1,2,2,2,2,1,
    1,2,1,1,2,1,2,0,0,4,4,0,0,2,1,2,1,1,2,1,
    1,2,1,1,2,1,2,0,4,4,4,4,0,2,1,2,1,1,2,1,
    1,2,2,2,2,2,2,0,0,0,0,0,0,2,2,2,2,2,2,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
];

const width = 20; // 맵의 너비
const gameGrid = document.getElementById('game-grid');
let cells = [];
let score = 0;
let pacmanCurrentIndex = 0; // 팩맨의 현재 위치 인덱스
let pacmanDirection = 'right';

// === 1. 게임 맵 생성 ===
function createBoard() {
    gameGrid.style.width = `${width * 20}px`; // 400px
    gameGrid.style.height = `${(layout.length / width) * 20}px`; // 높이 조정

    for (let i = 0; i < layout.length; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        gameGrid.appendChild(cell);
        cells.push(cell);

        // 셀 타입 설정
        if (layout[i] === 1) {
            cell.classList.add('wall');
        } else if (layout[i] === 2) {
            cell.classList.add('dot');
        } else if (layout[i] === 3) {
            cell.classList.add('pacman', 'pacman-right');
            pacmanCurrentIndex = i;
        } else if (layout[i] === 4) {
             cell.classList.add('ghost-home'); // 유령 집
        } else if (layout[i] === 0) {
            cell.classList.add('empty');
        }
    }
}

// === 2. 팩맨 움직임 및 방향 설정 ===
function movePacman(direction) {
    let nextIndex = pacmanCurrentIndex;
    let newDirection = pacmanDirection;

    // 현재 방향에 따라 다음 인덱스 계산
    switch (direction) {
        case 'left':
            nextIndex -= 1;
            newDirection = 'left';
            break;
        case 'right':
            nextIndex += 1;
            newDirection = 'right';
            break;
        case 'up':
            nextIndex -= width;
            newDirection = 'up';
            break;
        case 'down':
            nextIndex += width;
            newDirection = 'down';
            break;
    }
    
    // 배열 경계를 벗어나지 않도록 하고, 벽인지 확인
    if (nextIndex >= 0 && nextIndex < layout.length &&
        !cells[nextIndex].classList.contains('wall')) {
        
        // 이전 위치에서 팩맨 클래스 제거
        cells[pacmanCurrentIndex].classList.remove('pacman', `pacman-${pacmanDirection}`);
        cells[pacmanCurrentIndex].classList.add('empty');
        
        pacmanCurrentIndex = nextIndex;
        pacmanDirection = newDirection;
        
        // 새로운 위치에 팩맨 클래스 추가 및 방향 설정
        cells[pacmanCurrentIndex].classList.add('pacman', `pacman-${pacmanDirection}`);

        // 먹이 먹기
        eatDot();
    }
}

// === 3. 먹이 먹기 로직 ===
function eatDot() {
    if (cells[pacmanCurrentIndex].classList.contains('dot')) {
        cells[pacmanCurrentIndex].classList.remove('dot');
        cells[pacmanCurrentIndex].classList.add('empty');
        score += 10;
        document.getElementById('score').innerText = score;
        
        // 승리 조건 체크
        if (score >= totalDots * 10) { 
            endGame("WIN");
        }
    }
}

// === 4. 키보드 입력 처리 ===
function control(e) {
    // 화살표 키로 움직임
    switch (e.key) {
        case 'ArrowLeft':
            movePacman('left');
            break;
        case 'ArrowRight':
            movePacman('right');
            break;
        case 'ArrowUp':
            movePacman('up');
            break;
        case 'ArrowDown':
            movePacman('down');
            break;
    }
}

// === 5. 유령 로직 및 충돌 (간단 구현) ===

class Ghost {
    constructor(className, startIndex, speed) {
        this.className = className;
        this.startIndex = startIndex;
        this.speed = speed;
        this.currentIndex = startIndex;
        this.isScared = false; // 공포 모드 (향후 확장용)
        this.timerId = null;
    }
    
    move() {
        // 유령 움직임 로직 (매우 단순한 무작위 이동)
        // 실제 팩맨 게임은 복잡한 A* 알고리즘 또는 타겟팅 알고리즘을 사용합니다.
        
        if (cells[this.currentIndex].classList.contains(this.className)) {
             cells[this.currentIndex].classList.remove(this.className, 'ghost');
        }
        
        const directions = [-1, +1, -width, +width]; // 좌, 우, 상, 하
        let direction = directions[Math.floor(Math.random() * directions.length)];
        let nextIndex = this.currentIndex + direction;

        // 벽이 아니고 배열 범위 내에 있으면 이동
        if (!cells[nextIndex].classList.contains('wall') &&
            nextIndex >= 0 && nextIndex < layout.length) {
            
            this.currentIndex = nextIndex;
        }

        cells[this.currentIndex].classList.add(this.className, 'ghost');

        // 충돌 감지
        if (cells[pacmanCurrentIndex].classList.contains(this.className)) {
            endGame("LOSE");
        }
    }
}

const ghosts = [
    new Ghost('blinky', width * 5 + 10, 250),
    new Ghost('pinky', width * 5 + 9, 350)
    // 다른 유령 추가 가능
];


// === 6. 게임 시작/종료 ===

let totalDots = 0;
let gameIntervals = [];

function startGame() {
    // 먹이 개수 계산
    totalDots = layout.filter(cell => cell === 2).length;
    
    // 유령 움직임 시작
    ghosts.forEach(ghost => {
        ghost.timerId = setInterval(() => {
            ghost.move();
        }, ghost.speed);
        gameIntervals.push(ghost.timerId);
    });
    
    document.getElementById('status-message').innerText = "게임 중...";
}

function endGame(result) {
    gameIntervals.forEach(clearInterval); // 모든 유령 타이머 중지
    document.removeEventListener('keydown', control); // 키 입력 중지
    
    if (result === "WIN") {
        document.getElementById('status-message').innerText = `✨ 승리! 최종 점수: ${score} ✨`;
    } else {
        document.getElementById('status-message').innerText = `😭 게임 오버! 점수: ${score} 😭`;
        cells[pacmanCurrentIndex].style.backgroundColor = 'red'; // 팩맨 사망 표시
    }
}

// 초기화 및 이벤트 리스너 설정
function init() {
    // 팩맨 시작 위치를 찾기 쉽게 맵을 확장하거나 조정했습니다.
    // 레이아웃을 실제 팩맨 맵에 맞게 더 복잡하게 만드려면 layout 배열을 수정해야 합니다.
    createBoard();
    
    // 키보드 이벤트 리스너
    document.addEventListener('keydown', control);
    
    // 최초 화살표 입력 시 게임 시작
    document.addEventListener('keydown', function start(e) {
        if (e.key.startsWith('Arrow')) {
            startGame();
            document.removeEventListener('keydown', start); // 한 번 시작하면 이벤트 리스너 제거
        }
    });
}

document.addEventListener('DOMContentLoaded', init);

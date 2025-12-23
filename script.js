// --- 20단계 비둘기 도감 ---
const pigeonTypes = [
    { level: 1, emoji: "🥚", name: "알" },
    { level: 2, emoji: "🐣", name: "깨진 알" },
    { level: 3, emoji: "🐥", name: "병아리" },
    { level: 4, emoji: "🐦", name: "비둘기" },
    { level: 5, emoji: "🥖", name: "빵둘기" },
    { level: 6, emoji: "🐔", name: "닭둘기" },
    { level: 7, emoji: "🦜", name: "앵무둘기" },
    { level: 8, emoji: "🦢", name: "백조둘기" },
    { level: 9, emoji: "🦩", name: "홍학둘기" },
    { level: 10, emoji: "🦚", name: "공작둘기" },
    { level: 11, emoji: "🦉", name: "부엉둘기" },
    { level: 12, emoji: "🦅", name: "독수리" },
    { level: 13, emoji: "🦆", name: "오리둘기" },
    { level: 14, emoji: "🦇", name: "박쥐둘기" },
    { level: 15, emoji: "🐉", name: "용둘기" },
    { level: 16, emoji: "✈️", name: "전투기" },
    { level: 17, emoji: "🚁", name: "헬기" },
    { level: 18, emoji: "🚀", name: "로켓" },
    { level: 19, emoji: "🛸", name: "UFO" },
    { level: 20, emoji: "🪐", name: "우주신" }
];

const gameArea = document.getElementById('game-area');
const maxLevelSpan = document.getElementById('max-level');
const maxLevelNameSpan = document.getElementById('max-level-name');
const spawnBtn = document.getElementById('spawnBtn');

let highestLevel = 0;
let activeItem = null; // 현재 드래그 중인 아이템
let startX = 0, startY = 0; // 드래그 시작 시 아이템 내부 좌표
let initialPos = { x: 0, y: 0 }; // 드래그 시작 시 아이템의 원래 위치

const ITEM_SIZE = 70; // CSS에서 정한 아이템 크기

// --- 1. 랜덤 위치 계산 함수 ---
function getRandomPosition() {
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;
    
    // 화면 밖으로 나가지 않도록 패딩을 줌
    const maxX = areaWidth - ITEM_SIZE;
    const maxY = areaHeight - ITEM_SIZE;
    
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    
    return { x, y };
}

// --- 2. 아이템 생성 ---
function createItem(level, x = null, y = null) {
    const data = pigeonTypes[level - 1];
    const item = document.createElement('div');
    item.classList.add('item');
    item.dataset.level = level;

    // 위치 지정 (없으면 랜덤)
    const pos = (x === null || y === null) ? getRandomPosition() : { x, y };
    item.style.left = `${pos.x}px`;
    item.style.top = `${pos.y}px`;

    // 내용 채우기
    item.innerHTML = `<div class="emoji">${data.emoji}</div><div class="level">Lv.${level}</div>`;
    
    // 등장 애니메이션
    item.classList.add('pop-anim');
    item.addEventListener('animationend', () => item.classList.remove('pop-anim'));

    // 드래그 이벤트 연결
    item.addEventListener('pointerdown', handlePointerDown);
    
    gameArea.appendChild(item);
    updateScore(level);
    return item; // 생성된 아이템 반환
}

// --- 3. 버튼 클릭 (랜덤 생성) ---
spawnBtn.addEventListener('click', () => {
    // 너무 많으면 생성 제한 (렉 방지)
    if (document.querySelectorAll('.item').length >= 50) {
        alert("비둘기가 너무 많아요! 먼저 합쳐주세요.");
        return;
    }
    createItem(1); // 1레벨 랜덤 생성
});

// --- 4. 드래그 앤 드롭 로직 (직접 이동 방식) ---

function handlePointerDown(e) {
    e.preventDefault();
    activeItem = e.currentTarget;
    
    // 현재 위치 저장 (합성 실패 시 되돌아오기 위함)
    initialPos.x = parseFloat(activeItem.style.left);
    initialPos.y = parseFloat(activeItem.style.top);
    
    // 클릭한 지점과 아이템 마진 사이의 거리 계산
    const rect = activeItem.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    activeItem.classList.add('dragging');
    activeItem.setPointerCapture(e.pointerId); // 포인터 고정

    activeItem.addEventListener('pointermove', handlePointerMove);
    activeItem.addEventListener('pointerup', handlePointerUp);
}

function handlePointerMove(e) {
    if (!activeItem) return;
    e.preventDefault();

    // 부모 요소 기준 상대 좌표 계산
    const areaRect = gameArea.getBoundingClientRect();
    let newX = e.clientX - areaRect.left - startX;
    let newY = e.clientY - areaRect.top - startY;

    // 화면 밖으로 못 나가게 막기
    newX = Math.max(0, Math.min(newX, gameArea.clientWidth - ITEM_SIZE));
    newY = Math.max(0, Math.min(newY, gameArea.clientHeight - ITEM_SIZE));

    // 위치 즉시 업데이트
    activeItem.style.left = `${newX}px`;
    activeItem.style.top = `${newY}px`;
}

function handlePointerUp(e) {
    if (!activeItem) return;
    activeItem.removeEventListener('pointermove', handlePointerMove);
    activeItem.removeEventListener('pointerup', handlePointerUp);
    activeItem.classList.remove('dragging');
    activeItem.releasePointerCapture(e.pointerId);

    // --- 충돌 감지 및 합성 시도 ---
    const targetItem = findCollidingItem(activeItem);

    if (targetItem) {
        const level1 = parseInt(activeItem.dataset.level);
        const level2 = parseInt(targetItem.dataset.level);

        if (level1 === level2 && level1 < 20) {
            // ** 합성 성공! **
            const newX = parseFloat(targetItem.style.left);
            const newY = parseFloat(targetItem.style.top);
            
            // 두 아이템 삭제
            activeItem.remove();
            targetItem.remove();
            
            // 새 아이템을 타겟 위치에 생성
            createItem(level1 + 1, newX, newY);
        } else {
            // 레벨이 다르면 원래 자리로 복귀
            returnToInitialPos(activeItem);
        }
    } else {
        // 충돌한 아이템이 없으면 그 자리에 둠 (아무것도 안 함)
    }

    activeItem = null;
}

// 두 아이템이 겹쳤는지 확인하는 함수 (충돌 감지)
function findCollidingItem(currentItem) {
    const currentRect = currentItem.getBoundingClientRect();
    const items = document.querySelectorAll('.item');

    for (const item of items) {
        if (item === currentItem) continue; // 자기 자신 제외

        const rect = item.getBoundingClientRect();
        
        // 중심점 거리 계산 방식이 더 자연스러움
        const currentCenter = { x: currentRect.left + currentRect.width/2, y: currentRect.top + currentRect.height/2 };
        const itemCenter = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
        const distance = Math.sqrt(Math.pow(currentCenter.x - itemCenter.x, 2) + Math.pow(currentCenter.y - itemCenter.y, 2));

        // 두 아이템의 반지름 합보다 거리가 가까우면 충돌 (약간의 여유 0.8)
        if (distance < (ITEM_SIZE * 0.8)) {
            return item; // 충돌한 첫 번째 아이템 반환
        }
    }
    return null;
}

// 원래 자리로 되돌리기 함수
function returnToInitialPos(item) {
    // 부드럽게 돌아가는 트랜지션 추가
    item.style.transition = 'all 0.2s ease-out';
    item.style.left = `${initialPos.x}px`;
    item.style.top = `${initialPos.y}px`;
    
    // 트랜지션 끝나면 속성 제거 (다음 드래그를 위해)
    setTimeout(() => {
        item.style.transition = '';
    }, 200);
}

function updateScore(level) {
    if (level > highestLevel) {
        highestLevel = level;
        const data = pigeonTypes[level - 1];
        maxLevelSpan.innerText = level;
        maxLevelNameSpan.innerText = data.name;
    }
}

// 초기 생성 (테스트용)
// createItem(1); createItem(1); createItem(2);

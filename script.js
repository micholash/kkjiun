const board = document.getElementById('board');
const maxLevelDisplay = document.getElementById('max-level');
const spawnBtn = document.getElementById('spawnBtn');
let highestLevel = 0;

// --- 1. 초기화: 5x5 슬롯 생성 ---
function initBoard() {
    for (let i = 0; i < 25; i++) {
        let slot = document.createElement('div');
        slot.classList.add('slot');
        slot.dataset.index = i;
        board.appendChild(slot);
    }
}

// --- 2. 색상 로직 (레벨별 색상) ---
function getColor(level) {
    const hue = (level * 25) % 360; 
    return `hsl(${hue}, 70%, 50%)`;
}

// --- 3. 아이템 생성 (버튼 클릭) ---
spawnBtn.addEventListener('click', () => {
    const slots = document.querySelectorAll('.slot');
    const emptySlots = Array.from(slots).filter(slot => slot.childElementCount === 0);

    if (emptySlots.length === 0) {
        alert("꽉 찼습니다! 합쳐서 자리를 만드세요.");
        return;
    }

    const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
    createItem(randomSlot, 1);
});

// --- 4. 아이템 만들기 및 이벤트 연결 ---
function createItem(slot, level) {
    const item = document.createElement('div');
    item.classList.add('item');
    item.innerText = level;
    item.dataset.level = level;
    item.style.backgroundColor = getColor(level);

    // 포인터 이벤트(마우스+터치 통합) 연결
    item.addEventListener('pointerdown', handlePointerDown);
    
    slot.appendChild(item);
    updateScore(level);
}

// --- 5. 드래그 앤 드롭 로직 (핵심) ---
let draggedItem = null;      
let cloneItem = null;        

function handlePointerDown(e) {
    e.preventDefault(); 
    
    draggedItem = e.target;
    
    // 시각적 복제본 생성
    cloneItem = draggedItem.cloneNode(true);
    cloneItem.classList.add('dragging-clone');
    document.body.appendChild(cloneItem);
    
    // 복제본 위치 초기화
    moveClone(e.clientX, e.clientY);

    // 원본 숨김
    draggedItem.style.opacity = '0';

    // 이벤트 등록
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
}

function handlePointerMove(e) {
    e.preventDefault();
    if (!cloneItem) return;
    moveClone(e.clientX, e.clientY);
}

function moveClone(x, y) {
    const rect = cloneItem.getBoundingClientRect();
    cloneItem.style.left = (x - rect.width / 2) + 'px';
    cloneItem.style.top = (y - rect.height / 2) + 'px';
}

function handlePointerUp(e) {
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);

    // 손가락 뗀 위치 감지 (복제본은 pointer-events:none이라 통과됨)
    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
    const targetSlot = elementBelow ? elementBelow.closest('.slot') : null;

    if (targetSlot) {
        const existingItem = targetSlot.querySelector('.item');

        // A. 빈 슬롯으로 이동
        if (!existingItem) {
            targetSlot.appendChild(draggedItem);
        }
        // B. 합성 로직
        else if (existingItem !== draggedItem) {
            const level1 = parseInt(draggedItem.dataset.level);
            const level2 = parseInt(existingItem.dataset.level);

            if (level1 === level2 && level1 < 20) {
                // 합체!
                existingItem.remove(); 
                draggedItem.remove();
                createItem(targetSlot, level1 + 1); 
                draggedItem = null; 
            }
        }
    }

    // 뒷정리
    if (draggedItem) draggedItem.style.opacity = '1';
    if (cloneItem) {
        cloneItem.remove();
        cloneItem = null;
    }
    draggedItem = null;
}

function updateScore(level) {
    if (level > highestLevel) {
        highestLevel = level;
        maxLevelDisplay.innerText = highestLevel;
    }
}

// 게임 시작
initBoard();

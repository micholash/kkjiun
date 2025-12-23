// --- 20단계 비둘기 도감 (수정 가능) ---
const pigeonTypes = [
    { level: 1, emoji: "🥚", name: "비둘기 알" },
    { level: 2, emoji: "🐣", name: "깨진 알" },
    { level: 3, emoji: "🐥", name: "아기 새" },
    { level: 4, emoji: "🐦", name: "그냥 비둘기" },
    { level: 5, emoji: "🥖", name: "빵 먹는 둘기" },
    { level: 6, emoji: "🕶️", name: "홍대 비둘기" },
    { level: 7, emoji: "🍗", name: "살찐 닭둘기" },
    { level: 8, emoji: "🎩", name: "신사 비둘기" },
    { level: 9, emoji: "👮", name: "경찰 비둘기" },
    { level: 10, emoji: "🏋️", name: "헬창 비둘기" },
    { level: 11, emoji: "🎤", name: "래퍼 비둘기" },
    { level: 12, emoji: "✈️", name: "제트기 둘기" },
    { level: 13, emoji: "🦅", name: "독수리(진)" },
    { level: 14, emoji: "🤖", name: "메카 비둘기" },
    { level: 15, emoji: "👻", name: "유령 비둘기" },
    { level: 16, emoji: "🐉", name: "용둘기" },
    { level: 17, emoji: "👽", name: "외계 비둘기" },
    { level: 18, emoji: "🧟", name: "좀비 비둘기" },
    { level: 19, emoji: "👑", name: "비둘기 킹" },
    { level: 20, emoji: "🪐", name: "우주신 둘기" }
];

const board = document.getElementById('board');
const maxLevelSpan = document.getElementById('max-level');
const maxLevelNameSpan = document.getElementById('max-level-name');
const spawnBtn = document.getElementById('spawnBtn');

let highestLevel = 1;

// 1. 보드 초기화
function initBoard() {
    for (let i = 0; i < 25; i++) {
        let slot = document.createElement('div');
        slot.classList.add('slot');
        board.appendChild(slot);
    }
}

// 2. 비둘기 정보 가져오기
function getPigeonData(level) {
    // 배열 인덱스는 0부터 시작하므로 level-1
    return pigeonTypes[level - 1] || pigeonTypes[pigeonTypes.length - 1];
}

// 3. 아이템 생성 (화면 그리기)
function createItem(slot, level) {
    const data = getPigeonData(level);
    
    const item = document.createElement('div');
    item.classList.add('item');
    item.dataset.level = level;
    
    // 뿅! 하는 애니메이션 클래스
    item.classList.add('pop-anim');
    setTimeout(() => item.classList.remove('pop-anim'), 300);

    // 내용물 (이모지 + 레벨 숫자)
    item.innerHTML = `
        <div class="emoji">${data.emoji}</div>
        <div class="level">Lv.${level}</div>
    `;

    // 터치/마우스 이벤트 연결
    item.addEventListener('pointerdown', handlePointerDown);
    
    slot.appendChild(item);
    updateScore(level);
}

// 4. 생성 버튼 클릭
spawnBtn.addEventListener('click', () => {
    const slots = document.querySelectorAll('.slot');
    const emptySlots = Array.from(slots).filter(s => s.childElementCount === 0);

    if (emptySlots.length === 0) {
        alert("둥지가 꽉 찼구구! 🕊️");
        return;
    }

    const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
    createItem(randomSlot, 1); // 1레벨(알) 생성
});


// 5. 드래그 앤 드롭 로직 (모바일 완벽 지원)
let draggedItem = null;
let cloneItem = null;

function handlePointerDown(e) {
    e.preventDefault();
    draggedItem = e.currentTarget; // e.target 대신 currentTarget 사용
    
    // 복제본 만들기 (드래그 시 따라다닐 녀석)
    cloneItem = draggedItem.cloneNode(true);
    cloneItem.classList.add('dragging-clone');
    document.body.appendChild(cloneItem);
    
    // 위치 잡기
    moveClone(e.clientX, e.clientY);
    
    // 원본 숨기기
    draggedItem.style.opacity = '0';

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
}

function handlePointerMove(e) {
    e.preventDefault();
    if (cloneItem) moveClone(e.clientX, e.clientY);
}

function moveClone(x, y) {
    // 복제본 중앙을 손가락 위치로
    cloneItem.style.left = (x - 35) + 'px'; // 너비의 절반
    cloneItem.style.top = (y - 35) + 'px'; // 높이의 절반
}

function handlePointerUp(e) {
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);

    // 손가락 뗀 위치의 요소 찾기
    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
    const targetSlot = elementBelow ? elementBelow.closest('.slot') : null;

    if (targetSlot) {
        const existingItem = targetSlot.querySelector('.item');

        // A. 빈 칸으로 이동
        if (!existingItem) {
            targetSlot.appendChild(draggedItem);
        }
        // B. 합치기 시도
        else if (existingItem !== draggedItem) {
            const level1 = parseInt(draggedItem.dataset.level);
            const level2 = parseInt(existingItem.dataset.level);

            if (level1 === level2 && level1 < 20) {
                // 진화 성공!
                existingItem.remove();
                draggedItem.remove();
                createItem(targetSlot, level1 + 1);
                draggedItem = null; // 원본 삭제됨
            }
        }
    }

    // 뒷정리
    if (draggedItem) draggedItem.style.opacity = '1';
    if (cloneItem) cloneItem.remove();
    
    draggedItem = null;
    cloneItem = null;
}

// 점수 업데이트
function updateScore(level) {
    if (level > highestLevel) {
        highestLevel = level;
        const data = getPigeonData(level);
        maxLevelSpan.innerText = level;
        maxLevelNameSpan.innerText = data.name;
    }
}

// 게임 시작
initBoard();

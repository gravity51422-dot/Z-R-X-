/**
 * Z∅RΔX : System Conflict - Main Logic
 * 2-Player PVP Shooting Engine
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');

// UI 게이지 참조
const p1IntBar = document.getElementById('p1-integrity');
const p1StbBar = document.getElementById('p1-stability');
const p2IntBar = document.getElementById('p2-integrity');
const p2StbBar = document.getElementById('p2-stability');

let gameActive = false;
let animationId;

// 캔버스 리사이즈 (시스템 그리드 유지)
function resize() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.8;
}
window.addEventListener('resize', resize);
resize();

// 플레이어 초기 상태 및 조작 키 정의
const players = {
    p1: {
        id: 'USER_01',
        x: 100, y: 0, color: '#00f2ff', 
        integrity: 100, stability: 100, 
        size: 25, speed: 5,
        bullets: [], lastShot: 0, dir: {x: 1, y: 0},
        keys: { up: 'w', down: 's', left: 'a', right: 'd', fire: ' ' }
    },
    p2: {
        id: 'USER_02',
        x: 0, y: 0, color: '#ff00ea',
        integrity: 100, stability: 100, 
        size: 25, speed: 5,
        bullets: [], lastShot: 0, dir: {x: -1, y: 0},
        keys: { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright', fire: 'enter' }
    }
};

// 위치 초기화
players.p1.y = canvas.height / 2;
players.p2.x = canvas.width - 100;
players.p2.y = canvas.height / 2;

const activeKeys = new Set();
window.addEventListener('keydown', e => activeKeys.add(e.key.toLowerCase()));
window.addEventListener('keyup', e => activeKeys.delete(e.key.toLowerCase()));

// 시스템 가동
function startGame() {
    startScreen.style.display = 'none';
    gameActive = true;
    gameLoop();
}

// 투사체 생성 (Stability 소모 시스템)
function spawnBullet(p) {
    const now = Date.now();
    // 안정성 부족 또는 연사 속도 제한
    if (p.stability < 15 || now - p.lastShot < 250) return;
    
    p.bullets.push({
        x: p.x,
        y: p.y,
        vx: p.dir.x * 15,
        vy: p.dir.y * 15,
        damage: 10,
        color: p.color
    });
    
    p.stability -= 20; // 발사 시 안정성 감소
    p.lastShot = now;
}

// 플레이어 물리 및 로직 업데이트
function updatePlayer(p, otherP) {
    let dx = 0, dy = 0;
    
    if (activeKeys.has(p.keys.up)) dy -= 1;
    if (activeKeys.has(p.keys.down)) dy += 1;
    if (activeKeys.has(p.keys.left)) dx -= 1;
    if (activeKeys.has(p.keys.right)) dx += 1;

    // 대각선 이동 속도 보정 및 방향 설정
    if (dx !== 0 || dy !== 0) {
        const mag = Math.sqrt(dx*dx + dy*dy);
        p.dir.x = dx / mag;
        p.dir.y = dy / mag;
        
        p.x += p.dir.x * p.speed;
        p.y += p.dir.y * p.speed;
    }

    if (activeKeys.has(p.keys.fire)) spawnBullet(p);

    // 화면 경계 제한
    p.x = Math.max(p.size, Math.min(canvas.width - p.size, p.x));
    p.y = Math.max(p.size, Math.min(canvas.height - p.size, p.y));

    // 안정성 자동 회복
    if (p.stability < 100) p.stability += 0.4;

    // 투사체 물리 및 충돌 판정
    p.bullets.forEach((b, index) => {
        b.x += b.vx;
        b.y += b.vy;

        // 상대 플레이어 피격 판정
        const dist = Math.hypot(b.x - otherP.x, b.y - otherP.y);
        if (dist < otherP.size) {
            otherP.integrity -= b.damage;
            triggerSystemGlitch();
            p.bullets.splice(index, 1);
        }

        // 화면 밖으로 나간 탄환 제거
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            p.bullets.splice(index, 1);
        }
    });
}

// 피격 시 글리치 시각 효과 트리거
function triggerSystemGlitch() {
    canvas.classList.add('glitch-active');
    setTimeout(() => {
        canvas.classList.remove('glitch-active');
    }, 150);
}

// 렌더링 엔진
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    [players.p1, players.p2].forEach(p => {
        // 플레이어 본체 (네온 박스)
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        
        // 무결성(Integrity)이 낮을수록 본체가 떨림
        const tremble = (100 - p.integrity) / 20;
        const tx = (Math.random() - 0.5) * tremble;
        const ty = (Math.random() - 0.5) * tremble;
        
        ctx.fillRect(p.x - p.size/2 + tx, p.y - p.size/2 + ty, p.size, p.size);
        
        // 방향 지시선
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.dir.x * 35, p.y + p.dir.y * 35);
        ctx.stroke();
        ctx.restore();

        // 탄환 렌더링
        p.bullets.forEach(b => {
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    });

    // 실시간 UI 업데이트
    updateUI();

    // 승리 조건 체크
    if (players.p1.integrity <= 0 || players.p2.integrity <= 0) {
        endGame();
    }
}

function updateUI() {
    p1IntBar.style.width = `${Math.max(0, players.p1.integrity)}%`;
    p1StbBar.style.width = `${players.p1.stability}%`;
    p2IntBar.style.width = `${Math.max(0, players.p2.integrity)}%`;
    p2StbBar.style.width = `${players.p2.stability}%`;
}

function endGame() {
    gameActive = false;
    cancelAnimationFrame(animationId);
    const winner = players.p1.integrity <= 0 ? "USER_02" : "USER_01";
    
    // 단순 alert 대신 시스템 스타일의 텍스트 출력 권장
    setTimeout(() => {
        if(confirm(`CRITICAL ERROR: SYSTEM BREACH BY ${winner}\nREBOOT SYSTEM?`)) {
            location.reload();
        }
    }, 100);
}

function gameLoop() {
    if (!gameActive) return;
    updatePlayer(players.p1, players.p2);
    updatePlayer(players.p2, players.p1);
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// 초기화 대기
window.onload = () => {
    console.log("Z∅RΔX System Initialized...");
};

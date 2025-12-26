const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const keys = {};

// 키 입력 처리
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// 플레이어 생성
const player1 = new Player(
  100, 250, "red",
  { left: "a", right: "d", up: "w", down: "s" },
  false
);

const player2 = new Player(
  650, 250, "blue",
  { left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown" },
  true // ← 이동 반전
);

// 목표 오브젝트
const goal = {
  x: 385,
  y: 235,
  size: 30
};

// 충돌 판정
function isCollide(p, g) {
  return (
    p.x < g.x + g.size &&
    p.x + p.size > g.x &&
    p.y < g.y + g.size &&
    p.y + p.size > g.y
  );
}

// 게임 루프
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 목표 그리기
  ctx.fillStyle = "yellow";
  ctx.fillRect(goal.x, goal.y, goal.size, goal.size);

  // 플레이어 이동
  player1.move(keys);
  player2.move(keys);

  // 플레이어 그리기
  player1.draw(ctx);
  player2.draw(ctx);

  // 승리 조건
  if (isCollide(player1, goal)) {
    alert("Player 1 승리!");
    location.reload();
  }
  if (isCollide(player2, goal)) {
    alert("Player 2 승리!");
    location.reload();
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();


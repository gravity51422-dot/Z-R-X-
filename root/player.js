class Player {
  constructor(x, y, color, controls, reverse = false) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.speed = 4;
    this.color = color;
    this.controls = controls;
    this.reverse = reverse;
  }

  move(keys) {
    let dir = this.reverse ? -1 : 1;

    if (keys[this.controls.left]) {
      this.x -= this.speed * dir;
    }
    if (keys[this.controls.right]) {
      this.x += this.speed * dir;
    }
    if (keys[this.controls.up]) {
      this.y -= this.speed;
    }
    if (keys[this.controls.down]) {
      this.y += this.speed;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}


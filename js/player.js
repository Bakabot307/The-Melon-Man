game.player = {
	x: 54,
	y: 0,
	height: 24,
	highestY: 0,
	hp: 100,
	hpElement: document.getElementById('hp'),
	justHit: false,
	justHitByChicken: false,
	direction: "left",
	isInAir: false,
	platform: {
		name: "grassPlatform",
		x: 0,
		y: 0,
		movementRate: 0.1
	},
	startedJump: false,
	moveInterval: null,
	numberOfAllowedJump: 2,
	fallTimeoutId: null,
	fallTimeout: function (startingY, time, maxHeight) {
		if (this.fallTimeoutId) clearTimeout(this.fallTimeoutId)
		this.fallTimeoutId = setTimeout(function () {
			if (this.isInAir) {
				this.y = startingY - maxHeight + Math.pow((-time / 3 + 11), 2)
				if (this.y < this.highestY) {
					this.highestY = this.y
				}
				if (time > 37) {
					this.startedJump = false
					game.checkCollisions()
				}
				if (time < 150) {
					time++
					this.fallTimeout(startingY, time, maxHeight)
				} else {
					game.isOver = true
				}
				if (this.y > 40) {
					game.isOver = true
				}
			} else {
				this.numberOfAllowedJump = 3
			}
		}.bind(this, startingY, time, maxHeight), 12)
	},
	animationFrameNumber: 0,
	collidesWithGround: true,
	animations: {
		// Describe coordinates of consecutive animation frames of objects in textures
		left: [{ tileColumn: 4, tileRow: 0 }, { tileColumn: 5, tileRow: 0 }, { tileColumn: 4, tileRow: 0 }, { tileColumn: 6, tileRow: 0 }],
		right: [{ tileColumn: 9, tileRow: 0 }, { tileColumn: 8, tileRow: 0 }, { tileColumn: 9, tileRow: 0 }, { tileColumn: 7, tileRow: 0 }],
		stunned: [{ tileColumn: 9, tileRow: 1 }, { tileColumn: 9, tileRow: 1 }, { tileColumn: 9, tileRow: 1 }, { tileColumn: 9, tileRow: 1 }]
	},
	jump: function (type) {
		if (!game.started && game.player.y === 0) game.timer.start();

		var startingY = this.y;
		var time = 1;
		var maxHeight = 121;
		if (type == "fall") {
			if (!this.isInAir) {
				time = 30;
				maxHeight = 0;
				this.isInAir = true;
				this.fallTimeout(startingY, time, maxHeight);
			}
			return;
		}
		if (!this.isInAir) {
			this.initiateJump(startingY, time, maxHeight)
		} else {
			if (this.numberOfAllowedJump > 0) {
				this.initiateJump(startingY, time, Math.round(maxHeight))
			}
		}
	},

	initiateJump: function (startingY, time, maxHeight) {
		clearInterval(this.fallTimeoutId);
		game.sounds.jump.play();
		this.startedJump = true;
		this.isInAir = true;
		this.numberOfAllowedJump -= 1;
		this.fallTimeout(startingY, time, maxHeight);
	}
}

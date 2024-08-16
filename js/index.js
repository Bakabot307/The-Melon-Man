// The spaghetti code masterpiece
var game = {
	canvas: document.getElementById('canvas'),
	context: this.canvas.getContext('2d', { alpha: false }),
	counter: document.getElementById('counter'),
	textures: new Image(),
	started: false,
	backgrounds: {
		'sky': {
			image: new Image(),
			loaded: false
		},
		'trees': {
			image: new Image(),
			loaded: false
		}
	},
	sounds: {
		jump: new Audio('sounds/jump.wav')
	},
	options: {
		texturesPath: "textures_backup.png",
		tileWidth: 24,
		tileHeight: 24,
		canvasWidth: window.innerWidth / 3,
		canvasHeight: window.innerHeight / 3
	},
	pressedKeys: {},
	init: function (onInit) {
		this.canvas.width = this.options.canvasWidth
		this.canvas.height = this.options.canvasHeight
		this.context.imageSmoothingEnabled = false

		this.backgrounds['sky'].image.src = "background.png"
		this.backgrounds['trees'].image.src = "trees.png"

		for (var key in this.backgrounds) {
			this.backgrounds[key].image.onload = function (currentKey) {
				this.backgrounds[currentKey].loaded = true
			}.bind(this, key)
		}
		// spawn rain
		this.challenges.rain.rainInterval = setInterval(function () {
			game.challenges.rain.spawn()
		}, this.challenges.rain.rainIntervalTime)

		// spawn hp
		game.buff.hp.spawn()
		this.buff.hp.hpInterval = setInterval(function () {
			if (game.started)
				game.buff.hp.spawn()
		}, this.buff.hp.hpIntervalTime)
		// spawn shield
		this.buff.shield.shieldInterval = setInterval(function () {
			if (game.started)
				game.buff.shield.spawn()
		}, this.buff.shield.shieldIntervalTime)

		//spawn fireballs
		this.challenges.fireball.fireInterval = setInterval(function () {
			if (game.started)
				game.challenges.fireball.spawn()
		}, this.challenges.fireball.fireIntervalTime)
		//spawn chickens
		this.challenges.chicken.fireInterval = setInterval(function () {
			if (game.started)
				game.challenges.chicken.spawn()
		}, this.challenges.chicken.fireIntervalTime)

		this.textures.src = this.options.texturesPath
		this.textures.onload = onInit
	},
	map: {
		structures: []
	},
	isOver: false,
	points: 0,
	bestScoreElement: document.getElementById('bestScore'),
	setCookie: function (name, value, days) {
		let expires = "";
		if (days) {
			const date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + (value || "") + expires + "; path=/";
	},
	getCookie: function (name) {
		const nameEQ = name + "=";
		const ca = document.cookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	},
	timer: {
		timer: 0,
		timerElement: document.getElementById('timer'),
		startTime: 0,

		start: function () {

			game.started = true;
			this.timer = Date.now() - this.elapsedTime;
			this.startTime = Date.now();
			this.update();
		},

		stop: function () {
			if (game.started) {
				game.started = false;
				this.timer = Date.now() - this.startTime;
			}
		},

		update: function () {
			if (game.started) {
				this.timer = Date.now() - this.startTime;
				this.updateDisplay();
				requestAnimationFrame(this.update.bind(this));
			}
		},

		updateDisplay: function () {
			const seconds = Math.floor(this.timer / 1000);
			this.timerElement.innerHTML = `Time: ${seconds}s`;
		}
	},
	challenges: {
		fireball: {
			speed: 0.3,
			fireballs: [],
			fireInterval: null,
			fireIntervalTime: 1000,
			fireTimeout: null,
			fireTimeoutDuration: 1000,
			spawn: function () {
				this.fireballs.push({
					x: Math.random() * (0 - game.options.canvasWidth * 2 - Math.abs(game.player.x)) + (game.options.canvasWidth + game.player.x),
					y: game.player.y - game.options.canvasHeight * 5,
					width: game.options.tileWidth,
					height: game.options.tileHeight
				});
			},
			move: function () {
				for (var i = 0; i < this.fireballs.length; i++) {
					this.fireballs[i].y = this.fireballs[i].y + this.speed;
					// remove fireballs if they are out of the screen
					if (this.fireballs[i].y > game.player.y + game.options.canvasHeight) {
						this.fireballs.splice(i, 1);
						i--;
					}
				}
			}
		},
		laser: {
			x: 0,
			y: 0,
			width: 0,
			height: 1,
			speed: 0,
			spawned: false,
			spawn: function () {
				this.spawned = true;
				this.width = game.options.canvasWidth;
				this.x = 0;
				this.y = game.player.y + game.options.canvasHeight; //next player position
			},
			move: function () {
				//the longer the game the faster the laser floor
				this.speed = 0.1 + Math.log(1 + game.points) / 10;
				this.x = 0;
				this.y = this.y - this.speed;
				this.width = game.options.canvasWidth;

			}
		},
		chicken: {
			fireInterval: null,
			chickens: [],
			speed: 1.3,
			fireIntervalTime: 5000,
			stunDuration: 1000,
			spawn: function () {
				let x = Math.random() * game.options.canvasWidth;
				let y = game.options.canvasHeight + game.player.y;
				let width = game.options.tileWidth;
				let height = game.options.tileHeight;
				let angle = Math.atan2(game.player.y - y, game.player.x - x) * 180 / Math.PI;
				this.chickens.push({
					x: x,
					y: y,
					width: width,
					height: height,
					angle: angle
				});
			},
			move: function () {
				for (var i = 0; i < this.chickens.length; i++) {
					let angleInRadians = this.chickens[i].angle * Math.PI / 180;
					this.chickens[i].x += this.speed * Math.cos(angleInRadians);
					this.chickens[i].y += this.speed * Math.sin(angleInRadians);
				}
				// Remove chickens if there are more than 20
				if (this.chickens.length > 20) {
					this.chickens.shift();
				}
			}
		},
		rain: {
			rainInterval: null,
			rainIntervalTime: 50,
			drops: [],
			speed: 0.5,
			color: "black",
			spawn: function () {
				//change rain color based on points
				if (game.points <= 10) {
					this.color = "black"
				} else if (game.points > 10 && game.points <= 15) {
					this.color = "blue"
				} else if (game.points > 15 && game.points < 20) {
					this.color = "red"
				}
				else {
					if (game.points % 2 == 0) {
						this.color = "yellow"
					} else {
						this.color = "green"
					}
				}
				this.drops.push({
					x: Math.random() * (0 - game.options.canvasWidth * 2 - Math.abs(game.player.x)) + (game.options.canvasWidth + game.player.x),
					y: game.player.y - game.options.canvasHeight * 2,
					width: 1,
					height: 1,
					color: this.color
				});
			},
			move: function () {
				for (var i = 0; i < this.drops.length; i++) {
					this.drops[i].y = this.drops[i].y + this.speed;
					// remove drops if they are out of the screen
					if (this.drops[i].y > game.player.y + game.options.canvasHeight) {
						this.drops.splice(i, 1);
						i--;
					}
				}
			}
		}
	},
	buff: {
		shield: {
			active: false,
			immortalTimeOutDuration: 1500,
			isImmortal: false,
			immortalTimeOut: null,
			speed: 0.3,
			shieldInterval: null,
			shieldIntervalTime: 20000,
			width: 10,
			height: 10,
			radius: 15,
			shields: [],
			activeShield: function () {
				this.active = true;
				this.x = game.options.canvasWidth / 2 + Math.round(game.player.x) - Math.round(game.options.canvasWidth / 2);
				this.y = game.player.y;
			},
			spawn: function () {
				this.shields.push({
					name: "shield",
					x: game.options.canvasWidth / 2 + Math.round(game.player.x) - Math.round(game.options.canvasWidth / 2),
					y: game.player.y - game.options.canvasHeight * 5,
					width: this.width,
					height: this.height,
					radius: this.radius
				})
			},
			move: function () {
				for (var i = 0; i < this.shields.length; i++) {
					this.shields[i].y = this.shields[i].y + this.speed;
					// remove shield if they are out of the screen
					if (this.shields[i].y > game.player.y + game.options.canvasHeight * 2) {
						this.shields.splice(i, 1);
						i--;
					}
				}
			}
		},
		hp: {
			hps: [],
			speed: 0.3,
			hpInterval: null,
			hpIntervalTime: 15000,
			hpBorderColor: "black",
			spawn: function () {
				this.hps.push({
					name: "hp",
					x: game.options.canvasWidth / 2 + Math.round(game.player.x) - Math.round(game.options.canvasWidth / 2),
					y: game.player.y - game.options.canvasHeight * 5,
					width: 10,
					height: 10
				});
			},
			move: function () {
				for (var i = 0; i < this.hps.length; i++) {
					this.hps[i].y = this.hps[i].y + this.speed;
					// remove hp if they are out of the screen
					if (this.hps[i].y > game.player.y + game.options.canvasHeight * 2) {
						this.hps.splice(i, 1);
						i--;
					}
				}
			}

		}

	}

}



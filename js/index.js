
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
		texturesPath: "textures.png",
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

		//spawn fireballs
		game.challenges.fireball.spawn()
		this.challenges.fireball.fireInterval = setInterval(function () {
			game.challenges.fireball.spawn()
		}, this.challenges.fireball.fireIntervalTime)

		this.textures.src = this.options.texturesPath
		this.textures.onload = onInit
	},
	map: {
		structures: []
	},
	isOver: false,
	points: 0,
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
			speed: 0.1,
			fireballs: [],
			fireInterval: null,
			fireIntervalTime: 5000,
			spawn: function () {
				var mapWidth = game.options.canvasWidth;
				var middleStart = (mapWidth / 2) - (mapWidth * 0.25);
				var middleWidth = mapWidth * 0.5;
				this.fireballs.push({
					x: middleStart + Math.random() * middleWidth,
					y: game.player.y - game.options.canvasHeight,
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
		}
	}

}


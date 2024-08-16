// Functions responsible for drawing on canvas
game.drawTile = function (tileColumn, tileRow, x, y) {
	game.context.drawImage(
		game.textures,
		tileColumn * game.options.tileWidth,
		tileRow * game.options.tileHeight,
		game.options.tileWidth,
		game.options.tileHeight,
		x * game.options.tileWidth - Math.round(game.player.x) + Math.round(game.options.canvasWidth / 2 + game.options.tileWidth / 2),
		y * game.options.tileHeight - Math.round(game.player.y) + Math.round(game.options.canvasHeight / 2 + game.options.tileHeight / 2),
		game.options.tileWidth,
		game.options.tileHeight
	)
}

game.drawStructure = function (name, x, y) {
	var structure = game.structures[name]
	for (var i = 0; i < structure.length; i++) {
		game.drawTile(structure[i].tileColumn, structure[i].tileRow, structure[i].x + x, structure[i].y + y)
	}
}

game.drawPlayer = function () {
	actualPlayerTile = game.player.animations[game.player.direction][game.player.animationFrameNumber % 4]
	game.context.drawImage(
		game.textures,
		actualPlayerTile.tileColumn * game.options.tileWidth,
		actualPlayerTile.tileRow * game.options.tileHeight,
		game.options.tileWidth,
		game.options.tileHeight,
		Math.round(game.options.canvasWidth / 2 - game.options.tileWidth / 2),
		Math.round(game.options.canvasHeight / 2 - game.options.tileHeight / 2),
		game.options.tileWidth,
		game.options.tileHeight
	)

}
game.drawHpBar = function (width) {
	game.context.drawImage(
		game.textures,
		7 * game.options.tileWidth,
		2.5 * game.options.tileHeight,
		game.options.tileWidth / 2,
		game.options.tileHeight / 2,
		Math.round(game.options.canvasWidth / 2 - game.options.tileWidth / 2 + 3),
		Math.round(game.options.canvasHeight / 2 - game.options.tileHeight / 2 - 5),
		width,
		2
	)
	game.context.strokeStyle = "black";
	game.context.lineWidth = 1;
	game.context.strokeRect(
		Math.round(game.options.canvasWidth / 2 - game.options.tileWidth / 2 + 3),
		Math.round(game.options.canvasHeight / 2 - game.options.tileHeight / 2 - 5),
		20,
		2)
}


game.drawFireball = function (x, y) {
	var screenX = x - Math.round(game.player.x) + Math.round(game.options.canvasWidth / 2);
	var screenY = y - Math.round(game.player.y) + Math.round(game.options.canvasHeight / 2);
	game.context.drawImage(
		game.textures,
		6 * game.options.tileWidth,
		2 * game.options.tileHeight,
		game.options.tileWidth * 1.7,
		game.options.tileHeight * 2,
		screenX,
		screenY,
		game.options.tileWidth,
		game.options.tileHeight
	)
}

game.drawChicken = function (x, y) {
	var screenX = x - Math.round(game.player.x) + Math.round(game.options.canvasWidth / 2);
	var screenY = y - Math.round(game.player.y) + Math.round(game.options.canvasHeight / 2);
	game.context.drawImage(
		game.textures,
		7.7 * game.options.tileWidth,
		2 * game.options.tileHeight,
		game.options.tileWidth * 2,
		game.options.tileHeight * 2,
		screenX,
		screenY,
		game.options.tileWidth,
		game.options.tileHeight
	)
}


game.drawLaser = function (x, y, width, height) {
	var screenY = y - Math.round(game.player.y);
	game.context.drawImage(
		game.textures,
		6 * game.options.tileWidth,
		1.9 * game.options.tileHeight,
		game.options.tileWidth * 1.5,
		height,
		x,
		screenY,
		width,
		height
	)
}

game.redraw = function () {
	// Draw the background
	if (game.backgrounds['sky'].loaded) {
		var pattern = game.context.createPattern(game.backgrounds['sky'].image, 'repeat') // Create a pattern with this image, and set it to "repeat".
		game.context.fillStyle = pattern
	} else {
		game.context.fillStyle = "#78c5ff"
	}

	game.context.fillRect(0, 0, game.canvas.width, game.canvas.height)

	if (game.backgrounds['trees'].loaded) {
		game.context.drawImage(game.backgrounds['trees'].image, 0, game.canvas.height / 2 - game.player.y / 10, 332, 180)
		game.context.drawImage(game.backgrounds['trees'].image, 332, game.canvas.height / 2 - game.player.y / 10, 332, 180)
	}

	// List nearest structures
	if (!game.started) {
		game.drawTitle();
	}
	var structuresToDraw = []
	var drawing_distance = 15
	for (var i = 0; i < game.map.structures.length; i++) {
		if (
			game.map.structures[i].x > (game.player.x / game.options.tileWidth) - drawing_distance
			&& game.map.structures[i].x < (game.player.x / game.options.tileWidth) + drawing_distance
			&& game.map.structures[i].y > (game.player.y / game.options.tileHeight) - drawing_distance
			&& game.map.structures[i].y < (game.player.y / game.options.tileHeight) + drawing_distance
		) {
			structuresToDraw.push(game.map.structures[i])
		}
	}

	// Draw theme
	for (var i = 0; i < structuresToDraw.length; i++) {
		game.drawStructure(structuresToDraw[i].name, structuresToDraw[i].x, structuresToDraw[i].y)
	}
	// Draw the player
	game.drawPlayer()
	// Draw the hp bar
	game.drawHpBar(2 * game.player.hp / 10)
	// Draw fireballs
	for (var i = 0; i < game.challenges.fireball.fireballs.length; i++) {
		game.drawFireball(game.challenges.fireball.fireballs[i].x, game.challenges.fireball.fireballs[i].y)
	}

	game.challenges.fireball.move();
	game.checkCollisionsBall();

	// Draw the laser floor
	if (!game.challenges.laser.spawned && game.player.y < 0) {
		game.challenges.laser.spawn()
	}
	var laser = game.challenges.laser
	game.drawLaser(laser.x, laser.y, laser.width, laser.height)
	if (game.started) {
		game.challenges.laser.move()
	}
	game.checkCollisionsLaser()

	// draw the chicken
	for (var i = 0; i < game.challenges.chicken.chickens.length; i++) {
		game.drawChicken(game.challenges.chicken.chickens[i].x, game.challenges.chicken.chickens[i].y)
	}
	game.challenges.chicken.move()
	game.checkCollisionsChicken()

	// Draw the points
	game.points = Math.round(-game.player.highestY / (3 * game.options.tileHeight)), game.canvas.width - 50, game.canvas.height - 12;
	game.counter.innerHTML = "Points: " + game.points;
}

game.drawTitle = function () {
	game.context.font = "30px superscript"
	game.context.textAlign = "center"
	game.context.fillStyle = "black"
	game.context.fillText("START!!", game.canvas.width / 2, game.canvas.height / 2)
	game.context.font = "15px Georgia"
	game.context.fillText("Press SPACE to start the game!!", game.canvas.width / 2, game.canvas.height / 2 + 50)
}



game.requestRedraw = function () {
	if (!game.isOver) {
		game.redraw();
	}

	if (game.isOver) {
		clearInterval(this.player.fallInterval)
		game.timer.stop()

		game.context.font = "30px superscript"
		game.context.textAlign = "center"
		game.context.fillStyle = "black"
		game.context.fillText("Game over!", game.canvas.width / 2, game.canvas.height / 2)
		game.context.font = "15px Georgia"
		game.context.fillText(`${game.points} points in ${Math.floor(game.timer.timer / 1000)} s`, game.canvas.width / 2, game.canvas.height / 2 + 25)

		game.context.font = "15px Georgia"
		game.context.fillText("Press SPACE to restart", game.canvas.width / 2, game.canvas.height / 2 + 50)
	}
}

game.restart = function () {
	game.isOver = false
	game.started = false
	game.player.x = 54
	game.player.y = 0
	game.player.hp = 100
	game.player.hpElement.innerHTML = `HP: ${game.player.hp} hp`
	game.player.highestY = 0
	game.player.direction = "right"
	game.player.isInAir = false
	game.player.animationFrameNumber = 0
	game.player.collidesWithGround = true

	// Reset timer
	game.timer.timer = 0
	game.timer.startTime = 0
	game.timer.updateDisplay()

	//Reset laser
	game.challenges.laser.y = game.player.y + game.options.canvasHeight * 1.55;
	game.challenges.laser.spawned = false;

	// Reset fireballs
	game.challenges.fireball.fireballs = []

	game.generateMap()
}

game.loop = function () {
	game.requestRedraw()
	requestAnimationFrame(game.loop)
}

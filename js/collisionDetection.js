game.checkCollisions = function () {
	// List potentially collidable entities
	var watchTheseGuys = []
	var bounds = 6
	for (var i = 0; i < game.map.structures.length; i++) {
		if (
			game.map.structures[i].x > (game.player.x / game.options.tileWidth) - bounds
			&& game.map.structures[i].x < (game.player.x / game.options.tileWidth) + bounds
			&& game.map.structures[i].y > (game.player.y / game.options.tileHeight) - bounds
			&& game.map.structures[i].y < (game.player.y / game.options.tileHeight) + bounds
		) {
			watchTheseGuys.push(game.map.structures[i])
		}
	}

	// Check collisions with structures
	for (var i = 0; i < watchTheseGuys.length; i++) {
		for (var j = 0; j < game.structures[watchTheseGuys[i].name].length; j++) {
			if (
				game.player.x / game.options.tileWidth - 0.5 >= watchTheseGuys[i].x + game.structures[watchTheseGuys[i].name][j].x
				&& game.player.x / game.options.tileWidth - 0.5 <= watchTheseGuys[i].x + game.structures[watchTheseGuys[i].name][j].x + 1
				&& game.player.y / game.options.tileHeight < watchTheseGuys[i].y + game.structures[watchTheseGuys[i].name][j].y + 0.2
				&& game.player.y / game.options.tileHeight > watchTheseGuys[i].y + game.structures[watchTheseGuys[i].name][j].y - 0.2
				&& (game.structures[watchTheseGuys[i].name][j].collidable == undefined || game.structures[watchTheseGuys[i].name][j].collidable == true)
				&& !game.player.startedJump
			) {

				clearInterval(game.player.fallInterval)
				game.player.isInAir = false
				game.player.platform = watchTheseGuys[i]
				console.log(game.player.platform)
				game.player.y = Math.round(game.player.y / game.options.tileHeight) * game.options.tileHeight
				return true
			}
		}
	}

	return false
}
game.checkCollisionsBall = function () {
	// Check collisions with fireballs
	for (var i = 0; i < game.challenges.fireball.fireballs.length; i++) {
		var fireball = game.challenges.fireball.fireballs[i];
		if (
			game.player.x + fireball.width < fireball.x + fireball.width * 2 &&
			game.player.x > fireball.x &&
			game.player.y - fireball.height < fireball.y + fireball.height / 2 &&
			game.player.y + game.options.tileHeight / 2 > fireball.y) {

			game.handleHitCollision("ball");
			return true;
		}
	}
}


game.checkCollisionsChicken = function () {
	// Check collisions with chickens
	for (var i = 0; i < game.challenges.chicken.chickens.length; i++) {
		var chicken = game.challenges.chicken.chickens[i];

		if (
			game.player.x + chicken.width < chicken.x + chicken.width * 2 &&
			game.player.x > chicken.x &&
			game.player.y - chicken.height < chicken.y + chicken.height / 2 &&
			game.player.y + game.options.tileHeight / 2 > chicken.y) {
			game.knockPlayerBack();
			return true;
		}
	}
}

game.knockPlayerBack = function () {
	if (game.player.justHitByChicken) return;
	if (game.player.direction == "left") {
		game.player.x += 10;
	} else {
		game.player.x -= 10;
	}
	if (!game.checkCollisions()) {
		// Player should fall
		game.player.jump("fall")
	}
	var currentDirection = game.player.direction;
	game.player.direction = "stunned";
	game.player.justHitByChicken = true;
	setTimeout(function () {
		game.player.direction = currentDirection;
		game.player.justHitByChicken = false;
	}, game.challenges.chicken.stunDuration);
}
game.checkCollisionsLaser = function () {
	var laser = game.challenges.laser
	if (laser.spawned) {
		var playerBottom = game.player.y + game.options.canvasHeight / 2 + game.options.tileHeight / 2;
		var laserTop = laser.y;

		if (playerBottom > laserTop) {
			game.handleHitCollision("laser");
			return true;
		}
	}
}
game.handleHitCollision = function (type) {
	if (type == "laser") {
		game.isOver = true;
		return;
	};
	if (game.player.justHit) return;
	game.player.justHit = true;
	game.player.hp -= 10;
	game.player.hpElement.innerHTML = `HP: ${game.player.hp} hp`;
	game.player.hpElement.style.color = "red";


	setTimeout(function () {
		game.player.hpElement.style.color = "black";
		game.player.justHit = false;
	}, game.challenges.fireball.fireIntervalTime);


	if (game.player.hp <= 0) {
		game.isOver = true;
	}
}

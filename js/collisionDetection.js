// ... (previous code remains unchanged)

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
			game.player.x < fireball.x + fireball.width &&
			game.player.x + game.options.tileWidth > fireball.x &&
			game.player.y < fireball.y + fireball.height &&
			game.player.y + game.options.tileHeight > fireball.y
		) {

			game.handleHitCollision("ball");
			return true;
		}
	}
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
	if (type == "laser") game.isOver = true;
	if (game.player.justHit || !game.started) return;
	game.player.justHit = true;
	game.player.hp -= 10;
	game.player.hpElement.innerHTML = `HP: ${game.player.hp} hp`;
	game.player.hpElement.style.color = "red";


	setTimeout(function () {
		game.player.hpElement.style.color = "black";
		game.player.justHit = false;
	}, 3000);


	if (game.player.hp <= 0) {
		game.isOver = true;
	}
}

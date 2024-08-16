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
				game.player.y = Math.round(game.player.y / game.options.tileHeight) * game.options.tileHeight
				return true
			}
		}
	}

	return false
}
game.checkCollisionsBall = function (shield) {
	// Check collisions with fireballs
	for (var i = 0; i < game.challenges.fireball.fireballs.length; i++) {
		var fireball = game.challenges.fireball.fireballs[i];
		if (
			game.player.x + fireball.width < fireball.x + fireball.width * 2 &&
			game.player.x > fireball.x &&
			game.player.y - fireball.height < fireball.y + fireball.height / 2 &&
			game.player.y + game.options.tileHeight / 2 > fireball.y) {

			game.handleHitCollision("ball");
		}
		game.checkCircleRectangleCollision(shield, fireball);
	}
}


game.checkCollisionsChicken = function (shield) {
	// Check collisions with chickens
	for (var i = 0; i < game.challenges.chicken.chickens.length; i++) {
		var chicken = game.challenges.chicken.chickens[i];
		if (
			game.player.x + chicken.width < chicken.x + chicken.width * 2 &&
			game.player.x > chicken.x &&
			game.player.y - chicken.height < chicken.y + chicken.height / 2 &&
			game.player.y + game.options.tileHeight / 2 > chicken.y) {
			game.knockPlayerBack();
		}
		game.checkCircleRectangleCollision(shield, chicken);
	}
}

game.checkCollisionsBuff = function (buff) {
	for (var i = 0; i < buff.length; i++) {
		var buf = buff[i];
		if (
			game.player.x + buf.width / 2 < buf.x + buf.width * 2 &&
			game.player.x > buf.x - buf.width &&
			game.player.y - game.options.tileHeight / 2 < buf.y + buf.height &&
			game.player.y + game.options.tileHeight / 2 > buf.y) {
			game.buffReward(buf, i);
		}
	}
}

game.buffReward = function (buf, index) {
	var name = buf.name;
	switch (name) {
		case "hp":
			if (game.player.hp < 100) {
				game.player.hp += 10;
				game.player.hpElement.innerHTML = `HP: ${game.player.hp} hp`;
				game.player.hpElement.style.color = "green";
				game.buff.hp.hps.splice(index, 1);
				setTimeout(function () {
					if (game.buff.shield.isImmortal) return;
					game.player.hpElement.style.color = "black";
				}, 3000);
			}
			break;
		case "shield":
			game.buff.shield.active = true;
			game.buff.shield.shields.splice(index, 1);
			game.buff.hp.hpBorderColor = "yellow";
			break;
	}
}

game.knockPlayerBack = function () {
	if (game.player.justHitByChicken) return;
	if (game.buff.shield.isImmortal) return;
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
		if (game.buff.shield.isImmortal) return;
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
	if (game.buff.shield.isImmortal) return;
	if (game.player.justHit) return;
	game.player.justHit = true;
	game.player.hp -= 10;
	game.player.hpElement.innerHTML = `HP: ${game.player.hp} hp`;
	game.player.hpElement.style.color = "red";
	game.buff.hp.hpBorderColor = "yellow";

	if (game.challenges.fireball.fireTimeout) clearTimeout(game.challenges.fireball.fireTimeout);
	game.challenges.fireball.fireTimeout = setTimeout(function () {
		game.player.hpElement.style.color = "black";
		game.buff.hp.hpBorderColor = "black";
		game.player.justHit = false;
	}, game.challenges.fireball.fireTimeoutDuration);



	if (game.player.hp <= 0) {
		game.isOver = true;
	}
}

game.checkCircleRectangleCollision = function (circle, rectangle) {
	let closestX = Math.max(rectangle.x, Math.min(circle.x, rectangle.x + rectangle.width));
	let closestY = Math.max(rectangle.y, Math.min(circle.y, rectangle.y + rectangle.height));

	let distanceX = circle.x - closestX;
	let distanceY = circle.y - closestY;

	let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
	if (distanceSquared <= (circle.r * circle.r) > 0) {
		game.buff.shield.active = false;
		game.buff.shield.isImmortal = true;
		if (game.buff.shield.immortalTimeOut) clearTimeout(game.buff.shield.immortalTimeOut);
		game.buff.shield.immortalTimeOut = setTimeout(function () {
			game.buff.shield.isImmortal = false;
			game.buff.hp.hpBorderColor = "black";
		}, game.buff.shield.immortalTimeOutDuration);
	}
}

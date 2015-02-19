/**
* The PlayState in the core state that is used in the game.
*
* It is the state where majority of the functionality occurs 'in-game' occurs.
*
*/

PlayState = new Kiwi.State('PlayState');

// font size
PlayState.tileSize = 32;

// map dimensions
PlayState.mapSize = 20;

// number of actors per level, including player
PlayState.numberOfActors = 10;

// the structure of the map
PlayState.map;

// the sound?
PlayState.sound;

// is it a dungeon or forest map?
PlayState.isDungeon;

// is it a crypt map?
PlayState.isCrypt;

// the ascii display, as a 2d array of characters
PlayState.asciiMap;
// the graphical display, as a kiwi TileMap
PlayState.tileMap;

// a list of all actors, 0 is the player
PlayState.player;
PlayState.actorList;
PlayState.livingEnemies;

// a list of blood splats (dead enemies)
PlayState.splats;

// points to each actor in its position, for quick searching
PlayState.actorMap;

// loot and traps
PlayState.lootList;
PlayState.trapList;
PlayState.lootMap;
PlayState.trapMap;

// keyboard controls
PlayState.left;
PlayState.right;
PlayState.up;
PlayState.down;
PlayState.w;
PlayState.a;
PlayState.s;
PlayState.d;

// number of currently animating actors
PlayState.moving;

// hud widgets
PlayState.playerHp;
PlayState.playerSpeed;
PlayState.playerDamage;

// actor speed types
PlayState.Speeds= {
	SLOW : 1,
	NORMAL : 2,
	FAST : 3,
}

// loot types
PlayState.LootTypes = {
	WAND: 0,
	PICKAXE: 1,
	POTION: 2,
}

//  trap types
PlayState.TrapTypes = {
	SLOW: 0,
	HURT: 1,
}

// add a single cell in a given position to the ascii display
PlayState.initCell = function initCell(chr, x, y) {
	var text = new Kiwi.GameObjects.Textfield(this, chr, this.tileSize/2 + this.tileSize * x, this.tileSize * y, '#FFF', this.tileSize);
	text.textAlign = Kiwi.GameObjects.Textfield.TEXT_ALIGN_CENTER;
	this.addChild(text);
	text.visible = false;
	return text;
}

// set the x,y cell on the ascii screen
PlayState.setCell = function(x,y, cell) {
	PlayState.asciiMap[x][y].text = cell;
}

// the tile in position x,y in the map
PlayState.getTile = function(x,y) {
	return PlayState.map[x][y];
}
PlayState.setTile = function(x,y, t) {
	PlayState.map[x][y]=t;
}

PlayState.initMap = function () {

	this.isDungeon = false;
	this.isCrypt = false;

	// create a new random map
	var random_result = Math.random();

	if (random_result < 0.33) {
		this.isDungeon = true;
	}
	else
	{
		if (random_result < 0.66) {
			this.isCrypt = true;
		}
	}

	if(this.isDungeon) {
		this.map = Kiwi.Plugins.MapGenerator.dungeonMap(this.mapSize);
	} else if(this.isCrypt) {
		this.map = Kiwi.Plugins.MapGenerator.cryptMap(this.mapSize);
	} else {
		this.map = Kiwi.Plugins.MapGenerator.randomMap(this.mapSize);
	}

	// walkability map for the smart ai
	var walkable  = [];
	for (var x = 0; x < this.mapSize; x++) {
		var newRow = [];
		for (var y = 0; y < this.mapSize; y++) {
			if(this.getTile(x,y)=='.')
				newRow.push(1);
			else
				newRow.push(0);
		}
		walkable.push(newRow);
	}

	Kiwi.Plugins.AI.init(walkable, this.moveTo);
}

PlayState.drawMap = function () {
	// we redraw only the ascii map, the TileMap only needs to be drawn once
	for (var y = 0; y < this.mapSize; y++) {
		for (var x = 0; x < this.mapSize; x++) {
			this.setCell(x, y, this.getTile(x,y));
		}
	}
}

PlayState.randomInt = function(max) {
	return Math.floor(Math.random() * max);
}

// init all entities: actors, traps, loot, etc
PlayState.initEntities = function () {
	// create loot
	this.lootList = [];
	this.lootMap = {};

	for (var i = 0; i < 5; i++)
	{
		var item =
		{
			x: 0,
			y: 0,
		};

		var rand = Math.random();

		if(this.isDungeon)
		{
			if(rand<1/2) {
				item.type = this.LootTypes.WAND;
			} else {
				item.type = this.LootTypes.POTION;
			}
		}
		else if(this.isCrypt)
		{
			if(rand<1/2) {
				item.type = this.LootTypes.WAND;
			} else {
				item.type = this.LootTypes.POTION;
			}
		}
		else
		{
			if(rand<1/3) {
				item.type = this.LootTypes.WAND;
			} else if(rand<2/3) {
				item.type = this.LootTypes.PICKAXE;
			} else {
				item.type = this.LootTypes.POTION;
			}
		}


		do
		{
			// pick a random position that is both a floor and not occupied
			item.y = this.randomInt(this.mapSize);
			item.x = this.randomInt(this.mapSize);
		}
		while (this.getTile(item.x,item.y) != '.' || this.lootMap[item.x + "_" + item.y] != null);


		// add references to the actor to the loot list & map
		this.lootMap[item.x + "_" + item.y] = item;
		this.lootList.push(item);
	}

	// create traps
	this.trapList = [];
	this.trapMap = {};
	for (var t = 0; t < 2; t++) {
		var trap = {
			x: 0,
			y: 0,
		};
		var rand = Math.random();
		if(rand<1/2) {
			trap.type = this.TrapTypes.SLOW;
		} else {
			trap.type = this.TrapTypes.HURT;
		}
		do {
			// pick a random position that is both a floor and not occupied
			trap.y = this.randomInt(this.mapSize);
			trap.x = this.randomInt(this.mapSize);
		} while (this.getTile(trap.x,trap.y) != '.' || this.trapMap[trap.x + "_" + trap.y] != null);

		// add references to the actor to the trap list & map
		this.trapMap[trap.x + "_" + trap.y] = trap;
		this.trapList.push(trap);
	}

	// create actors at random locations
	this.actorList = [];
	this.actorMap = {};
	for (var e = 0; e < this.numberOfActors; e++) {
		// create new actor
		var actor = {
			x: 0,
			y: 0,
		};

		if(e == 0) {
			// player
			actor.isPlayer = true;
			actor.maxHp = actor.hp = 3;
			actor.damage = 1;
			actor.speed = this.Speeds.NORMAL;
			actor.xp = 0;
			actor.level = 0;
			actor.nextLevelAt = 4;
		} else {
			// enemies
			actor.isPlayer = false;
			actor.maxHp = actor.hp = 1;

			// let's make some simple, smart, boss and random enemies
			var rand = Math.random();

			if(this.isDungeon) {
				if(rand<1/4) {
					actor.ai = Kiwi.Plugins.AI.AiTypes.DWELLER;
					actor.speed = this.Speeds.NORMAL;
					actor.damage = 1;
				} else if(rand<2/4) {
					actor.ai = Kiwi.Plugins.AI.AiTypes.SMART;
					actor.speed = this.Speeds.SLOW;
					actor.damage = 2;
				} else if(rand<3/4) {
					actor.ai = Kiwi.Plugins.AI.AiTypes.BANDIT;
					actor.speed = this.Speeds.NORMAL;
					actor.damage = 1;
				} else {
					actor.ai = Kiwi.Plugins.AI.AiTypes.BOSS;
					actor.speed = this.Speeds.SLOW;
					actor.damage = 3;
				}
			} else if(this.isCrypt) {
				if(rand<1/4) {
					actor.ai = Kiwi.Plugins.AI.AiTypes.UNDEAD;
					actor.speed = this.Speeds.NORMAL;
					actor.damage = 1;
				} else if(rand<2/4) {
					actor.ai = Kiwi.Plugins.AI.AiTypes.VAMPIRE;
					actor.speed = this.Speeds.FAST;
					actor.damage = 2;
				} else if(rand<3/4) {
					actor.ai = Kiwi.Plugins.AI.AiTypes.GHOST;
					actor.speed = this.Speeds.NORMAL;
					actor.damage = 1;
				} else {
					actor.ai = Kiwi.Plugins.AI.AiTypes.BOSS;
					actor.speed = this.Speeds.SLOW;
					actor.damage = 3;
				}
			} else {
				if(rand<1/4) {
					actor.ai = Kiwi.Plugins.AI.AiTypes.SIMPLE;
					actor.speed = this.Speeds.NORMAL;
					actor.damage = 1;
				} else if(rand<2/4) {
					actor.ai = Kiwi.Plugins.AI.AiTypes.SMART;
					actor.speed = this.Speeds.SLOW;
					actor.damage = 2;
				} else if(rand<3/4) {
					actor.ai = Kiwi.Plugins.AI.AiTypes.RANDOM;
					actor.speed = this.Speeds.FAST;
					actor.damage = 1;
				} else {
					actor.ai = Kiwi.Plugins.AI.AiTypes.BOSS;
					actor.speed = this.Speeds.SLOW;
					actor.damage = 3;
				}
			}
		}

		do {
			// pick a random position that is both a floor and not occupied
			actor.y = this.randomInt(this.mapSize);
			actor.x = this.randomInt(this.mapSize);
		} while (this.getTile(actor.x,actor.y) != '.' || this.actorMap[actor.x + "_" + actor.y] != null || this.trapMap[actor.x + "_" + actor.y] != null || this.lootMap[actor.x + "_" + actor.y] != null);

		// add references to the actor to the actors list & map
		this.actorMap[actor.x + "_" + actor.y] = actor;
		this.actorList.push(actor);
	}

	// the this.player is the first actor in the list
	this.player = this.actorList[0];
	this.livingEnemies = this.numberOfActors - 1;
}

// init the sprites  we used the graphical mode for all entities: actors, traps, loot, etc
PlayState.initEntitySprites = function() {
	// loot
	for (var l = 0; l < 5; l++) {
		var loot = this.lootList[l];
		loot.sprite = new Kiwi.GameObjects.Sprite(this, this.textures.loot, loot.x*this.tileSize, loot.y*this.tileSize);

		// used the right sprite for each loot type
		if(loot.type == this.LootTypes.WAND){
			loot.sprite.cellIndex = 0;
		} else if(loot.type == this.LootTypes.PICKAXE){
			loot.sprite.cellIndex = 1;
		} else {
			loot.sprite.cellIndex = 2;
		}

		this.addChild(loot.sprite);
	}

	// traps
	for (var t = 0; t < 2; t++) {
		var trap = this.trapList[t];
		trap.sprite = new Kiwi.GameObjects.Sprite(this, this.textures.traps, trap.x*this.tileSize, trap.y*this.tileSize);

		// used the right sprite for each trap type
		if(trap.type == this.TrapTypes.SLOW){
			trap.sprite.cellIndex = 0;
		} else {
			trap.sprite.cellIndex = 1;
		}

		this.addChild(trap.sprite);
	}

	// actors
	for (var e = 0; e < this.numberOfActors; e++) {
		var actor = this.actorList[e];
		actor.sprite = new Kiwi.GameObjects.Sprite(this, this.textures.actors, actor.x*this.tileSize, actor.y*this.tileSize);

		// used the right sprite for each actor type
		if(actor.isPlayer) {
			// player sprite
			actor.sprite.cellIndex = 0;
		} else if(actor.ai == Kiwi.Plugins.AI.AiTypes.SIMPLE){
			// simple enemy
			// we have 3 soldier types just for visual varitey
			if(Math.random()<0.33) {
				actor.sprite.cellIndex = 1;
			} else if(Math.random()<0.66){
				actor.sprite.cellIndex = 6;
			} else {
				actor.sprite.cellIndex = 7;
			}
		} else if(actor.ai == Kiwi.Plugins.AI.AiTypes.BANDIT){
			// bandit enemy
			// we have 2 bandit types just for visual varitey
			if(Math.random()<0.5) {
				actor.sprite.cellIndex = 15;
			} else {
				actor.sprite.cellIndex = 16;
			}
		} else if(actor.ai == Kiwi.Plugins.AI.AiTypes.UNDEAD){
			// undead enemy
			// we have 3 undead types just for visual varitey
			if(Math.random()<0.33) {
				actor.sprite.cellIndex = 10;
			} else if(Math.random()<0.66){
				actor.sprite.cellIndex = 11;
			} else {
				actor.sprite.cellIndex = 12;
			}
		} else if(actor.ai == Kiwi.Plugins.AI.AiTypes.RANDOM){
			// random enemy
			// we have 2 jester types just for visual varitey
			if(Math.random()<0.5) {
				actor.sprite.cellIndex = 2;
			} else {
				actor.sprite.cellIndex = 5;
			}
		} else if(actor.ai == Kiwi.Plugins.AI.AiTypes.BOSS){
			// boss enemy
			actor.sprite.cellIndex = 8;
		} else if(actor.ai == Kiwi.Plugins.AI.AiTypes.DWELLER){
			// dweller enemy
			actor.sprite.cellIndex = 9;
		} else if(actor.ai == Kiwi.Plugins.AI.AiTypes.GHOST){
			// ghost enemy
			actor.sprite.cellIndex = 14;
		} else if(actor.ai == Kiwi.Plugins.AI.AiTypes.VAMPIRE){
			// vampire enemy
			actor.sprite.cellIndex = 13;
		} else {
			// smart enemy
			actor.sprite.cellIndex = 3;
		}

		this.addChild(actor.sprite);
	}

	// list of splat sprites (dead enemies)
	this.splats = [];
}

PlayState.moveEnded = function() {
	this.moving--;
}

// draw all entities: actors, traps, loot, etc on top of the ascii map
PlayState.drawEntities = function() {
	// draw loot
	for (var l in this.lootList) {
		if (this.lootList[l] != null) {
			var symbol = '';
			if(this.lootList[l].type == this.LootTypes.WAND){
				symbol = '|';
			} else if(this.lootList[l].type == this.LootTypes.PICKAXE) {
				symbol = '^';
			} else if(this.lootList[l].type == this.LootTypes.POTION)  {
				symbol = '%';
			}

			this.setCell(this.lootList[l].x, this.lootList[l].y, symbol);
		}
	}

	// draw traps
	for (var t in this.trapList) {
		if (this.trapList[t] != null) {
			var symbol = '';
			if(this.trapList[t].type == this.TrapTypes.SLOW){
				symbol = 'S';
			} else {
				symbol = 'H';
			}

			this.setCell(this.trapList[t].x, this.trapList[t].y, symbol);
		}
	}

	// draw actors
	for (var a in this.actorList) {
		if (this.actorList[a] != null && this.actorList[a].hp > 0) {
			// simple enemies: soldiers
			var symbol = 'f';
			if(a == 0){
				// for the player, show our hp as our symbol
				symbol = this.player.hp;
			} else if(this.actorList[a].ai == Kiwi.Plugins.AI.AiTypes.SMART) {
				// smart enemies: rogues
				symbol = 'r';
			} else if(this.actorList[a].ai == Kiwi.Plugins.AI.AiTypes.RANDOM)  {
				// random enemies: jesters
				symbol = 'j';
			} else if(this.actorList[a].ai == Kiwi.Plugins.AI.AiTypes.BOSS)  {
				// random enemies: bosses
				symbol = 'b';
			} else if(this.actorList[a].ai == Kiwi.Plugins.AI.AiTypes.UNDEAD)  {
				// random enemies: undead
				symbol = 'u';
			} else if(this.actorList[a].ai == Kiwi.Plugins.AI.AiTypes.VAMPIRE)  {
				// random enemies: vampire
				symbol = 'v';
			} else if(this.actorList[a].ai == Kiwi.Plugins.AI.AiTypes.BANDIT)  {
				// random enemies: bandit
				symbol = 'k';
			} else if(this.actorList[a].ai == Kiwi.Plugins.AI.AiTypes.GHOST)  {
				// random enemies: ghost
				symbol = 'g';
			} else if(this.actorList[a].ai == Kiwi.Plugins.AI.AiTypes.DWELLER)  {
				// random enemies: dweller
				symbol = 'd';
			}

			this.setCell(this.actorList[a].x, this.actorList[a].y, symbol);
		}
	}

	// move actor sprites in the tile map
	for (var a in this.actorList) {
		var actor = this.actorList[a];
		if	(actor!=null &&
			(actor.sprite.tween==null || !actor.sprite.tween.isRunning) &&
			(actor.sprite.x!=actor.x*this.tileSize || actor.sprite.y!=actor.y*this.tileSize) ) {

				this.moving++;
				actor.sprite.tween = this.game.tweens.create(actor.sprite);
				actor.sprite.tween.to({x:actor.x*this.tileSize, y:actor.y*this.tileSize}, 120, Kiwi.Animations.Tweens.Easing.Sinusoidal.InOut);
				actor.sprite.tween.onComplete(this.moveEnded, this);
				actor.sprite.tween.start();
		}
	}
}

PlayState.initScreen = function() {
	// init ascii map
	this.asciiMap = [];

	// init tile map
	this.tileMap = new Kiwi.GameObjects.Tilemap.TileMap(this);
	this.tileMap.setTo(this.tileSize,this.tileSize,this.mapSize,this.mapSize);

	// we have 8 types of tiles in our tile map
	for(var t=0; t<=8; t++) {
		this.tileMap.createTileType(t);
	}

	// new layer for the map itself
	var mapLayer = this.tileMap.createNewLayer('map', this.textures.tiles);
	this.addChild(mapLayer);

	for (var x = 0; x < this.mapSize; x++) {
		var newRow = [];
		this.asciiMap.push(newRow);
		for (var y = 0; y < this.mapSize; y++) {
			// add empty cell to ascii map
			newRow.push(this.initCell('', x, y));

			/*
			 * we don't need to redraw the TileMap every turn like the ascii map,
			 * instead we draw it once at initialization
			 */
			 var tile = this.getTile(x,y);
			if(this.isDungeon) {
				if(tile=='.') {
					mapLayer.setTile(x,y,4+1);
				} else if (tile=='#') {
					// we have 2 stone wall types just for visual varitey
					if(Math.random()<0.5) {
						mapLayer.setTile(x,y,5+1);
					} else {
						mapLayer.setTile(x,y,7+1);
					}
				}
			} else if(this.isCrypt) {
				if(tile=='.') {
					mapLayer.setTile(x,y,4+1);
				} else if (tile=='#') {
					// we have 2 stone wall types just for visual varitey
					if(Math.random()<0.5) {
						mapLayer.setTile(x,y,5+1);
					} else {
						mapLayer.setTile(x,y,7+1);
					}
				}
			} else {
				if(tile=='.') {
					mapLayer.setTile(x,y,0+1);
				} else {
					// we have 2 tree types just for visual varitey
					if(Math.random()<0.5) {
						mapLayer.setTile(x,y,1+1);
					} else {
						mapLayer.setTile(x,y,2+1);
					}
				}
			}
		}
	}
}

PlayState.create = function (params) {
	this.resetting = false;

	// resize the game stage to the correct size (add space for the GUI)
	game.stage.resize(this.mapSize * this.tileSize + 140, this.mapSize * this.tileSize);
	this.moving = 0;
	this.alive = true;

	// init keyboard commands
	this.left = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.LEFT);
	this.right = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.RIGHT);
	this.up = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.UP);
	this.down = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.DOWN);
	this.a= this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.A);
	this.d= this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.D);
	this.w = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.W);
	this.s= this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.S);

	// init mouse controls
	this.game.input.onUp.add(this.onTap, this);

	// initialize map, screen & actors
	this.initMap();
	this.initSound();
	this.initScreen();
	this.initEntities();
	this.initEntitySprites();

	// draw level
	this.drawMap();
	this.drawEntities();


	// create the 'reset' button, to generate new random map
    this.resetButton = new Kiwi.GameObjects.Sprite(this, this.textures.randomBtn, this.tileSize*this.mapSize+10, 0);
	this.resetButton.cellIndex = 1;
    this.addChild(this.resetButton);
    this.resetButton.input.onUp.add(this.reset, this);

	// create a graphics/ascii toggle button
	this.graphicsButton = new Kiwi.GameObjects.Sprite(this, this.textures.toggleBtn, this.tileSize*this.mapSize+10, 110);
	this.graphicsButton.cellIndex = 1;
    this.addChild(this.graphicsButton);
    this.graphicsButton.input.onDown.add(this.toggleGraphics, this);


	// create hud widgets
	this.playerHp = new Kiwi.HUD.Widget.IconBar(this.game, this.textures.heart,
			this.player.hp, this.player.hp, 340 , 114);
	this.playerSpeed = new Kiwi.HUD.Widget.IconBar(this.game, this.textures.speed,
			this.player.speed, this.player.speed, 340 , 130);
	this.playerDamage = new Kiwi.HUD.Widget.IconBar(this.game, this.textures.sword,
			this.player.damage, this.player.damage, 340 , 146);
	this.playerXp = new Kiwi.HUD.Widget.Bar(this.game,
			0, this.player.nextLevelAt, 650 , 330,
			120, 20, '#FF8040');

	this.game.huds.defaultHUD.addWidget(this.playerHp);
	this.game.huds.defaultHUD.addWidget(this.playerSpeed);
	this.game.huds.defaultHUD.addWidget(this.playerDamage);
	this.game.huds.defaultHUD.addWidget(this.playerXp);

	this.swordStrike = new Kiwi.Sound.Audio(this.game, 'swordStrike', 0.3, false);
	this.boltStrike = new Kiwi.Sound.Audio(this.game, 'boltStrike', 0.3, false);

}


PlayState.canGo = function canGo(actor,dir) {
	if(actor.ai == Kiwi.Plugins.AI.AiTypes.GHOST) {
		return 	actor.x+dir.x >= 0 ||
				actor.x+dir.x <= 0 &&
				actor.x+dir.x <= this.mapSize - 1 &&
				actor.y+dir.y >= 0 ||
				actor.y+dir.y <= 0 &&
				actor.y+dir.y <= this.mapSize - 1 &&
				this.getTile(actor.x +dir.x, actor.y+dir.y) == '.';
		} else {
		return 	actor.x+dir.x >= 0 &&
				actor.x+dir.x <= this.mapSize - 1 &&
				actor.y+dir.y >= 0 &&
				actor.y+dir.y <= this.mapSize - 1 &&
				this.getTile(actor.x +dir.x, actor.y+dir.y) == '.';
		}
}


PlayState.tryToDig = function(actor, dir) {
	var destX = actor.x+dir.x;
	var destY = actor.y+dir.y;

	// don't go out of bounds
	if (destX < 0 ||
		destX > this.mapSize - 1 ||
		destY < 0 ||
		destY > this.mapSize - 1 ) {

			return false;
	}

	// dig into the wall
	this.setCell(destX, destY, '.');
	this.setTile(destX, destY, '.');
	var mapLayer = this.tileMap.layers[0];
	if(this.isDungeon) {
		mapLayer.setTile(destX,destY,4+1);
	} else if(this.isCrypt) {
		mapLayer.setTile(destX,destY,4+1);
	} else {
		mapLayer.setTile(destX,destY,0+1);
	}

	return true;
}

PlayState.moveTo = function(actor, dir) {
	// we call this function from the AI plugin context
	var self = PlayState;

	// check if actor can move in the given direction
	if (!self.canGo(actor,dir)) {
		if(actor.pickaxe==null) {
			return false;
		} else {
			return this.tryToDig(actor,dir);
		}
	}

	// moves actor to the new location
	var newKey = (actor.x + dir.x) +'_' + (actor.y + dir.y);
	// if the destination tile has an actor in it
	if (self.actorMap[newKey] != null) {
		//decrement hitpoints of the actor at the destination tile
		var victim = self.actorMap[newKey];

		if(!actor.isPlayer && !victim.isPlayer) {
			// do nothing instead of attacking other enemies
			return true;
		}

		victim.hp -= actor.damage;
		if(victim.isPlayer) {
			self.playerHp.counter.current=Math.max(0, victim.hp);
		}

		self.cleanUpDeadActor(victim);
	} else {
		// remove reference to the actor's old position
		self.actorMap[actor.x + '_' + actor.y]= null;

		// update position
		actor.y+=dir.y;
		actor.x+=dir.x;

		// add reference to the actor's new position
		self.actorMap[actor.x + '_' + actor.y]=actor;

		// pick up loot
		var loot = self.lootMap[actor.x + '_' + actor.y];
		if(loot!=null && actor.isPlayer) {
			// remove picked up loot from the map
			self.lootMap[actor.x + '_' + actor.y] = null;
			self.lootList[self.lootList.indexOf(loot)]=null;
			self.removeChild(loot.sprite);

			// apply effects of loot
			self.pickUpLoot(loot, actor);
		}

		// trigger trap
		var trap = self.trapMap[actor.x + '_' + actor.y];
		if(trap!=null && actor.isPlayer) {
			// remove triggered trap from the map
			self.trapMap[actor.x + '_' + actor.y] = null;
			self.trapList[self.trapList.indexOf(trap)]=null;
			self.removeChild(trap.sprite);

			// apply effects of trap to the actor that triggered it
			self.triggerTrap(trap, actor);
		}
	}

	// did the player die during self move?
	if (self.player.hp < 1 && self.alive) {
		self.alive = false;
		// game over message
		var text = new Kiwi.GameObjects.Textfield (self, 'You Died', self.mapSize*self.tileSize/2, 130, '#e22', self.tileSize*1.5);
		text.textAlign = Kiwi.GameObjects.Textfield.TEXT_ALIGN_CENTER;
		self.addChild(text);
		text = new Kiwi.GameObjects.Textfield (self, 'Click to restart', self.mapSize*self.tileSize/2, 180, '#e22', self.tileSize);
		text.textAlign = Kiwi.GameObjects.Textfield.TEXT_ALIGN_CENTER;
		self.addChild(text);
	}

	return true;
}

PlayState.cleanUpDeadActor = function(victim) {
	// we call this function from the AI plugin context
	var self = PlayState;

	// if it's dead remove its reference
	if (victim.hp <= 0) {
		self.actorMap[victim.x +'_' + victim.y] = null;
		self.actorList[self.actorList.indexOf(victim)]=null;

				//Uncommenting this gives me the wierdest bug I have /ever seen/ (Mentioned said bug in email to Dan)
		        if(this.backgroundMusic.isPlaying){
					this.swordStrike.stop();
					this.swordStrike.play();
					}

//Doesn't work, keeping it around for when I -can- make it work
//				if (wasShot == true) {
//					this.swordStrike.stop();
//					this.boltStrike.stop();
//					this.boltStrike.play();
//				} else {
//					this.swordStrike.stop();
//					this.swordStrike.play();
//					}

		// splat
		victim.sprite.cellIndex = 4;
		victim.sprite.x = victim.x * self.tileSize;
		victim.sprite.y = victim.y * self.tileSize;

		// render the splat below the other actors
		if(victim!=self.player) {
			self.removeChild(victim.sprite);
			self.addChildBefore(victim.sprite, self.player.sprite);
		}

		// save splat sprites for ascii/graphics toggle
		self.splats.push(victim.sprite);

		if(victim!=self.player) {
			self.livingEnemies--;
			if (self.livingEnemies == 0) {
				self.alive = false;

				// victory message
				var text = new Kiwi.GameObjects.Textfield (self, 'Victory!', self.mapSize*self.tileSize/2, 130, '#2e2', self.tileSize*1.5);
				text.textAlign = Kiwi.GameObjects.Textfield.TEXT_ALIGN_CENTER;
				self.addChild(text);
				text = new Kiwi.GameObjects.Textfield (self, 'Click to restart', self.mapSize*self.tileSize/2, 180, '#2e2', self.tileSize);
				text.textAlign = Kiwi.GameObjects.Textfield.TEXT_ALIGN_CENTER;
				self.addChild(text);
			}

			// get xp
			self.player.xp++;
			if(self.player.nextLevelAt==self.player.xp) {
				// level up! we heal the player & increase their max-hp
				self.player.maxHp++;
				self.player.hp = self.player.maxHp;
				this.game.huds.defaultHUD.removeWidget(self.playerHp);
				self.playerHp = new Kiwi.HUD.Widget.IconBar(this.game, this.textures.heart,
					this.player.hp, this.player.hp, 340 , 114);
				this.game.huds.defaultHUD.addWidget(this.playerHp);

				// it takes double the xp to reach the next level
				self.player.xp = 0;
				self.player.nextLevelAt *= 2;

				// new xp bar
				this.game.huds.defaultHUD.removeWidget(this.playerXp);
				this.playerXp = new Kiwi.HUD.Widget.Bar(this.game,
					0, this.player.nextLevelAt, 650 , 330,
					120, 20, '#FF8040');

				this.game.huds.defaultHUD.addWidget(this.playerXp);
			}

			this.playerXp.counter.current = self.player.xp;
		}
	}
}

// apply effects of picked up loot
PlayState.pickUpLoot =  function(loot, picker) {
	var self = PlayState;

	if(loot.type==self.LootTypes.POTION) {
		// heal
		picker.hp = picker.maxHp;
		if(picker.isPlayer) {
			self.playerHp.counter.current=Math.max(0, picker.hp);
		}

	} else if(loot.type==self.LootTypes.PICKAXE) {
		// enable digging
		picker.pickaxe = loot.sprite;
		picker.pickaxe.x = self.mapSize*self.tileSize + 10;
		picker.pickaxe.y = 416;
		if(picker.isPlayer) {
			this.addChild(picker.pickaxe);
		}

	} else if(loot.type==self.LootTypes.WAND) {
		// get 4 magic missle shots
		picker.shots = 4;
		picker.shotsBar = new Kiwi.HUD.Widget.IconBar(this.game, this.textures.shot,
			picker.shots, picker.shots, 340 , 224);
		this.game.huds.defaultHUD.addWidget(picker.shotsBar);
	}
}

// apply effects of trap to the actor that triggered it
PlayState.triggerTrap = function(trap, victim) {
	var self = PlayState;

	if(trap.type==self.TrapTypes.HURT) {
		victim.hp--;
		if(victim.isPlayer) {
			self.playerHp.counter.current=Math.max(0, victim.hp);
		}
		self.cleanUpDeadActor(victim);

	} else if(trap.type==self.TrapTypes.SLOW) {
		victim.speed = self.Speeds.SLOW;
		if(victim.isPlayer) {
			this.playerSpeed.counter.current = victim.speed;
		}
	}

}

// Start playing the music loop
PlayState.initSound = function () {
    this.backgroundMusic = new Kiwi.Sound.Audio(this.game, 'loop', 0.3, true);
    this.backgroundMusic.play();
}

PlayState.enemiesTurn = function() {
	for (var enemy in this.actorList) {
		// skip the this.player
		if(enemy==0)
			continue;

		var e = this.actorList[enemy];
		if (e != null) {
			// we used actNext for enemies that act every other turn
			if(e.actNext==undefined) {
				e.actNext=false;
			}

			// speed difference between player and enemy - we only care about faster or slower
			if(this.player.speed>e.speed) {
				// enemy acts every other turn
				if(e.actNext)
					Kiwi.Plugins.AI.aiAct(e, this.player);
				e.actNext = !e.actNext;

			} else if(this.player.speed < e.speed) {
				// enemy acts twice per turn
				Kiwi.Plugins.AI.aiAct(e, this.player);
				Kiwi.Plugins.AI.aiAct(e, this.player);

			} else {
				// enemey acts once per turn
				Kiwi.Plugins.AI.aiAct(e, this.player);
			}
		}
	}
}

// shoot from origin to target
PlayState.shoot = function(origin, target, isWallBlocking, isActorBlocking, hitWall, hitActor) {

	// find out what we hit
	var curr = Kiwi.Plugins.Trajectory.shoot(origin, target, isWallBlocking, isActorBlocking, hitWall, hitActor);


	// shooting animation
	var bolt = new Kiwi.GameObjects.Sprite(this, this.textures.shot, origin.x*this.tileSize, origin.y*this.tileSize);
	this.addChild(bolt);

	var boltTween = this.game.tweens.create(bolt);
	boltTween.to({x:curr.x*this.tileSize, y:curr.y*this.tileSize}, 60, Kiwi.Animations.Tweens.Easing.Sinusoidal.InOut);
	boltTween.onComplete(function(){this.removeChild(bolt);}, this);
	boltTween.start();

}

// process mouse/touch input, called by onTap()
PlayState.processMouseInput = function(x,y) {
	if(this.moving>0) {
		// don't move while sprites are still animating
		return false;
	}

	// calcualte which tile the user tapped
	var tileX = Math.floor(x/this.tileSize);
	var tileY = Math.floor(y/this.tileSize);

	// decide if we're walking in this direction or shooting at enemy on this tile
	var shooting = false;

	// do we have shots left, and tapped on an enemy?
	if(this.player.shots!=undefined && this.player.shots>0) {
		var actor = this.actorMap[tileX +"_"+tileY];
		if(actor != null && !actor.isPlayer) {
			shooting = true;
			this.player.shots--;
			this.player.shotsBar.counter.current=this.player.shots;
		}
	}

	if(shooting) {
		var isWallBlocking = function(currTileX, currTileY){
			// is there a wall here?
			return PlayState.getTile(currTileX, currTileY)!='.';
		};
		var isActorBlocking = function(currTileX, currTileY){
			// is there an actor here?
			return PlayState.actorMap[currTileX+"_"+currTileY]!=null;
		};
		var hitWall = function(currTileX, currTileY){
			// do nothing when shot hits the wall
		};
		var hitActor = function(currTileX, currTileY){
			// kill actor if shot hits them
			var wasShot = true;
			var victim = PlayState.actorMap[currTileX+"_"+currTileY];
			victim.hp--;
			if(victim.isPlayer) {
				PlayState.playerHp.counter.current=Math.max(0, victim.hp);
			}
			PlayState.cleanUpDeadActor(victim);
		};

		// shoot
		this.shoot({x:this.player.x,y:this.player.y}, {x:tileX,y:tileY}, isWallBlocking, isActorBlocking, hitWall, hitActor);

	} else {
		// decide direction according to location relative to player
		var dir = {x:0, y:0};
		var dx = tileX - this.player.x;
		var dy = tileY - this.player.y;
		if(Math.abs(dx)> Math.abs(dy)) {
			// move in x axis
			if(dx<0) {
				dir.x = -1;
			} else {
				dir.x = 1;
			}
		} else {
			// move in y axis
			if(dy<0) {
				dir.y = -1;
			} else {
				dir.y = 1;
			}
		}

		// return whether the move succeed
		return this.moveTo(this.player, dir);
	}
}

// prcess keyboard input, called by update()
PlayState.processKeyboardInput = function() {
	if(this.moving>0) {
		// don't move while sprites are still animating
		return false;
	}

	var acted = false;

	// act at key-down. because of the animation check this doesn't trigger multiple moves
	if (this.left.isDown || this.a.isDown){
		acted = this.moveTo(this.player, {x:-1, y:0});
	} else if (this.right.isDown || this.d.isDown){
		acted = this.moveTo(this.player,{x:1, y:0});
	} else if (this.up.isDown || this.w.isDown){
		acted = this.moveTo(this.player, {x:0, y:-1});
	} else if (this.down.isDown || this.s.isDown){
		acted = this.moveTo(this.player, {x:0, y:1});
	}

	return acted;
}

// called by kiwi in a regular interval
PlayState.update= function () {
	if(this.resetting) {
		return;
	}

	try {
		Kiwi.State.prototype.update.call(this);

		// draw map to overwrite previous actors positions
		this.drawMap();

		if(this.alive) {
			// act on player input
			var acted = this.processKeyboardInput();

			// enemies act every time the this.player does
			if (acted)
				this.enemiesTurn();
		}

		// draw actors in new positions
		this.drawEntities();
	} catch(err){

	}
}

// called by kiwi upon mouse/touch events
PlayState.onTap = function (x,y) {
	if(this.resetting || x>this.mapSize*this.tileSize) {
		return;
	}

	if(!this.alive) {
		this.reset();
		return;
	}

	// draw map to overwrite previous actors positions
	this.drawMap();

	if(this.alive) {
		// act on player input
		var acted = this.processMouseInput(x,y);

		// enemies act every time the player does
		if (acted)
			this.enemiesTurn();
	}

	// draw actors in new positions
	this.drawEntities();
}

PlayState.toggleGraphics = function() {
	if(this.graphicsButton.cellIndex == 1) {
		// move to ascii
		this.graphicsButton.cellIndex = 0;

		// ascii visible
		for (var x = 0; x < this.mapSize; x++) {
			for (var y = 0; y < this.mapSize; y++) {
				PlayState.asciiMap[x][y].visible = true;
			}
		}

		// graphics invisible
		this.tileMap.layers[0].visible = false;
		// actors
		for (var e = 0; e < this.numberOfActors; e++) {
			if(this.actorList[e]!=null) {
				this.actorList[e].sprite.visible = false;
			}
		}
		// splats
		for (var s=0; s < this.splats.length; s++) {
			this.splats[s].visible = false;
		}
		// loot
		for (var l=0; l < this.lootList.length; l++) {
			if(this.lootList[l]!=null) {
				this.lootList[l].sprite.visible = false;
			}
		}
		// traps
		for (var t=0; t < this.trapList.length; t++) {
			if(this.trapList[t]!=null) {
				this.trapList[t].sprite.visible = false;
			}
		}

	} else {
		// move to graphics
		this.graphicsButton.cellIndex = 1;

		// ascii invisible
		for (var x = 0; x < this.mapSize; x++) {
			for (var y = 0; y < this.mapSize; y++) {
				PlayState.asciiMap[x][y].visible = false;
			}
		}

		// graphics visible
		this.tileMap.layers[0].visible = true;
		// actors
		for (var e = 0; e < this.numberOfActors; e++) {
			if(this.actorList[e]!=null) {
				this.actorList[e].sprite.visible = true;
			}
		}
		// splats
		for (var s=0; s < this.splats.length; s++) {
			this.splats[s].visible = true;
		}
		// loot
		for (var l=0; l < this.lootList.length; l++) {
			if(this.lootList[l]!=null) {
				this.lootList[l].sprite.visible = true;
			}
		}
		// traps
		for (var t=0; t < this.trapList.length; t++) {
			if(this.trapList[t]!=null) {
				this.trapList[t].sprite.visible = true;
			}
		}
	}
}

PlayState.reset = function(){
	this.resetting = true;
	this.game.tweens.removeAll();

	this.playerHp.counter.current = 0;
	this.playerXp.counter.current = 0;
	this.playerSpeed.counter.current = 0;
	this.playerDamage.counter.current = 0;
	if(this.player.shotsBar!=undefined) {
		this.player.shotsBar.counter.current = 0;
	}

	this.map = null;
	this.isDungeon = null;
	this.isCrypt = null;
	this.asciiMap = null;
	this.tileMap = null;
	this.player = null;
	this.actorList = null;
	this.livingEnemies = null;
	this.actorMap = null;
	this.lootList = null;
	this.trapList = null;
	this.lootMap = null;
	this.trapMap = null;
	this.left = null;
	this.right = null;
	this.up = null;
	this.down = null;
	this.w = null;
	this.a = null;
	this.s = null;
	this.d = null;
	this.moving = false;

	this.game.states.switchState("IntroState");
}
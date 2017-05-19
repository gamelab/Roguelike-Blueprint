Kiwi.Plugins.AI = {
	name:'AI',
	version:'1.0.0',
	walkabilityMap: null,
};

// types of AI for the enemies
Kiwi.Plugins.AI.AiTypes = {
	SIMPLE : 0,
	SMART : 1,
	RANDOM : 2,
	BOSS : 3,
	DWELLER : 4,
	UNDEAD : 5,
	VAMPIRE : 6,
	GHOST : 7,
	TREANT : 8,
}

Kiwi.Plugins.AI.init = function(walkable, moveToCallback){
	// prepare the walkability map for the smart path-finding
	this.walkabilityMap = new Kiwi.Plugins.PathFinding.Graph(walkable);

	// called when the ai tries to make an actor move
	this.moveTo = moveToCallback;
}

Kiwi.Plugins.AI.randomAiAct = function(actor, target) {
	var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 } ];

	// try to walk in random directions until you succeed once
	var dir = null;
	var tries = 100;
	do {
		dir = directions[this.randomInt(directions.length)];
		tries--;
	} while (!this.moveTo(actor, dir) && tries>0);
}

Kiwi.Plugins.AI.dwellerAiAct = function(actor, target) {
	var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 } ];

	// try to walk in random directions until you succeed once
	var dir = null;
	var tries = 100;
	do {
		dir = directions[this.randomInt(directions.length)];
		tries--;
	} while (!this.moveTo(actor, dir) && tries>0);
}

Kiwi.Plugins.AI.undeadAiAct = function(actor, target) {
	var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 } ];
	var dx = target.x - actor.x;
	var dy = target.y - actor.y;

	// walk towards player, disregarding obstacles
	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx < 0) {
			// left
			this.moveTo(actor, directions[0]);
		} else {
			// right
			this.moveTo(actor, directions[1]);
		}
	} else {
		if (dy < 0) {
			// up
			this.moveTo(actor, directions[2]);
		} else {
			// down
			this.moveTo(actor, directions[3]);
		}
	}
}

Kiwi.Plugins.AI.ghostAiAct = function(actor, target) {
	var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 } ];
	var dx = target.x - actor.x;
	var dy = target.y - actor.y;

	// walk towards player, disregarding obstacles
	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx < 0) {
			// left
			this.moveTo(actor, directions[0]);
		} else {
			// right
			this.moveTo(actor, directions[1]);
		}
	} else {
		if (dy < 0) {
			// up
			this.moveTo(actor, directions[2]);
		} else {
			// down
			this.moveTo(actor, directions[3]);
		}
	}
}

Kiwi.Plugins.AI.treantAiAct = function(actor, target) {
	var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 } ];
	var dx = target.x - actor.x;
	var dy = target.y - actor.y;

	// walk towards player, disregarding obstacles
	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx < 0) {
			// left
			this.moveTo(actor, directions[0]);
		} else {
			// right
			this.moveTo(actor, directions[1]);
		}
	} else {
		if (dy < 0) {
			// up
			this.moveTo(actor, directions[2]);
		} else {
			// down
			this.moveTo(actor, directions[3]);
		}
	}
}

Kiwi.Plugins.AI.simpleAiAct = function(actor, target) {
	var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 } ];
	var dx = target.x - actor.x;
	var dy = target.y - actor.y;

	// walk towards player, disregarding obstacles
	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx < 0) {
			// left
			this.moveTo(actor, directions[0]);
		} else {
			// right
			this.moveTo(actor, directions[1]);
		}
	} else {
		if (dy < 0) {
			// up
			this.moveTo(actor, directions[2]);
		} else {
			// down
			this.moveTo(actor, directions[3]);
		}
	}
}

Kiwi.Plugins.AI.banditAiAct = function(actor, target) {
	var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 } ];
	var dx = target.x - actor.x;
	var dy = target.y - actor.y;

	// walk towards player, disregarding obstacles
	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx < 0) {
			// left
			this.moveTo(actor, directions[0]);
		} else {
			// right
			this.moveTo(actor, directions[1]);
		}
	} else {
		if (dy < 0) {
			// up
			this.moveTo(actor, directions[2]);
		} else {
			// down
			this.moveTo(actor, directions[3]);
		}
	}
}

Kiwi.Plugins.AI.smartAiAct = function(actor, target) {
	var start = this.walkabilityMap.nodes[actor.x][actor.y];
	var end = this.walkabilityMap.nodes[target.x][target.y];
	var result = Kiwi.Plugins.PathFinding.astar.search(this.walkabilityMap.nodes, start, end);

	if(result.length==0) {
		// no path to player
		return;
	}

	var dir = { x: result[0].x-actor.x, y: result[0].y-actor.y};
	this.moveTo(actor, dir);
}

Kiwi.Plugins.AI.vampireAiAct = function(actor, target) {
	var start = this.walkabilityMap.nodes[actor.x][actor.y];
	var end = this.walkabilityMap.nodes[target.x][target.y];
	var result = Kiwi.Plugins.PathFinding.astar.search(this.walkabilityMap.nodes, start, end);

	if(result.length==0) {
		// no path to player
		return;
	}

	var dir = { x: result[0].x-actor.x, y: result[0].y-actor.y};
	this.moveTo(actor, dir);
}

Kiwi.Plugins.AI.bossAiAct = function(actor, target) {
	var start = this.walkabilityMap.nodes[actor.x][actor.y];
	var end = this.walkabilityMap.nodes[target.x][target.y];
	var result = Kiwi.Plugins.PathFinding.astar.search(this.walkabilityMap.nodes, start, end);

	if(result.length==0) {
		// no path to player
		return;
	}

	var dir = { x: result[0].x-actor.x, y: result[0].y-actor.y};
	this.moveTo(actor, dir);
}

Kiwi.Plugins.AI.aiAct = function(actor, target) {
	switch(actor.ai) {
		case this.AiTypes.SIMPLE:
			this.simpleAiAct(actor, target);
			break;

		case this.AiTypes.SMART:
			this.smartAiAct(actor, target);
			break;

		case this.AiTypes.RANDOM:
			this.randomAiAct(actor, target);
			break;

		case this.AiTypes.DWELLER:
			this.dwellerAiAct(actor, target);
			break;

		case this.AiTypes.UNDEAD:
			this.undeadAiAct(actor, target);
			break;

		case this.AiTypes.BANDIT:
			this.banditAiAct(actor, target);
			break;

		case this.AiTypes.VAMPIRE:
			this.vampireAiAct(actor, target);
			break;

		case this.AiTypes.GHOST:
			this.ghostAiAct(actor, target);
			break;

		case this.AiTypes.TREANT:
			this.treantAiAct(actor, target);
			break;

		case this.AiTypes.BOSS:
			this.bossAiAct(actor, target);
			break;
	}
}

Kiwi.Plugins.AI.randomInt = function(max) {
	return Math.floor(Math.random() * max);
}

Kiwi.PluginManager.register(Kiwi.Plugins.AI);
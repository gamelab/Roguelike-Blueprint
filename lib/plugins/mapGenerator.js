/*
 * original dungeon-generator tutorial at
 * http://bigbadwofl.me/random-dungeon-generator/
 *
 * use the randomMap and dungeonMap functions to get forest and dungeon level respectively
 */


Kiwi.Plugins.MapGenerator = {
	name:'MapGenerator',
	version:'1.0.0',

	map: [],
	map_size: 0,
	rooms: [],
}

// simplest possible map generator - randomly place walls and floors. good for forest maps
Kiwi.Plugins.MapGenerator.randomMap = function(mapSize) {
	var map = [];
	for (var x = 0; x < mapSize; x++) {
		var newRow = [];
		for (var y = 0; y < mapSize; y++) {
			if (Math.random() > 0.8)
				newRow.push('#');
			else
				newRow.push('.');
		}
		map.push(newRow);
	}

	return map;
}

// traditional dungeon levels with rooms and corridors.
Kiwi.Plugins.MapGenerator.dungeonMap = function(mapSize) {
	var dungeon = this.GenerateDungeon(Math.min(mapSize,mapSize),7, 10, 3, 6);
	var map = [];
	for (var x = 0; x < mapSize; x++) {
		var newRow = [];
		for (var y = 0; y < mapSize; y++) {
			if (dungeon.map[x][y]==0) {
				// area outside the dungeon
				newRow.push(' ');
			} else if(dungeon.map[x][y]==1) {
				// floor
				newRow.push('.');
			} else {
				// walls
				newRow.push('#');
			}
		}
		map.push(newRow);
	}
	return map;
}

Kiwi.Plugins.MapGenerator.GenerateDungeon = function (mapSize, minRooms, maxRooms, minRoomSize, maxRoomSize) {
	this.map = [];
	this.rooms = [];

	// we pad the size of the generated dungeon a bit (+3)
	// because the generator require some extra space to work with
	this.map_size = mapSize+3;

	for (var x = 0; x < this.map_size; x++) {
		this.map[x] = [];
		for (var y = 0; y < this.map_size; y++) {
			this.map[x][y] = 0;
		}
	}

	var room_count = Kiwi.Plugins.MapGenerator.GetRandom(minRooms, maxRooms);
	var min_size = minRoomSize;
	var max_size = maxRoomSize;

	for (var i = 0; i < room_count; i++) {
		var room = {};

		room.x = Kiwi.Plugins.MapGenerator.GetRandom(1, this.map_size - max_size - 1);
		room.y = Kiwi.Plugins.MapGenerator.GetRandom(1, this.map_size - max_size - 1);
		room.w = Kiwi.Plugins.MapGenerator.GetRandom(min_size, max_size);
		room.h = Kiwi.Plugins.MapGenerator.GetRandom(min_size, max_size);

		if (this.DoesCollide(room)) {
			i--;
			continue;
		}
		room.w--;
		room.h--;

		this.rooms.push(room);
	}

	this.SquashRooms();

	for (i = 0; i < room_count; i++) {
		var roomA = this.rooms[i];
		var roomB = this.FindClosestRoom(roomA);

		pointA = {
			x: Kiwi.Plugins.MapGenerator.GetRandom(roomA.x, roomA.x + roomA.w),
			y: Kiwi.Plugins.MapGenerator.GetRandom(roomA.y, roomA.y + roomA.h)
		};
		pointB = {
			x: Kiwi.Plugins.MapGenerator.GetRandom(roomB.x, roomB.x + roomB.w),
			y: Kiwi.Plugins.MapGenerator.GetRandom(roomB.y, roomB.y + roomB.h)
		};

		while ((pointB.x != pointA.x) || (pointB.y != pointA.y)) {
			if (pointB.x != pointA.x) {
				if (pointB.x > pointA.x) pointB.x--;
				else pointB.x++;
			} else if (pointB.y != pointA.y) {
				if (pointB.y > pointA.y) pointB.y--;
				else pointB.y++;
			}

			this.map[pointB.x][pointB.y] = 1;
		}
	}

	for (i = 0; i < room_count; i++) {
		var room = this.rooms[i];
		for (var x = room.x; x < room.x + room.w; x++) {
			for (var y = room.y; y < room.y + room.h; y++) {
				this.map[x][y] = 1;
			}
		}
	}

	for (var x = 0; x < this.map_size; x++) {
		for (var y = 0; y < this.map_size; y++) {
			if (this.map[x][y] == 1) {
				for (var xx = x - 1; xx <= x + 1; xx++) {
					for (var yy = y - 1; yy <= y + 1; yy++) {
						if (this.map[xx][yy] == 0) this.map[xx][yy] = 2;
					}
				}
			}
		}
	}

	// check connectivity
	if(!this.checkConnectivity(this.map, this.map_size, 1)) {
		this.GenerateDungeon(mapSize, minRooms, maxRooms, minRoomSize, maxRoomSize);
	}

	return this;
}

// Secondary dungeon-type map, a crypt
Kiwi.Plugins.MapGenerator.cryptMap = function(mapSize) {
	var crypt = this.GenerateCrypt(Math.min(mapSize,mapSize),7, 10, 3, 6);
	var map = [];
	for (var x = 0; x < mapSize; x++) {
		var newRow = [];
		for (var y = 0; y < mapSize; y++) {
			if (crypt.map[x][y]==0) {
				// area outside the crypt
				newRow.push(' ');
			} else if(crypt.map[x][y]==1) {
				// floor
				newRow.push('.');
			} else {
				// walls
				newRow.push('#');
			}
		}
		map.push(newRow);
	}
	return map;
}


Kiwi.Plugins.MapGenerator.GenerateCrypt = function (mapSize, minRooms, maxRooms, minRoomSize, maxRoomSize) {
	this.map = [];
	this.rooms = [];

	// we pad the size of the generated crypt a bit (+3)
	// because the generator require some extra space to work with
	this.map_size = mapSize+3;

	for (var x = 0; x < this.map_size; x++) {
		this.map[x] = [];
		for (var y = 0; y < this.map_size; y++) {
			this.map[x][y] = 0;
		}
	}

	var room_count = Kiwi.Plugins.MapGenerator.GetRandom(minRooms, maxRooms);
	var min_size = minRoomSize;
	var max_size = maxRoomSize;

	for (var i = 0; i < room_count; i++) {
		var room = {};

		room.x = Kiwi.Plugins.MapGenerator.GetRandom(1, this.map_size - max_size - 1);
		room.y = Kiwi.Plugins.MapGenerator.GetRandom(1, this.map_size - max_size - 1);
		room.w = Kiwi.Plugins.MapGenerator.GetRandom(min_size, max_size);
		room.h = Kiwi.Plugins.MapGenerator.GetRandom(min_size, max_size);

		if (this.DoesCollide(room)) {
			i--;
			continue;
		}
		room.w--;
		room.h--;

		this.rooms.push(room);
	}

	this.SquashRooms();

	for (i = 0; i < room_count; i++) {
		var roomA = this.rooms[i];
		var roomB = this.FindClosestRoom(roomA);

		pointA = {
			x: Kiwi.Plugins.MapGenerator.GetRandom(roomA.x, roomA.x + roomA.w),
			y: Kiwi.Plugins.MapGenerator.GetRandom(roomA.y, roomA.y + roomA.h)
		};
		pointB = {
			x: Kiwi.Plugins.MapGenerator.GetRandom(roomB.x, roomB.x + roomB.w),
			y: Kiwi.Plugins.MapGenerator.GetRandom(roomB.y, roomB.y + roomB.h)
		};

		while ((pointB.x != pointA.x) || (pointB.y != pointA.y)) {
			if (pointB.x != pointA.x) {
				if (pointB.x > pointA.x) pointB.x--;
				else pointB.x++;
			} else if (pointB.y != pointA.y) {
				if (pointB.y > pointA.y) pointB.y--;
				else pointB.y++;
			}

			this.map[pointB.x][pointB.y] = 1;
		}
	}

	for (i = 0; i < room_count; i++) {
		var room = this.rooms[i];
		for (var x = room.x; x < room.x + room.w; x++) {
			for (var y = room.y; y < room.y + room.h; y++) {
				this.map[x][y] = 1;
			}
		}
	}

	for (var x = 0; x < this.map_size; x++) {
		for (var y = 0; y < this.map_size; y++) {
			if (this.map[x][y] == 1) {
				for (var xx = x - 1; xx <= x + 1; xx++) {
					for (var yy = y - 1; yy <= y + 1; yy++) {
						if (this.map[xx][yy] == 0) this.map[xx][yy] = 2;
					}
				}
			}
		}
	}

	// check connectivity
	if(!this.checkConnectivity(this.map, this.map_size, 1)) {
		this.GenerateCrypt(mapSize, minRooms, maxRooms, minRoomSize, maxRoomSize);
	}

	return this;
}

Kiwi.Plugins.MapGenerator.checkConnectivity = function(map, mapSize, floorVal) {
	// check with flood-fill
	var floorX, floorY;
	do {
		floorX = this.GetRandom(0,mapSize-1);
		floorY = this.GetRandom(0,mapSize-1);
	} while (map[floorX][floorY] != floorVal);

	this.floodFill(map, floorX, floorY, null, -1);

	// check if anything wasn't flooded
	for (var x = 0; x < mapSize; x++) {
		for (var y = 0; y < mapSize; y++) {
			// GenerateDungeon new map if disconnected
			if(map[x][y] == floorVal) {
				return false;
			}
		}
	}

	// flood back to floors
	this.floodFill(map, floorX, floorY, null, floorVal);
	return true;
}

Kiwi.Plugins.MapGenerator.floodFill = function(mapData, x, y, oldVal, newVal){
	// flood fill to check for map connectivity
	var mapWidth = mapData.length;
	var mapHeight = mapData[0].length;

	if(oldVal == null){
		oldVal=mapData[x][y];
	}

	if(mapData[x][y] !== oldVal){
		return true;
	}

	mapData[x][y] = newVal;

	if (x > 0){
		// left
		this.floodFill(mapData, x-1, y, oldVal, newVal);
	}
	if(y > 0){
		// up
		this.floodFill(mapData, x, y-1, oldVal, newVal);
	}
	if(x < mapWidth-1){
		// right
		this.floodFill(mapData, x+1, y, oldVal, newVal);
	}
	if(y < mapHeight-1){
		// down
		this.floodFill(mapData, x, y+1, oldVal, newVal);
	}
}

Kiwi.Plugins.MapGenerator.FindClosestRoom = function (room) {
	var mid = {
		x: room.x + (room.w / 2),
		y: room.y + (room.h / 2)
	};
	var closest = null;
	var closest_distance = 1000;
	for (var i = 0; i < this.rooms.length; i++) {
		var check = this.rooms[i];
		if (check == room) continue;
		var check_mid = {
			x: check.x + (check.w / 2),
			y: check.y + (check.h / 2)
		};
		var distance = Math.min(Math.abs(mid.x - check_mid.x) - (room.w / 2) - (check.w / 2), Math.abs(mid.y - check_mid.y) - (room.h / 2) - (check.h / 2));
		if (distance < closest_distance) {
			closest_distance = distance;
			closest = check;
		}
	}
	return closest;
}

Kiwi.Plugins.MapGenerator.SquashRooms = function () {
	for (var i = 0; i < 10; i++) {
		for (var j = 0; j < this.rooms.length; j++) {
			var room = this.rooms[j];
			while (true) {
				var old_position = {
					x: room.x,
					y: room.y
				};
				if (room.x > 1) room.x--;
				if (room.y > 1) room.y--;
				if ((room.x == 1) && (room.y == 1)) break;
				if (this.DoesCollide(room, j)) {
					room.x = old_position.x;
					room.y = old_position.y;
					break;
				}
			}
		}
	}
}

Kiwi.Plugins.MapGenerator.DoesCollide = function (room, ignore) {
	for (var i = 0; i < this.rooms.length; i++) {
		if (i == ignore) continue;
		var check = this.rooms[i];
		if (!((room.x + room.w < check.x) || (room.x > check.x + check.w) || (room.y + room.h < check.y) || (room.y > check.y + check.h))) return true;
	}

	return false;
}

Kiwi.Plugins.MapGenerator.GetRandom = function (low, high) {
	return Math.floor((Math.random() * (high - low)) + low);
}

Kiwi.PluginManager.register(Kiwi.Plugins.MapGenerator);
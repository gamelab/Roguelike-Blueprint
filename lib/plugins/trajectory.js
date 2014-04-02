/* 
 * Trace a trajectory in a tilemap
 *
 * Useful for ranged combat in tile-based games
 */


Kiwi.Plugins.Trajectory = {
	name:'Trajectory',
	version:'1.0.0',
}

// shoot in a straight line from origin to traget
Kiwi.Plugins.Trajectory.shoot = function(origin, target, isWallBlocking, isActorBlocking, hitWall, hitActor) {

	var currX = origin.x;
	var currY = origin.y;
	var hit = false;
	var dx = target.x-currX;
	var dy = target.y-currY;
	
	// how many tiles to advance on the x axis before advancing on the y
	var ratio = 1;
	if(dy!=0) {
		ratio = Math.abs(dx)/Math.abs(dy);
	}
	var currTileX = currX;
	var currTileY = currY;
	
	// find the first thing the bolt hit
	while(!(currTileX == target.x && currTileY == target.y) && !hit) {
		if(ratio>1) {
			// advance faster on the x
			if(dx>0) {
				currX++;
			} else if(dx<0) {
				currX--;
			}
			
			if(dy>0) {
				currY += 1/ratio;
			} else if(dy<0) {
				currY -= 1/ratio;
			}
		} else {
			// advance faster on the y
			if(dx>0) {
				currX += ratio;
			} else if(dx<0){
				currX -= ratio;
			}
			
			if(dy>0) {
				currY++;
			} else if(dy<0) {
				currY--;
			}
		}
		
		currTileX = Math.round(currX);
		currTileY = Math.round(currY);
		
		// hit wall?
		if(isWallBlocking(currTileX, currTileY)) {
			hit = true;
			hitWall(currTileX, currTileY);
		}
		
		// hit actor?
		if(isActorBlocking(currTileX, currTileY)) {
			hit = true;
			hitActor(currTileX, currTileY);
		}
	}
	
	return {x:currX, y:currY};
}

Kiwi.PluginManager.register(Kiwi.Plugins.Trajectory);
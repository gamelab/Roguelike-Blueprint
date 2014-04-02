Name: Roguelike Blueprint
Version: 1.0
Type: Game
Author: Ido Yehieli
Website: http://tametick.com/
KiwiJS last version tested: 0.5.3

----------------------------------------------------------------------------------------
Versions
----------------------------------------------------------------------------------------

1.0 - Initial Game. 
	

----------------------------------------------------------------------------------------
Description:
----------------------------------------------------------------------------------------

This blueprint shows how to use the map generator, pathfinding, tragectory and ai plugins to create a simple roguelike.

----------------------------------------------------------------------------------------
How to use.
----------------------------------------------------------------------------------------

The PlayState demonstrates the structure of a simple roguelike game. Import the afordmentioned plugins (you can find them in the lib/plug
 directory) and create your own graphical or ascii roguelike.
 
The level is represented by a 2d array of characters. '.' represets a floor (walkable) and '#' a wall(blocking). In the PlayState you can see how to easily show this level using either the TileMap class (http://www.api.kiwijs.org/classes/TileMap.html) or an array of TextFields.

--------------------------------------------
Overview
--------------------------------------------

A roguelike is a turn-based, grid-based game with procedurally generated levels. You can use this blueprint as a basis of your own roguelike!

* move with the arrow keys or by clicking/tapping in the direction you wish

* bump into enemies to attack

* pick up wand for ranged attack (4 bolts), click enemy to shoot once you have it

* pick up pickaxe to gain the ability to remove walls/trees

* pick up potion to heal

* gain xp/levels by killing enemies.

* traps ("slow" & "hurt") trigger when you step on them

* 3 enemy types each showcasing a different ai-type

* 2 map generators: forest and dungeon.

* 2 display modes: ascii & graphics
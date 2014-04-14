Roguelike Game Blueprint 1.0
================================

![alt tag](http://willwriteaboutvideogamesformoney.files.wordpress.com/2012/06/cq2shot3.png)

Roguelike is a sub-genre of role-playing video games, characterized by random level generation, ASCII and tile-based graphics and permanent death. Roguelikes descend from the 1980 game Rogue, particularly mirroring Rogue's character- or sprite-based graphics, turn-based gameplay that gives the player the time to plan each move, and high fantasy setting.

Crafted by Ido Yehieli (http://tametick.com/), creator of Cardinal Quest, the Kiwi.JS Roguelike Blueprint coupled with the Kiwi.JS game engine, this Blueprint allows users to rapidly develop a Roguelike game. 


##Versions

KiwiJS last version tested: 0.5.3
	

##Features

This blueprint includes:
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


##How to use

The PlayState demonstrates the structure of a simple roguelike game. Import the afordmentioned plugins (you can find them in the lib/plug
 directory) and create your own graphical or ascii roguelike.
 
The level is represented by a 2d array of characters. '.' represets a floor (walkable) and '#' a wall(blocking). In the PlayState you can see how to easily show this level using either the TileMap class (http://www.api.kiwijs.org/classes/TileMap.html) or an array of TextFields.

##Contribute
If you discover a bug or find yourself just wanting to jump on in and help make this blueprint even better please file an issue and get stuck in. We're a friendly bunch and hope people find themselves wanting to get involved. 

https://github.com/gamelab/Roguelike-Blueprint/issues/new

##Related Documentation 

Coming soon

// game.js for sample2
// 2021-02-03 by bmoriarty

//---------------------------------BASE GAME WITH DATABASE COLLECTION---------------------------------

// The following comment lines are for JSHint. You can remove them if you don't use JSHint.
/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // do not delete this directive!

// This immediately-invoked function expression (IIFE) encapsulates all game functionality.
// It is called as this file is loaded, and initializes the G constant,
// which will contain all public methods as well as private constants, variables and functions.

const G = ( function () {
	// Constants are in all upper-case

	const PLANE_FLOOR = 0; // z-plane of floor
	const PLANE_ACTOR = 1; // z-plane of actor

	const COLOR_BG = PS.COLOR_GRAY_DARK; // background color
	const COLOR_WALL = PS.COLOR_BLACK; // wall color
	const COLOR_FLOOR = PS.COLOR_GRAY; // floor color
	const COLOR_GOLD = PS.COLOR_YELLOW; // gold color
	const COLOR_ACTOR = PS.COLOR_GREEN; // actor color
	const COLOR_EXIT = PS.COLOR_BLUE; // exit color

	const SOUND_FLOOR = "fx_click"; // touch floor sound
	const SOUND_WALL = "fx_hoot"; // touch wall sound
	const SOUND_GOLD = "fx_coin1"; // take coin sound
	const SOUND_OPEN = "fx_powerup8"; // open exit sound
	const SOUND_WIN = "fx_tada"; // win sound
	const SOUND_ERROR = "fx_uhoh"; // error sound

	const MAP_WALL = 0; // wall
	const MAP_FLOOR = 1; // floor
	const MAP_GOLD = 2; // floor + gold
	const MAP_ACTOR = 3; // floor + actor
	const MAP_EXIT = 4; // floor + exit

	const GOLD_MAX = 10; // maximum gold

	// *DB*
	// These two constants are used for the database functions

	// The string stored in DB is used to identify the game associated with the database

	const DB = "maze";

	// The USERS constant controls who will be emailed the data collected by the engine when play is complete.
	// It can be either a single string ("bmoriarty") or an array of strings ([ "bmoriarty", "claypool" ]).
	// Each string must be an email address of a student enrolled in this section of IMGD-3900.
	// NOTE: Do NOT include the @wpi.edu part of the email address.

	const USERS = "himiller"; // Change this! If "username" is specified, no email will be sent.

	//-------------------------*NEW DATABASE INSTRUMENTATION WILL APPEAR LIKE THIS*-------------------------------------------


	//Array to hold spaces player has stepped on

	var uniqueSpaces = {
		width : 23, height : 23, pixelSize : 1,
		data : [
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
		]
	};

	//----------------------------------------------------------------------------------------------

	// Variables

	let id_sprite; // actor sprite id
	let id_path; // pathmap id for pathfinder
	let id_timer; // timer id

	let gold_count = 0; // initial number of gold pieces in map
	let gold_found = 0; // gold pieces collected
	let won = false; // true on win

	// This imageMap is used for map drawing and pathfinder logic
	// All properties MUST be present!
	// The map.data array controls the layout of the maze,
	// the location of the gold pieces, the actor and the exit
	// 0 = wall, 1 = floor, 2 = floor + gold, 3 = floor + actor, 4 = floor + exit
	// To move a gold piece, swap a 2 with a 1
	// To move the actor's initial position, swap the 3 and a 1
	// To move the exit's position, swap the 4 and a 1
	// You cannot have more than one actor/exit, or more than GOLD_MAX gold pieces!

	var map = {
		width : 23, height : 23, pixelSize : 1,
		data : [
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 3, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 0, 1, 1, 1, 1, 1, 1, 1, 0,
			0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0,
			0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0,
			0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0,
			0, 1, 1, 1, 1, 1, 0, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0,
			0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0,
			0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 0,
			0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0,
			0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0,
			0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0,
			0, 1, 1, 1, 0, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 2, 1, 1, 0, 1, 1, 1, 0,
			0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
			0, 1, 1, 2, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0,
			0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0,
			0, 1, 0, 1, 0, 1, 1, 2, 0, 1, 1, 1, 1, 2, 0, 1, 1, 1, 0, 1, 1, 1, 0,
			0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
			0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 2, 1, 1, 0,
			0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0,
			0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0,
			0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0,
			0, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 4, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
		]
	};

	// These two variables control the initial location of the actor

	let actorX; // initial x-pos of actor sprite
	let actorY; // initial y-pos of actor sprite

	// These two variables control the location of the exit

	let exitX; // x-pos of exit
	let exitY; // y-pos of exit

	let exit_ready = false; // true when exit is opened

	// Timer function, called every 1/10th sec
	// This moves the actor along paths

	let path; // path to follow, null if none
	let step; // current step on path

	const tick = function () {
		let p, nx, ny, ptr, val;

		if ( !path ) { // path invalid (null)?
			return; // just exit
		}

		// Get next point on path

		p = path[ step ];
		nx = p[ 0 ]; // next x-pos
		ny = p[ 1 ]; // next y-pos

		// If actor already at next pos,
		// path is exhausted, so nuke it

		if ( ( actorX === nx ) && ( actorY === ny ) ) {
			path = null;
			return;
		}

		// Move sprite to next position

		PS.spriteMove( id_sprite, nx, ny );
		actorX = nx; // update actor's xpos
		actorY = ny; // and ypos



		// If actor has reached a gold piece, take it

		ptr = ( actorY * map.height ) + actorX; // pointer to map data under actor

		//-------------------------------------------*DB*-----------------------------------------------

		//Sets bead under player to value of 1
		uniqueSpaces.data[ptr] = 1;

		//----------------------------------------------------------------------------------------------
		val = map.data[ ptr ]; // get map data
		if ( val === MAP_GOLD ) {
			map.data[ ptr ] = MAP_FLOOR; // change gold to floor in map.data
			PS.gridPlane( PLANE_FLOOR ); // switch to floor plane
			PS.color( actorX, actorY, COLOR_FLOOR ); // change visible floor color
			gold_found += 1; // update gold count

			// *DB*
			// Record the gold-grabbing event in the database

			PS.dbEvent( DB, "gold", gold_found );

			// If last gold has been collected, activate the exit

			if ( gold_found >= gold_count ) {
				exit_ready = true;
				PS.color( exitX, exitY, COLOR_EXIT ); // show the exit
				PS.glyphColor( exitX, exitY, PS.COLOR_WHITE ); // mark with white X
				PS.glyph( exitX, exitY, "X" );
				PS.statusText( "Found " + gold_found + " gold! Exit open!" );
				PS.audioPlay( SOUND_OPEN );
			}

			// Otherwise just update score

			else {
				PS.statusText( "Found " + gold_found + " gold!" );
				PS.audioPlay( SOUND_GOLD );
			}
		}

		// If exit is ready and actor has reached it, end game

		else if ( exit_ready && ( actorX === exitX ) && ( actorY === exitY ) ) {
			PS.timerStop( id_timer ); // stop movement timer
			PS.statusText( "You escaped with " + gold_found + " gold!" );
			PS.audioPlay( SOUND_WIN );
			won = true;

			// ------------------------------*DB*----------------------------------------------

			//when player exits, count each instance of 1 in the array. add to count variable. return count.
			let counter = 0;
			let x = 0;
			let y = 0;

			for (x = 0; x < 23; x += 1){
				for (y = 0; y < 23; y += 1){

					if(uniqueSpaces.data[ (y * map.height) + x ] === 1){
						counter += 1;
					}
				}
			}

			PS.dbEvent( DB, "Spaces", counter);

			//----------------------------------------------------------------------------------------------

			// Game over, so record the exit event, email the collected data and discard it

			PS.dbEvent( DB, "win", true );

			PS.dbSend( DB, USERS, { discard : true } );

			return;
		}

		step += 1; // point to next step

		// If no more steps, nuke path

		if ( step >= path.length ) {
			path = null;
		}
	};

	// Public functions are exposed in the global G object, which is initialized here.
	// Only two functions need to be exposed; everything else is encapsulated!
	// So safe. So elegant.

	return {
		// Initialize the game
		// Called once at startup

		init : function () {
			let len, i, x, y, val, color;

			// Establish grid size
			// This should always be done FIRST, before any other initialization!

			PS.gridSize( map.width, map.height );
			PS.gridColor( COLOR_BG ); // grid background color
			PS.border( PS.ALL, PS.ALL, 0 ); // no bead borders

			// Locate positions of actor and exit, count gold pieces, draw map

			gold_count = 0;
			actorX = exitX = -1; // mark as not found
			for ( y = 0; y < map.height; y += 1 ) {
				for ( x = 0; x < map.width; x += 1 ) {
					val = map.data[ ( y * map.height ) + x ]; // get map data
					if ( val === MAP_WALL ) {
						PS.color( x, y, COLOR_WALL );
					}
					else if ( val === MAP_FLOOR ) {
						PS.color( x, y, COLOR_FLOOR );
					}
					else if ( val === MAP_GOLD ) {
						gold_count += 1;
						if ( gold_count > GOLD_MAX ) {
							PS.debug( "WARNING: More than " + GOLD_MAX + " gold!\n" );
							PS.audioPlay( SOUND_ERROR );
							return;
						}
						PS.color( x, y, COLOR_GOLD );
					}
					else if ( val === MAP_ACTOR ) {
						if ( actorX >= 0 ) {
							PS.debug( "WARNING: More than one actor!\n" );
							PS.audioPlay( SOUND_ERROR );
							return;
						}
						actorX = x;
						actorY = y;
						map.data[ ( y * map.height ) + x ] = MAP_FLOOR; // change actor to floor
						PS.color( x, y, COLOR_FLOOR );
					}
					else if ( val === MAP_EXIT ) {
						if ( exitX >= 0 ) {
							PS.debug( "WARNING: More than one exit!\n" );
							PS.audioPlay( SOUND_ERROR );
							return;
						}
						exitX = x;
						exitY = y;
						map.data[ ( y * map.height ) + x ] = MAP_FLOOR; // change exit to floor
						PS.color( x, y, COLOR_FLOOR );
					}
				}
			}

			PS.statusColor( PS.COLOR_WHITE );
			PS.statusText( "Click/touch to move" );

			// Preload & lock sounds

			PS.audioLoad( SOUND_FLOOR, { lock : true } );
			PS.audioLoad( SOUND_WALL, { lock : true } );
			PS.audioLoad( SOUND_GOLD, { lock : true } );
			PS.audioLoad( SOUND_OPEN, { lock : true } );
			PS.audioLoad( SOUND_WIN, { lock : true } );

			// Create 1x1 solid sprite for actor
			// Place on actor plane in initial actor position

			id_sprite = PS.spriteSolid( 1, 1 );
			PS.spriteSolidColor( id_sprite, COLOR_ACTOR );
			PS.spritePlane( id_sprite, PLANE_ACTOR );
			PS.spriteMove( id_sprite, actorX, actorY );

			// Create pathmap from our imageMap
			// for use by pathfinder

			id_path = PS.pathMap( map );

			// Start the timer function that moves the actor
			// Run at 10 frames/sec (every 6 ticks)

			path = null; // start with no path
			step = 0;
			id_timer = PS.timerStart( 6, tick );

			// *DB*
			// Initialize the database for event recording

			PS.dbInit( DB );
		},

		// move( x, y )
		// Set up new path for the actor to follow

		move : function ( x, y ) {
			let line;

			// Do nothing if game over

			if ( won ) {
				return;
			}

			// Use pathfinder to calculate a line from current actor position
			// to touched position

			line = PS.pathFind( id_path, actorX, actorY, x, y );

			// If line is not empty, it's valid,
			// so make it the new path
			// Otherwise hoot at the player

			if ( line.length > 0 ) {
				path = line;
				step = 0; // start at beginning
				PS.audioPlay( SOUND_FLOOR );
			}
			else {
				PS.audioPlay( SOUND_WALL );
			}
		},

		// *DB*
		// Email and discard the database if browser tab is closed before game ends

		shutdown : function () {
			if ( PS.dbValid( DB ) ) {
				PS.dbSend( DB, USERS, { discard : true } );
			}
		}
	};
} () ); // end of IIFE

// PS.init( system, options )
// Initializes the game

PS.init = function( system, options ) {
	G.init(); // game-specific initialization
};

// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched

PS.touch = function( x, y, data, options ) {
	G.move( x, y ); // initiates actor movement
};

// PS.shutdown ( options )
// Called when the browser window running Perlenspiel is about to close.

PS.shutdown = function( options ) {
	G.shutdown();
};

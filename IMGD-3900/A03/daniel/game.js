// game.js for Perlenspiel 3.3
// The following comment lines are for JSHint. You can remove them if you don't use JSHint.
/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict";

/*
name: Daniel Charles Ribaudo
user: dcribaudo
team: Purtorqlack
class: IMGD 3900 C21
---
Mods:
1) Screen becomes darker in a radius around the player over time
2) Picking up gold relights some of the area
3) Game over on full screen darkness
4) Gold now has a random value or operator associated with it
5) Gold with operators looks different from normal gold (circles)
6) Gold with operators changes the effect of picking up gold on score
7) Negative value gold has red text, positive value gold has blue text
8) Gold with operators make a different noise when collected
9) Total score is now displayed on the status bar
10) Completing the game with a negative score plays a Wilhelm scream
---
Additional Notes:
- The darkness effect was harder than I thought to implement because
  the background and glyphs were not masked by it, and some lerp needed
  to be used
- The code for the walls shifting colors also is present, but it makes the
  game far too busy, even for random mods.  Feel free to look at it though.
 */


// The G object will contain all public constants, variables and functions.
// The immediately invoked function expression (IIFE) encapsulates all game functionality.
// It is called as this file is loaded, and initializes the G object.

const G = ( function () {

	// Constants are in all upper-case

	const WIDTH = 21; // grid width
	const HEIGHT = 21; // grid height

	const PLANE_FLOOR = 0; // z-plane of floor
	const PLANE_ACTOR = 1; // z-plane of actor

	const COLOR_BG = PS.COLOR_GRAY_DARK; // background color
	const COLOR_WALL = PS.COLOR_BLACK; // wall color
	const COLOR_FLOOR = PS.COLOR_GRAY; // floor color
	const COLOR_ACTOR = PS.COLOR_GREEN; // actor color
	const COLOR_GOLD = PS.COLOR_YELLOW; // gold color
	const COLOR_EXIT = PS.COLOR_BLUE; // exit color

	const SOUND_FLOOR = "fx_click"; // touch floor sound
	const SOUND_WALL = "fx_hoot"; // touch wall sound
	const SOUND_GOLD = "fx_coin1"; // take coin sound
	const SOUND_OPEN = "fx_powerup8"; // open exit sound
	const SOUND_WIN = "fx_tada"; // win sound
	const SOUND_ERROR = "fx_uhoh"; // error sound

	const WALL = 0; // wall
	const FLOOR = 1; // floor
	const GOLD = 2; // floor + gold

	const DARKNESS_PLANE = 2; //z-plane of darkness effect
	const DARKNESS_TICK_SPEED = 40; //Darkness shrinks
	const DARKNESS_COLOR = PS.COLOR_BLACK; // color of darkness
	const DARKNESS_MAX_RADIUS = 40; //Maximum radius of the darkness
	const DARKNESS_THRESHOLD = 4.0/9; //Darkness fade in occurs (squared from 2/3 to avoid sqrt)
	const DARKNESS_GOLD_INC = 10; //Radius increase on gold pickup

	const SOUND_LOSE = "fx_blip"
	const SOUND_WILHELM = "fx_wilhelm"
	const SOUND_GOLD_ALT = "fx_coin2";

	const GOLD_OP = 0.1; //Percentage of each operator
	const GOLD_NEG = 0.3; //Percentage of gold with negative value
	const GOLD_VAL = 9; //Value of gold
	const GOLD_COLOR_POS = PS.COLOR_BLUE;
	const GOLD_COLOR_NEG = PS.COLOR_RED;

	//const WALL_COLORS = [PS.COLOR_RED, PS.COLOR_ORANGE, PS.COLOR_BLUE, PS.COLOR_PURPLE]
	//const WALL_TICK_SPEED = 300;

	// Variables

	let id_sprite; // actor sprite id
	let id_path; // pathmap id for pathfinder
	let id_timer; // timer id

	let gold_count; // initial number of gold pieces in map
	let gold_found; // gold pieces collected
	let won = false; // true on (win) end of game (can be a loss, I did not wish to change the variable name)

	// This handmade imageMap is used for map drawing and pathfinder logic
	// All properties MUST be present!
	// The map.data array controls the layout of the maze,
	// the location of the gold pieces and exit
	// 0 = wall, 1 = floor, 2 = floor + gold
	// To remove a gold piece, replace a 2 with a 1
	// To add a gold piece, replace a 1 with a 2

	let map = {
		width: WIDTH, // must match WIDTH!
		height: HEIGHT, // must match HEIGHT!
		pixelSize: 1, // must be present!
		data: [
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 1, 1, 1, 1, 1, 2, 1, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0,
			0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0,
			0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0,
			0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
			0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
			0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
			0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 2, 1, 1, 0, 0, 1, 0, 0, 1, 0,
			0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0,
			0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0,
			0, 1, 0, 0, 1, 2, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0,
			0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
			0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
			0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 2, 0,
			0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
			0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 1, 0,
			0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0,
			0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
			0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
			0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
		]
	};

	// These two variables control the initial location of the actor
	// This location MUST correspond to a floor location (1) in the maza.data array
	// or a startup error will occur!

	let actorX = 1; // initial x-pos of actor sprite
	let actorY = 1; // initial y-pos of actor sprite

	// These two variables control the location of the exit
	// This location MUST correspond to a floor location (1) in the maza.data array
	// or a startup error will occur!

	let exitX = 19; // x-pos of exit
	let exitY = 19; // y-pos of exit
	let exit_ready = false; // true when exit is opened

	// Timer function, called every 1/10th sec
	// This moves the actor along paths

	let path; // path to follow, null if none
	let step; // current step on path

	let darkness_radius = DARKNESS_MAX_RADIUS; //Current darkness radius
	let id_darkness; //Darkness timer

	let operation = "+";
	let score = 0;
	//let wall_index = 0;
	//let id_walls;

	const lerp = function(val1, val2, f) { //Lerp for colors
		return val1*(1-f) + val2*f;
	}

	/*
	const wallTick = function() {
		let x, y;

		wall_index++;
		if (wall_index >= WALL_COLORS.length) {
			wall_index = 0;
		}
		PS.gridPlane(PLANE_FLOOR);

		for (y = 0; y < HEIGHT; y++) {
			for (x = 0; x < WIDTH; x++) {
				if (map.data[ ( y * HEIGHT ) + x ] === WALL) {
					PS.color(x,y,WALL_COLORS[wall_index]);
				}
			}
		}
	}
	*/

	const updateDarkness = function () {
		let y, x, current_threshold, dy_sq, dist_sq, f,
			colors1 = {r:0, g:0, b:0}, colors2 = {r:0, g:0, b:0};

		PS.gridPlane(DARKNESS_PLANE); //Adjust plane
		current_threshold = darkness_radius*DARKNESS_THRESHOLD; //Update current threshold
		for (y = 0; y < HEIGHT; y++) { //Iterate through all xy values
			dy_sq = actorY - y;
			dy_sq *= dy_sq;
			for (x = 0; x < WIDTH; x++) {
				dist_sq = actorX - x;
				dist_sq *= dist_sq;
				dist_sq += dy_sq;

				if (dist_sq < current_threshold) { //Clear
					PS.alpha(x,y, 0);
					PS.bgColor(x,y,COLOR_FLOOR); //Floor colored
					PS.glyphAlpha(x,y, 255); //Fully opaque glyphs
				}
				else if (dist_sq < darkness_radius) { //Getting darker
					f = dist_sq/darkness_radius;
					PS.alpha(x,y, Math.floor(255*f)); //Fade in as closer to boundary
					PS.glyphAlpha(x,y,Math.floor(255*(1-f))); //Fade OUT glyph
					//Manually adjust background color via blending
					//Ik this is excessive for the given colors but nonetheless
					PS.unmakeRGB(COLOR_FLOOR, colors1);
					PS.unmakeRGB(DARKNESS_COLOR, colors2);
					PS.bgColor(x,y, {r:lerp(colors1.r, colors2.r, f),
						g:lerp(colors1.g, colors2.g, f),
						b:lerp(colors1.b, colors2.b, f)});
				}
				else { //Pitch black
					PS.alpha(x,y,255);
					PS.bgColor(x,y,DARKNESS_COLOR); //Darkness colored
					PS.glyphAlpha(x,y,0); //No glyph
				}
			}
		}
	}

	const endGame = function (message, sound) { //Ends timers and sets won = true
		PS.timerStop( id_timer ); // stop movement timer
		PS.timerStop( id_darkness ); // stop darkness timer
		//PS.timerStop( id_walls );
		PS.statusText( message );
		PS.audioPlay( sound );

		won = true;
	}

	const darknessTick = function () {
		darkness_radius--;
		updateDarkness();
		if (darkness_radius <= 0) {
			endGame("The darkness took you...", SOUND_LOSE);
		}
	}

	const tick = function () {
		let p, nx, ny, ptr, val, parsed;

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

		//Update darkness
		updateDarkness();

		// If actor has reached a gold piece, take it

		ptr = ( actorY * HEIGHT ) + actorX; // pointer to map data under actor
		val = map.data[ ptr ]; // get map data
		if ( val === GOLD ) {
			map.data[ ptr ] = FLOOR; // change gold to floor in map.data
			PS.gridPlane( PLANE_FLOOR ); // switch to floor plane
			PS.color( actorX, actorY, COLOR_FLOOR ); // change visible floor color

			// If last gold has been collected, activate the exit

			gold_found += 1; // update gold count
			darkness_radius = darkness_radius+DARKNESS_GOLD_INC > DARKNESS_MAX_RADIUS?
				DARKNESS_MAX_RADIUS:darkness_radius+DARKNESS_GOLD_INC; //Expand darkness

			//Update score and operation
			parsed = parseInt(String.fromCharCode(PS.glyph(actorX, actorY, PS.CURRENT)));
			if (isNaN(parsed)) {
				operation = String.fromCharCode(PS.glyph(actorX, actorY, PS.CURRENT));
				PS.audioPlay( SOUND_GOLD_ALT );
			}
			else {
				if (PS.glyphColor(actorX, actorY, PS.CURRENT) === GOLD_COLOR_NEG) {
					parsed *= -1;
				}
				switch (operation) {
					case "+": {
						score += parsed;
						break;
					}
					case "-": {
						score -= parsed;
						break;
					}
					default: {
						score *= parsed;
						break;
					}
				}
				PS.audioPlay( SOUND_GOLD );
			}

			//Clear glyph and make square
			PS.glyph(actorX, actorY, "");
			PS.radius(actorX, actorY, 0);

			if ( gold_found >= gold_count ) {
				exit_ready = true;
				PS.color( exitX, exitY, COLOR_EXIT ); // show the exit
				PS.glyphColor( exitX, exitY, PS.COLOR_WHITE ); // mark with white X
				PS.glyph( exitX, exitY, "X" );
				PS.statusText(" Score: " + score + " Go to exit!" );
				//PS.audioPlay( SOUND_OPEN );
			}

			// Otherwise just update score

			else {
				PS.statusText( "Op: " + operation + " Score: "
					+ score + " g:(" + gold_found + "/" + gold_count + ")" );
			}
		}

		// If exit is ready and actor has reached it, end game

		else if ( exit_ready && ( actorX === exitX ) && ( actorY === exitY ) ) {
			endGame("Final score: " + score, score<0?SOUND_WILHELM:SOUND_WIN);
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
			let x, y, val, color, gold_locations = [], gold_data = [],
				i, j, gold_op, gold_rem, gold_neg, gold_placeholder, gold_pos,
				gold_glyph, gold_glyph_color, gold_radius;

			// Establish grid size
			// This should always be done FIRST, before any other initialization!

			PS.gridSize( WIDTH, HEIGHT );

			// Check for illegal actor/exit locations

			val = map.data[ ( actorY * HEIGHT ) + actorX ]; // get map data under actor
			if ( val !== FLOOR ) {
				PS.debug( "ERROR: Actor not on empty floor!" );
				PS.audioPlay( SOUND_ERROR );
				return;
			}

			val = map.data[ ( exitY * HEIGHT ) + exitX ]; // get map data at exit position
			if ( val !== FLOOR ) {
				PS.debug( "ERROR: Exit not on empty floor!" );
				PS.audioPlay( SOUND_ERROR );
				return;
			}

			PS.gridColor( COLOR_BG ); // grid background color
			PS.border( PS.ALL, PS.ALL, 0 ); // no bead borders
			PS.statusColor( PS.COLOR_WHITE );
			PS.statusText( "Click/touch to move" );

			// Use the map.data array to draw the maze
			// This also counts the number of gold pieces that have been placed

			gold_count = gold_found = 0;
			for ( y = 0; y < HEIGHT; y += 1 ) {
				for ( x = 0; x < WIDTH; x += 1 ) {
					val = map.data[ ( y * HEIGHT ) + x ]; // get data
					if ( val === WALL ) {
						color = COLOR_WALL;
						//This does not work PS.fade(x,y,WALL_TICK_SPEED);
					}
					else if ( val === FLOOR ) {
						color = COLOR_FLOOR;
					}
					else if ( val === GOLD ) {
						color = COLOR_GOLD;
						gold_count += 1; // add to count
						gold_locations.push({x:x, y:y});//Save location
					}
					PS.color( x, y, color );
				}
			}

			//Update based on gold amount

			gold_op = gold_count*GOLD_OP;
			gold_rem = gold_count - gold_op;
			gold_neg = gold_count*GOLD_NEG;

			//Operators
			for (i = 0; i < gold_op; i++) {
				gold_data.push({type:"+", val:0}); //Add
				gold_data.push({type:"-", val:0}); //Subtract
				gold_data.push({type:"*", val:0}); //Multiply
			}
			//Negative and positive values
			for (i = 0; i < gold_rem; i++) {
				gold_data.push({type:"v", val:(i<gold_neg?-1:1) *
						PS.random(GOLD_VAL)});
			}
			//Swap to a random order
			for (i = 0; i < gold_count; i++) {
				j = PS.random(gold_count)-1; //-1 for 0 based indexing
				gold_placeholder = gold_data[i];
				gold_data[i] = gold_data[j];
				gold_data[j] = gold_placeholder;
			}
			gold_placeholder = null; //No longer need this

			//Apply data and visuals
			for (i = 0; i < gold_count; i++) {
				gold_pos = gold_locations[i];

				//PS.debug(gold_data[i].type);

				gold_radius = 50; //Default : make a circle
				gold_glyph = gold_data[i].type; //Default symbol: type of data

				switch (gold_data[i].type) {
					case "v": {
						gold_radius = 0; //Back to square
						if (gold_data[i].val < 0) { //Adjust color
							gold_glyph_color = GOLD_COLOR_NEG;
							gold_glyph = gold_data[i].val.toString().charAt(1); //Skip '-'
						}
						else {
							gold_glyph_color = GOLD_COLOR_POS;
							gold_glyph = gold_data[i].val.toString(); //Digit glyph
						}

						break;
					}
					case "+": {
						gold_glyph_color = GOLD_COLOR_POS;
						break;
					}
					case "-": {
						gold_glyph_color = GOLD_COLOR_NEG;
						break;
					}
					default: {
						gold_glyph_color = GOLD_COLOR_POS;
						break;
					}
				}
				//Adjust values based on result
				PS.glyph(gold_pos.x, gold_pos.y, gold_glyph);
				PS.glyphColor(gold_pos.x, gold_pos.y, gold_glyph_color);
				PS.radius(gold_pos.x, gold_pos.y, gold_radius);
				PS.bgAlpha(gold_pos.x, gold_pos.y, 255);
			}

			// Preload & lock sounds

			PS.audioLoad( SOUND_FLOOR, { lock : true } );
			PS.audioLoad( SOUND_WALL, { lock : true } );
			PS.audioLoad( SOUND_GOLD, { lock : true } );
			PS.audioLoad( SOUND_OPEN, { lock : true } );
			PS.audioLoad( SOUND_WIN, { lock : true } );
			PS.audioLoad( SOUND_LOSE, { lock : true } );
			PS.audioLoad( SOUND_WILHELM, { lock : true } );
			PS.audioLoad( SOUND_GOLD_ALT, { lock : true} );

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
			id_darkness = PS.timerStart(DARKNESS_TICK_SPEED, darknessTick);
			//id_walls = PS.timerStart(WALL_TICK_SPEED, wallTick);

			//Init darkness
			PS.gridPlane(DARKNESS_PLANE);
			PS.color(PS.ALL, PS.ALL, DARKNESS_COLOR);
			PS.alpha(PS.ALL, PS.ALL, 255);

			//Update darkness
			updateDarkness();
		},

		// touch( x, y )
		// Set up new path for the actor to follow.
		// NOTE: data and options parameters are currently unused.

		touch : function ( x, y ) {
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
		}
	};
} () ); // end of IIFE

// The following calls assign the G.init() and G.touch() functions above to Perlenspiel's event handlers.

// PS.init( system, options )
// Initializes the game

PS.init = function ( system, options ) {
	G.init(); // game-specific initialization
};

// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched

PS.touch = function ( x, y, data, options ) {
	G.touch( x, y ); // initiates actor movement
};



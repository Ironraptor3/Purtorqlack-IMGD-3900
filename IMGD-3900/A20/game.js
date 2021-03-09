/*
game.js for Perlenspiel 3.3.x
Last revision: 2021-01-29 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-21 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
Add code to the event handlers required by your project.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/

/*
The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these lines.
*/

/* jshint browser : true, devel : true, esversion : 5, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT delete this directive!

const GOLD_TOUCH = ( function () {
    const DB = "purtorqlack";
    const EMAIL = "himiller";

    const GRID_SIZE_H = 16;
    const GRID_SIZE_V = 16;
    const SIZE_LANE = 3;

    const LAYER_BG = 0;
    const LAYER_SPR = 1;
    const LAYER_OBJ = 2;

    const MAX_HUNGER = 100;
    const HUNGER_RESTORE = 30;
    const UT_WIN = 60;

    const MESSAGES = [
        "Both characters must eat",
        "Gold increases your score",
        "Avoid consuming too much wine",
        "This is Dionysus speaking, mortal!",
        "I am god of Hedonism",
        "Heed my warning-",
        "Greed is a cruel mistress",
        "It corrupts the soul",
        "Consumption will consume you",
        "A blessing that curses-",
        "Is that truly your desire?",
        "The Golden Touch, then.",
    ];

    const SPAWNS = [
        {food:10, gold:0, poison:0},
        {food:10, gold:5, poison:0},
        {food:10, gold:20, poison:15},
        {food:20, gold:25, poison:18},
        {food:20, gold:25, poison:18},
        {food:20, gold:25, poison:18},
        {food:20, gold:25, poison:18},
        {food:20, gold:25, poison:18},
        {food:20, gold:25, poison:18},
        {food:20, gold:25, poison:18},
        {food:5, gold:0, poison:0},
    ]

    const HUNGER_DRAIN = [
        1,  //Level 1
        1,  //Level 2
        2,  //Level 3
        2,  //Level 4
        2,  //Level 5
        3,  //Level 6
        3,  //Level 7
        3,  //Level 8
        3,  //Level 9
        3,  //Level 10
        1   //Level 11
    ]

    //Load sprites here
    //TODO
    const LOADED_SPRITES = [

    ];
    const SPRITE_HEIGHT = 3;

    const COLOR_BG = PS.COLOR_WHITE;
    const COLOR_LANE = {r:100, g:100, b:100};

    const COLOR_OBJ = {food: PS.COLOR_ORANGE, gold:PS.COLOR_YELLOW, poison:{r:200,g:0,b:200}};
    const TICK_UPDATE = 20;
    const TICK_FALL = 10;
    const TICK_FALL_VARIANCE = 3;

    const MAX_HP = 3;

    let timers = [];
    let gameRunning = false;
    let levelRunning = false;

    let hp = 0;
    let hunger = [0, 0];
    let sprites = [null, null];

    let falling = [];
    let currentTimer = {food:0, gold:0, poison:0};

    let level = 0;
    let currentUT = 0;

    let touching = -1;

    let goldCollected = 0;

    const FCN_OBJ = {
        food:function(c) {
            //PS.debug("Food collected");
            const index = c?0:1;
            hunger[index]+=HUNGER_RESTORE;
        },
        gold:function(c) {
            //PS.debug("Gold collected");
            //TODO
            goldCollected +=1;
        },
        poison:function(c) {
            if (--hp <= 0) {
                //PS.debug("Poison collected");
                PS.statusText("Drank too much wine");
                gameOver();
            }
        }
    }

    const lerpColor = function(f, c1, c2) {
        let c3 = {r:0,g:0,b:0}
        for (const prop in c1) {
            c3[prop] = (f)*c1[prop] + (1-f)*c2[prop];
            PS.debug(c3[prop] + '\n' );
        }
        return c3;
    }

    const randomRange = function(min, max) {
        return Math.floor(Math.random()*(max-min)) + min
    }

    const fall = function() {
        if (gameRunning && levelRunning) {
            PS.gridPlane(LAYER_OBJ);
            PS.alpha(PS.ALL, PS.ALL, 0);
            //Progress old
            for (let i = 0; i < falling.length; ++i) {
                let obj = falling[i];
                let removed = false;

                if (++obj.tick >= obj.tickFall) {
                    obj.tick = 0;

                    let nx = obj.pos.x + obj.dir.x,
                        ny = obj.pos.y + obj.dir.y;
                    /*
                    for (let j = 0; j < falling.length; ++j) {
                        let obj2 = falling[j];
                        if (obj.pos.x === nx && obj.pos.y === ny) {
                            nx = obj.pos.x;
                            ny = obj.pos.y;

                            if (obj.dir.x !== 0) {
                                obj.dir.x = 0;
                                obj.dir.y = 1;
                            }
                            else {
                                obj.tickFall = obj2.tickFall;
                            }
                        }
                    }
                     */

                    obj.pos.x = nx;
                    obj.pos.y = ny;


                    if (obj.pos.y >= GRID_SIZE_V-SPRITE_HEIGHT) {
                        if (isLane(obj.pos.x)) {
                            FCN_OBJ[obj.prop](obj.pos.x<SIZE_LANE);
                        }
                        falling.splice(i,1);
                        if (touching === i) {
                            touching = -1;
                        }
                        --i;
                        removed = true;
                    }
                    else if (obj.dir.x !== 0 && isLane(obj.pos.x)) {
                        obj.dir.x = 0;
                        obj.dir.y = 1;
                    }
                }

                if (!removed) {
                    PS.color(obj.pos.x, obj.pos.y, COLOR_OBJ[obj.prop]);
                    PS.alpha(obj.pos.x, obj.pos.y, 255);
                }
            }
            //Spawn new
            for (const property in currentTimer) {
                if (SPAWNS[level][property] > 0
                    && ++currentTimer[property] >= SPAWNS[level][property]) {
                    currentTimer[property] = 0;

                    let origX = randomRange(SIZE_LANE, GRID_SIZE_H-SIZE_LANE), xLoc = origX, found = false;
                    do {
                        if (PS.alpha(origX, 0, PS.CURRENT) === 0) {
                            found = true;
                            break;
                        }
                        else {
                            ++xLoc;
                            if (xLoc >= GRID_SIZE_H-SIZE_LANE) {
                                xLoc = SIZE_LANE;
                            }
                        }
                    } while (origX !== xLoc);
                    if (found) {
                        falling.push({pos:{x:xLoc, y:0}, prop:property, dir:{x:0, y:1},
                            tickFall:randomRange(1, TICK_FALL_VARIANCE+1), tick:0});
                        PS.color(xLoc, 0, COLOR_OBJ[property]);
                    }
                }
            }
            //Draw all
        }
    }

    const update = function() {
        if (gameRunning && levelRunning) {
            if (++currentUT > UT_WIN) {
                ++level;
                startLevel();
            }
            else {
                for (let i = 0; i < hunger.length; ++i) {
                    hunger[i]-=HUNGER_DRAIN[level];
                    if (hunger[i] < 0) {
                        if (level < 10) {
                            PS.statusText("A character starved to death");
                        }
                        else {
                            PS.statusText("Curse of The Golden Touch...");
                        }
                        gameOver();
                    }
                }
                updateSprites();
            }
        }
    }

    const startLevel = function() {
        hunger[0] = MAX_HUNGER;
        hunger[1] = MAX_HUNGER;
        hp = MAX_HP;

        PS.gridPlane(LAYER_OBJ);
        PS.alpha(PS.ALL, PS.ALL, 0);

        falling = [];
        currentUT = 0;

        PS.statusText(MESSAGES[level] + " [Score: " + goldCollected + "]");
        levelRunning = false;
        updateSprites();
    }

    const updateSprites = function() {

        const pos = [{x:0, y:GRID_SIZE_V-SPRITE_HEIGHT}, {x:GRID_SIZE_H-SIZE_LANE, y:GRID_SIZE_V-SPRITE_HEIGHT}];

        for (let i = 0; i < sprites.length; ++i) {
            if (sprites[i] !== null) {
                PS.deleteSprite(sprites[i]);
            }
            //TODO temp
            let spr = PS.spriteSolid(SIZE_LANE, SPRITE_HEIGHT);
            PS.spriteSolidColor(spr, lerpColor(hunger[i]/MAX_HUNGER, {r:0,g:50,b:200}, {r:200, g:25, b:25}));
            PS.spriteSolidAlpha(spr, 255);
            PS.spritePlane(spr, LAYER_SPR);
            PS.spriteMove(spr, pos[i].x, pos[i].y);

            PS.statusText(MESSAGES[level] + " [Score: " + goldCollected + "]");
        }
    }

    const gameOver = function() {
        for (let i = 0; i < timers.length; ++i) {
            PS.timerStop(timers[i]);
        }
        gameRunning = false;

        PS.dbEvent(DB, "Gold Collected", goldCollected);
        PS.dbEvent(DB, "Level", level);
        PS.dbEvent(DB, "Game Over", true);
	    
	PS.dbSend( DB, EMAIL, { discard : true } );
    }

    const isLane = function(x) {
        return x < SIZE_LANE || x >= (GRID_SIZE_H - SIZE_LANE);
    }

    return {
        init : function() {
            PS.gridSize(GRID_SIZE_H, GRID_SIZE_V);
            PS.gridPlane(LAYER_BG);
            PS.alpha(PS.ALL, PS.ALL, 255);
            for (let y = 0; y < GRID_SIZE_V; ++y) {
                for (let x = 0; x < GRID_SIZE_H; ++x) {
                    PS.color(x, y, isLane(x)?COLOR_LANE:COLOR_BG);
                }
            }
            startLevel();
        },
        onLogin : function() {
            gameRunning = true;

            timers.push(PS.timerStart(TICK_UPDATE, update));
            timers.push(PS.timerStart(TICK_FALL, fall));
        },
        touch : function(x,y,data,options) {
            if (gameRunning) {
                if (levelRunning) {
                    const minDistSq = 4;
                    let closest = -1;
                    let cdsq = -1;
                    for (let i = 0; i < falling.length; ++i) {
                        let obj = falling[i];
                        if (obj.tickFall > 0) {
                            const dx = obj.pos.x-x, dy = obj.pos.y-y,
                                distSq = dx*dx+dy*dy;
                            if (distSq < minDistSq && (cdsq < 0 || distSq < cdsq)) {
                                closest = i;
                                cdsq = distSq;
                            }
                        }
                    }
                    if (closest >= 0) {
                        touching = closest;
                    }
                }
                else {
                    levelRunning = true;
                }
            }
        },
        enter : function(x,y,data,options) {
            //Nothing for now
        },
        release : function(x, y, data, options) {
            if (touching >= 0 && falling[touching] !== undefined) {
                let obj = falling[touching];
                obj.dir.x = Math.sign(x-obj.pos.x);
                if (obj.dir.x !== 0) {
                    obj.tickFall = 0;
                    obj.dir.y = 0;
                }
                touching = -1;
            }
        }
    }
}());

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.init = function (system, options) {
    //---------------------------------------*DB*---------------------------------------

    const DB = "purtorqlack";

    let user;

    const onLogin = function ( id, username ) {
        if ( username === PS.ERROR ) {
            PS.statusText( "Login failed; aborting." );
            return; // aborts game startup
        }

        user = username; // save collected username
        //PS.statusText( "Hello, " + user + "!" );

        // Final game startup code goes here
        GOLD_TOUCH.onLogin();
    };

    // Collect user credentials, init database
    // NOTE: To disable DB operations during development,
    // change the value of .active to false
    GOLD_TOUCH.init();
    PS.dbLogin( DB, onLogin, { active : true } );
}

/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.touch = function( x, y, data, options ) {
	GOLD_TOUCH.touch(x,y,data,options);
};
/*
PS.release ( x, y, data, options )
Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.release = function( x, y, data, options ) {
	GOLD_TOUCH.release(x,y,data,options);
};

/*
PS.enter ( x, y, button, data, options )
Called when the mouse cursor/touch enters bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.enter = function( x, y, data, options ) {
	GOLD_TOUCH.enter(x,y,data,options);
};

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exit = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is pressed.
};

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

	//	 var device = sensors.wheel; // check for scroll wheel
	//
	//	 if ( device ) {
	//	   PS.debug( "PS.input(): " + device + "\n" );
	//	 }

	// Add code here for when an input event is detected.
};

/*
PS.shutdown ( options )
Called when the browser window running Perlenspiel is about to close.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: This event is generally needed only by applications utilizing networked telemetry.
*/

PS.shutdown = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "“Dave. My mind is going. I can feel it.”\n" );

	// Add code here to tidy up when Perlenspiel is about to close.


    //----------------------------------------*DB*-------------------------------------------------
    //Send data if game closes to prevent data loss
    if ( PS.dbValid( DB ) ) {
        PS.dbEvent( DB, "shutdown", true );
        PS.dbSend( DB, EMAIL );
    }
};


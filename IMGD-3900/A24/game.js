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

    const GRID_SIZE_H = 32;
    const GRID_SIZE_V = 32;
    const SIZE_LANE = 8;

    const LAYER_BG = 0;
    const LAYER_SPR = 1;
    const LAYER_OBJ = 2;

    const MAX_HUNGER = 100;
    const HUNGER_RESTORE = 30;
    const UT_WIN = 60;

    const MESSAGES = [
        "Drag to Feed Midas & Satyr",
        "Gold increases your score",
        "Avoid consuming too much wine",
        "Of Course, Lord Dionysus",
        "Then I have won favor?",
        "I want.... Power... and Wealth",
        "All I touch becomes gold",
        "Surely- This is my wish",
        "Praise you, Lord Dionysis!",
        "Tis not greed, just desire",
        "Quickly, grant me this!",
        "... I see",
    ];

    const COLOR_PULSE = PS.COLOR_WHITE;
    const PULSE_WEIGHT = .2;

    const COLOR_PLAYER = {r:218, g:163, b:32};

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
    
    //---------------------------------------------------------IMAGE LOADERS--------------------------------------------------------------------

    var interludeSprite;
    var interludeLoader = function ( data ) {
        interludeSprite = PS.spriteImage( data );
	    PS.spritePlane(interludeSprite, 0); 
	PS.imageBlit(data, 0, 0);
    };

    var satyrSprite;
    var satyrLoader = function ( data ) {
        satyrSprite = PS.spriteImage( data );
	PS. imageBlit(data, 0, 23);
    };
	
    var midasSprite;
    var midasLoader = function ( data ) {
        midasSprite = PS.spriteImage( data );
	PS.imageBlit(data, 24, 23);
    };
	
    var twoSprite;
    var twoLoader = function ( data ) {
        twoSprite = PS.spriteImage( data );
	PS.imageBlit(data, 0, 0);
	    
	console.log( "loaded second room");
    };
	
	var threeSprite;
    var threeLoader = function ( data ) {
        threeSprite = PS.spriteImage( data );
	PS.imageBlit(data, 0, 0);
	    
	console.log( "loaded third room");
    };
	
	var fourSprite;
    var fourLoader = function ( data ) {
        fourSprite = PS.spriteImage( data );
	PS.imageBlit(data, 0, 0);
	    
	console.log( "loaded fourth room");
    };
	
	var fiveSprite;
    var fiveLoader = function ( data ) {
        fiveSprite = PS.spriteImage( data );
	PS.imageBlit(data, 0, 0);
	    
	console.log( "loaded fifth room");
    };
	
    var gameSprite;
    var gameLoader = function ( data ) {
        gameSprite = PS.spriteImage( data );
	PS.imageBlit(data, 0, 0);
	console.log( "loaded game sprite");
    };

    const LOADED_SPRITES = [];

    const INTERLUDES = [
        [0,1],
        [2,3],
        [4,5],
        [6,7],
        [8,9],
        [10,11],
        [12,13],
        [14,15],
        [16,17],
        [18,19],
        [20,21],
        [22,23],
        [24,25],
        undefined
    ]
    const CHARACTERS = [
        //Intro -> Level 1 NPCs
        {text: "King! This satyr will starve!!",
            textColor: COLOR_PLAYER,
            color: {r:140, g:70, b:35},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 1,
            progress: true},

        {text:"Hail King Midas!",
            textColor:{r:0, g:0, b:255},
            color:{r:0, g:0, b:255},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: false},

	    //Level 1-> Level 2 NPCs
	    {text: "Level 2 NPC text #1 ",
	    textColor: {r:119, g:220, b:33},
         color: {r:119, g:220, b:33},
         pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
	    radius: 3,
	    progress: false},

        {text: "Greetings, Midas. I am Dionysus.",
            textColor: {r:180, g:74, b:203},
            color: {r:180, g:74, b:203},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: true},
        //Level 2-> Level 3 NPCs
        {text: "Level 3 NPC text #1",
            textColor: {r:119, g:220, b:33},
            color: {r:119, g:220, b:33},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: false},

        {text: "Thank you for helping him",
            textColor: {r:180, g:74, b:203},
            color: {r:180, g:74, b:203},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: true},

        //Level 3-> Level 4 NPCs
        {text: "Level 4 NPC text #1",
            textColor: {r:119, g:220, b:33},
            color: {r:119, g:220, b:33},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: false},

        {text: "Fond of Silenus, I am",
            textColor: {r:180, g:74, b:203},
            color: {r:180, g:74, b:203},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: true},

        //Level 4-> Level 5 NPCs
        {text: "Level 5 NPC text #1",
            textColor: {r:119, g:220, b:33},
            color: {r:119, g:220, b:33},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: false},

        {text: "Name a reward; It's yours",
            textColor: {r:180, g:74, b:203},
            color: {r:180, g:74, b:203},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: true},

        //Level 5-> Level 6 NPCs
        {text: "Level 6 NPC text #1",
            textColor: {r:119, g:220, b:33},
            color: {r:119, g:220, b:33},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: false},

        {text: "Please be more specific, King",
            textColor: {r:180, g:74, b:203},
            color: {r:180, g:74, b:203},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: true},

        //Level 6-> Level 7 NPCs
        {text: "Level 7 NPC text #1",
            textColor: {r:119, g:220, b:33},
            color: {r:119, g:220, b:33},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: false},

        {text: "Be wise; Consider your words",
            textColor: {r:180, g:74, b:203},
            color: {r:180, g:74, b:203},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: true},

        //Level 7-> Level 8 NPCs
        {text: "Level 8 NPC text #1",
            textColor: {r:119, g:220, b:33},
            color: {r:119, g:220, b:33},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: false},

        {text: "Then I shall grant this",
            textColor: {r:180, g:74, b:203},
            color: {r:180, g:74, b:203},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: true},

        //Level 8-> Level 9 NPCs
        {text: "Level 9 NPC text #1",
            textColor: {r:119, g:220, b:33},
            color: {r:119, g:220, b:33},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: false},

        {text: "Greed will consume you, Mortal.",
            textColor: {r:180, g:74, b:203},
            color: {r:180, g:74, b:203},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: true},
        //Level 9-> Level 10 NPCs
        {text: "Level 10 NPC text #1",
            textColor: {r:119, g:220, b:33},
            color: {r:119, g:220, b:33},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: false},

        {text: "As you wish, Milord.",
            textColor: {r:180, g:74, b:203},
            color: {r:180, g:74, b:203},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: true},

        //Level 10-> Level 11 NPCs (TURN TO GOLD AS MIDAS APPROACHES- NO WORDS)
        {text: "... #1",
            textColor: {r:119, g:220, b:33},
            color: {r:119, g:220, b:33},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: false},

        {text: "... #2",
            textColor: {r:119, g:220, b:33},
            color: {r:119, g:220, b:33},
            pos: {x:PS.random(GRID_SIZE_H), y: PS.random(GRID_SIZE_V)},
            radius: 3,
            progress: true},
    ]
    const SPRITE_HEIGHT = 1;

    const COLOR_OBJ = {food: PS.COLOR_GREEN, gold:{r:231, g:167, b:19}, poison:{r:132,g:65,b:166}};
    const TICK_UPDATE = 20;
    const TICK_FALL = 6;
    const TICK_FALL_VARIANCE = 3;

    const MAX_HP = 3;

    let timers = [];
    let gameState = 0;
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
    let pathmap = null;
    let path = null;
    let interludePos = null;

    let touchState = null; //TODO changing this gives the player the golden touch/other touches

    let pulseState = false;

    const FCN_OBJ = {
        food:function(c) {
            //PS.debug("Food collected");
            const index = c?0:1;
            hunger[index]+=HUNGER_RESTORE;
        },
        gold:function(c) {
            //PS.debug("Gold collected");
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
        let c3 = {r:0,g:0,b:0},
            c4 = {r:0,g:0,b:0},
            c5 = {r:0,g:0,b:0};
        if (c1 !== Object(c1)) {
            PS.unmakeRGB(c1, c4);
            //PS.debug(c4.r);
        }
        else {
            c4 = c1;
        }
        if (c2 !== Object(c2)) {
            PS.unmakeRGB(c2, c5);
        }
        else {
            c5 = c2;
        }
        for (const prop in c3) {
            c3[prop] = (f)*c4[prop] + (1-f)*c5[prop];
            //PS.debug(c3[prop] + '\n' );
        }
        return c3;
    }

    const randomRange = function(min, max) {
        return Math.floor(Math.random()*(max-min)) + min
    }

    const fall = function() {
        if (gameState === 2 && levelRunning) {
            PS.gridPlane(LAYER_OBJ);
            //PS.alpha(PS.ALL, PS.ALL, 0);
            //Progress old
            for (let i = 0; i < falling.length; ++i) {
                let obj = falling[i];
                let removed = false;

                if (++obj.tick >= obj.tickFall) {
                    obj.tick = 0;

                    const oldPos = PS.spriteMove(obj.sprite, PS.CURRENT, PS.CURRENT);
                    let nx = oldPos.x + obj.dir.x,
                        ny = oldPos.y + obj.dir.y;
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

                    PS.spriteMove(obj.sprite, nx, ny);


                    if (ny >= GRID_SIZE_V-SPRITE_HEIGHT) {
                        if (isLane(nx)) {
                            FCN_OBJ[obj.prop](nx<SIZE_LANE);
                        }
                        falling.splice(i,1);
                        if (touching === i) {
                            touching = -1;
                        }
                        PS.spriteDelete(obj.sprite);
                        --i;
                        removed = true;
                    }
                    else if (nx !== 0 && isLane(nx)) {
                        obj.dir.x = 0;
                        obj.dir.y = 1;
                    }
                }
            }
            //Spawn new

            const OBJ_SIZE = 2;

            for (const property in currentTimer) {
                if (SPAWNS[level][property] > 0
                    && ++currentTimer[property] >= SPAWNS[level][property]) {
                    currentTimer[property] = 0;

                    let origX = randomRange(SIZE_LANE, GRID_SIZE_H-SIZE_LANE-OBJ_SIZE), xLoc = origX, found = false;
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
                        const spr = PS.spriteSolid(OBJ_SIZE,OBJ_SIZE);
                        falling.push({sprite:spr, prop:property, dir:{x:0, y:1},
                            tickFall:randomRange(1, TICK_FALL_VARIANCE+1), tick:0});
                        PS.spriteMove(spr, origX, 0);
                        PS.spriteSolidColor(spr, COLOR_OBJ[property]);
                        PS.spriteSolidAlpha(spr, 255);
                    }
                }
            }
            //Draw all
        }
    }

    const update = function() {
        if (gameState === 2 && levelRunning) {
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
                updateCharSprites();
            }
        }
        else if (gameState === 1 && !levelRunning) {
            pulseState = !pulseState;

            let nextPos;
            if (path !== null && path.length > 0) {
                nextPos = path.shift();
            }
            else {
                nextPos = [interludePos.x, interludePos.y];
            }

            PS.gridPlane(LAYER_SPR);

            let closest = null, ldsq = -1;
            for (let c = 0; c < INTERLUDES[level].length; ++c) {
                const character = CHARACTERS[INTERLUDES[level][c]],
                    fadeColor = pulseState?lerpColor(PULSE_WEIGHT, COLOR_PULSE, character.color):character.color,
                    dx = character.pos.x-nextPos[0], dy = character.pos.y-nextPos[1],
                    distSq = dx*dx+dy*dy;
                //Pulse character
                PS.fade(character.pos.x, character.pos.y, TICK_UPDATE);
                PS.color(character.pos.x, character.pos.y, fadeColor);

                //Distance check
                if (character.radius*character.radius >= distSq && (ldsq < 0 || distSq < ldsq)) {
                    closest = character;
                    ldsq = distSq;
                }
            }
            if (closest !== null) {
                PS.statusFade(0);
                PS.statusText(closest.text);
                PS.statusColor(closest.textColor);

                if (closest.progress) {
                    levelRunning = true;
                }
            }
            else {
                PS.statusFade(30); //TODO or background color
                PS.statusColor(PS.COLOR_WHITE);
            }

            const c1 = COLOR_PLAYER, c2 = lerpColor(PULSE_WEIGHT, COLOR_PULSE, COLOR_PLAYER),
                fadeColor = pulseState?c1:c2;

            if (interludePos.x === nextPos[0] && interludePos.y === nextPos[1]) {
                PS.color(interludePos.x, interludePos.y, pulseState?c2:c1);
            }
            else {
                PS.fade(interludePos.x, interludePos.y, 0);
                PS.alpha(interludePos.x, interludePos.y, 0);

                interludePos.x = nextPos[0];
                interludePos.y = nextPos[1];

                PS.alpha(interludePos.x, interludePos.y, 255);
                PS.color(interludePos.x, interludePos.y, pulseState?c2:c1);
                PS.fade(interludePos.x, interludePos.y, TICK_UPDATE);
                PS.color(interludePos.x, interludePos.y, fadeColor);

            }
        }
    }

    const startLevel = function() {
        hunger[0] = MAX_HUNGER;
        hunger[1] = MAX_HUNGER;
        hp = MAX_HP;

        PS.gridPlane(LAYER_OBJ);
        PS.alpha(PS.ALL, PS.ALL, 0);

        for (let s = 0; s < falling.length; ++s) {
            PS.spriteDelete(falling[s].sprite);
        }

        falling = [];
        currentUT = 0;
        path = null;
        interludePos = {x:8, y:0};

        if (INTERLUDES[level] === undefined
            || INTERLUDES[level] === null) {
            startGameplay();
        }
        else {
            for (let i = 0; i < sprites.length; ++i) {
                if (sprites[i] !== null) {
                    PS.deleteSprite(sprites[i]);
                }
            }

            PS.gridPlane(LAYER_BG);
            PS.color(PS.ALL, PS.ALL, {r:140, g:153, b:153});
            PS.gridPlane(LAYER_SPR);
            PS.alpha(PS.ALL, PS.ALL, 0);

            if (pathmap !== null) {
                PS.pathDelete(pathmap);
            }
	 	

			//load background image for interlude levels
			
	    if (level === 2){
				
	    interludeSprite = PS.imageLoad( "sprites/interludebg.png", interludeLoader);
            LOADED_SPRITES.push( interludeSprite );

	        } else if (level === 3 || level === 4) {
				
			twoSprite = PS.imageLoad( "sprites/level2.png", twoLoader);
            LOADED_SPRITES.push( twoSprite );
		    
		    } else if (level === 5 || level === 6) {
				
		    threeSprite = PS.imageLoad( "sprites/level3.png", threeLoader);
            LOADED_SPRITES.push( threeSprite );
				
			} else if (level === 8 || level === 7) {
				
			fourSprite = PS.imageLoad( "sprites/level4.png", fourLoader);
            LOADED_SPRITES.push( fourSprite );
				
			} else if (level === 10 || level === 9) {
				
			fiveSprite = PS.imageLoad( "sprites/level5.png", fiveLoader);
            LOADED_SPRITES.push( fiveSprite );
				
			} else if (level === 11) {
				
			}
		

            let img = Array.from({length: GRID_SIZE_V*GRID_SIZE_H}, _ => 1);
            for (let c = 0; c < INTERLUDES[level].length; ++c) {
                let character = CHARACTERS[INTERLUDES[level][c]];
                img[GRID_SIZE_H*character.pos.y+character.pos.x] = 0;
                PS.color(character.pos.x, character.pos.y, character.color);
                PS.alpha(character.pos.x, character.pos.y, 255);
            }
            pathmap = PS.pathMap({source: "", id:"map", pixelSize: 1, data:img, width:GRID_SIZE_H, height:GRID_SIZE_V});

            PS.color(interludePos.x, interludePos.y, COLOR_PLAYER);
            PS.alpha(interludePos.x, interludePos.y, 255);

            PS.statusColor(COLOR_PLAYER);
            PS.statusText("Move via click");	    

            gameState = 1;
            levelRunning = false;
        }
    }

    const startGameplay = function() {
        PS.gridPlane(LAYER_SPR);
        PS.fade(PS.ALL, PS.ALL, 0);
        PS.alpha(PS.ALL, PS.ALL, 0)

        PS.gridPlane(LAYER_BG);
        PS.alpha(PS.ALL, PS.ALL, 255);
      /*  for (let y = 0; y < GRID_SIZE_V; ++y) {
            for (let x = 0; x < GRID_SIZE_H; ++x) {
                PS.color(x, y, isLane(x)?COLOR_LANE:COLOR_BG);
            }
        } */
	    
        gameState = 2;
        levelRunning = false;
	    
        gameSprite = PS.imageLoad( "sprites/gameplay.png", gameLoader);
        LOADED_SPRITES.push( gameSprite );	

        PS.statusColor(COLOR_PLAYER);
        PS.statusText(MESSAGES[level] + " [Score: " + goldCollected + "]");
        updateCharSprites();   

    }

    const updateCharSprites = function() {

        const pos = [{x:0, y:GRID_SIZE_V - SPRITE_HEIGHT}, {x:GRID_SIZE_H - SIZE_LANE, y:GRID_SIZE_V - SPRITE_HEIGHT}];

        PS.gridPlane(LAYER_SPR);
        PS.alpha(PS.ALL, PS.ALL, 0);

        for (let i = 0; i < sprites.length; ++i) {
            if (sprites[i] !== null) {
                PS.deleteSprite(sprites[i]);
            }

	    //Load bg, satyr and midas sprites		            
		
            satyrSprite = PS.imageLoad( "sprites/satyr.png", satyrLoader);
            LOADED_SPRITES.push( satyrSprite );
			
	    midasSprite = PS.imageLoad( "sprites/midas.png", midasLoader);
            LOADED_SPRITES.push( midasSprite );
			
            PS.statusText(MESSAGES[level] + " [Score: " + goldCollected + "]");
        }
    }

    const gameOver = function() {

        if (timers.length > 0) {
            for (let i = 0; i < timers.length; ++i) {
                PS.timerStop(timers[i]);
            }
        }
        gameState = 0;

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

            interludeSprite = PS.imageLoad( "sprites/interludebg.png", interludeLoader);
            LOADED_SPRITES.push( interludeSprite );

            startLevel();
        },
        onLogin : function() {
            gameState = 1;

            timers.push(PS.timerStart(TICK_UPDATE, update));
            timers.push(PS.timerStart(TICK_FALL, fall));
        },
        touch : function(x,y,data,options) {
            if (gameState === 2) {
                if (levelRunning) {
                    const minDistSq = 4;
                    let closest = -1;
                    let cdsq = -1;
                    for (let i = 0; i < falling.length; ++i) {
                        let obj = falling[i];
                        if (obj.tickFall > 0) {
                            const pos = PS.spriteMove(obj.sprite, PS.CURRENT, PS.CURRENT);
                            const dx = pos.x-x, dy = pos.y-y,
                                distSq = dx*dx+dy*dy;
                            if (distSq < minDistSq && (cdsq < 0 || distSq < cdsq)) {
                                closest = i;
                                cdsq = distSq;
                            }
                        }
                    }
                    if (closest >= 0) {
                        touching = closest;
                        if (touchState !== null) {
                            falling[i].prop = touchState; //Overwrite original state
                        }
                    }
                }
                else {
                    levelRunning = true;
                }
            }
            else if (gameState === 1) {
                if (levelRunning) { //Used as more of a general flag now
                    startGameplay();
                }
                else {
                    path = PS.pathFind(pathmap, interludePos.x, interludePos.y,x, y);
                }
            }
        },
        enter : function(x,y,data,options) {
            //Nothing for now
        },
        release : function(x, y, data, options) {
            if (touching >= 0 && falling[touching] !== undefined) {
                let obj = falling[touching];
                obj.dir.x = Math.sign(x-PS.spriteMove(obj.sprite).x);
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
    PS.border(PS.ALL, PS.ALL, 0);

    PS.dbLogin( DB, onLogin, { active : false } );


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


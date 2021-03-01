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

const TKID = ( function () {

    const DB = "purtorqlack";
    const EMAIL = "himiller";

    const GRID_SIZE = 15;

    const LAYER_ENVIR = 0;
    const LAYER_OVERLAY = 1;
    const LAYER_ENTITY = 2;
    const LAYER_PLAYER = 3;
    const LAYER_INDICATOR_E = 4;

    const COLOR_OVERLAY = {r:100,g:100,b:100};
    const COLOR_PLAYER = {r:105,g:56,b:250};
    const ALPHA_INDICATOR = 128;

    const COLOR_WALL = {r:194,g:214,b:214};
    const COLOR_FLOOR = {r:252,g:252,b:252};
    const COLOR_FLOOR_2 = {r:51, g:51, b:51};
    const ALPHA_ENVIR = 255;

    const COLOR_EXIT = {r:48, g:232, b:48}
    const GLYPH_EXIT = 0x21EE;

    const COLOR_FIRE = {r:226, g:140, b:54};

    const POWER_USE = 4
    const POWERUP_MAX = 3;
    const EXIT = 2;
    const WALL = 1;
    const FLOOR = 0;

    const ENEMY_POINTS = 10;
    const LEVEL_POINTS = 50;
    const SCREEN_MINCOUNT = 2;
    const TICKS_ANIMATION = 5;

    const LEVEL_SIZE_SCALAR = 0.5;
    const LEVEL_SIZE_MAX = 8;
    const ROOM_DIVISION_CHANCE = .2;
    const ROOM_SIZE = 15;

    const ENEMY_MIN = 1;
    const ENEMY_MAX = 2;
    const ENEMY_SCALAR = 0.2;
	
    let tutorial = true;

    	
    //------------------------------------------------------------AUDIO---------------------------------------------------------------
	
    var death_id = "";
	var death_jingle_id = "";
	var enemy_death_id = "";
	var fireball_id = "";
	var music_id = "";
	var kill_id = "";
	var placement_id = "";

    //Audio Loaders

    var deathloader = function( data ) {
       death_id = data.channel;
    };
    var jingleloader = function( data ) {
       death_jingle_id = data.channel;
    };
    var enemyloader = function( data ) {
       enemy_death_id = data.channel;
    };
    var fireloader = function( data ) {
       fireball_id = data.channel;
    };
    var musicloader = function( data ) {
       music_id = data.channel;
    };
    var killloader = function(data) {
	kill_id = data.channel;
    };
    var placementloader = function( data ) {
       placement_id = data.channel;
    };


    PS.audioLoad("death", {
	path: "audio/",
        onLoad: deathloader
    });

    PS.audioLoad("death_jingle", {
	path: "audio/",
        onLoad: jingleloader
    });

    PS.audioLoad("enemy_death", {
	path: "audio/",
        onLoad: enemyloader
    });

    PS.audioLoad("fireball", {
	path: "audio/",
        onLoad: fireloader
    });

    PS.audioLoad("music", {
	path: "audio/",
        autoplay: true,
        volume: 0.02,
        loop: true,
        onLoad: musicloader
    });

    PS.audioLoad("placement", {
	path: "audio/",
        onLoad: placementloader
    });
	
	PS.audioLoad("kill", {
		path: "audio/",
		onLoad: killloader
	});

    //Tutorial stuff

    const tutorialLevels = [
        //Moving
        [
            [1,1,1,1,1,1,1,1],
            [1,0,0,2,2,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1]
        ],
        //Enemy
        [
            [1,1,1,1,1,1,1],
            [1,0,0,2,0,0,1],
            [1,0,0,0,0,0,1],
            [1,1,1,0,1,1,1],
            [1,1,1,0,1,1,1],
            [1,0,0,0,0,0,1],
            [1,0,0,0,0,0,1],
            [1,0,0,0,0,0,1],
            [1,1,1,1,1,1,1]
        ],
        //Powerup
        [
            [1,1,1,1,1,1,1,1],
            [1,0,0,2,2,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,4,4,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1]
        ]
    ];
    const tutorialPlayer = [
        {x:3, y:6},
        {x:3, y:7},
        {x:3, y:5}
    ];
    const tutorialEnemies = [
        //Moving
        [], //None
        //Enemy
        [{type: 0, pos:{x:3, y:2}}], //1 pawn
        //Powerup
        [] //None
    ];
    const tutorialQuadrantAlpha = [
        200,
        100,
        50
    ]
    const tutorialStatus = [
        "Press a quadrant to move in that direction",
        "Avoid threatened tiles",
        "Press and drag on player to use a power up"
    ];

    //End tutorial stuff

    let mapData = [];

    let playerTurn = true;

    let playerPos = {x:0, y:0}
    let fireball = null;
    let maxUse = 1;
    let currentUse = 0;

    let enemyList;
    let enemies = [];

    let animateEnemy = 0; //Index of current enemy

    let gameRunning = false; //Playing?
    let timers = []; //Timers
    let score = 0;
    let level = 0; //Level the player is on

    const SCORE_PREFIX = "[Score: "
    const SCORE_SUFFIX = "] "

    let statusMessage = ""
    let skipAnim = false; //For skipping past animations
    let lastTouch = {x:0, y:0}; //Last touched position
    const DRAG_MIN_SQ = 4;

    //----------------------------------------------*DB*---------------------------------------------------
    //Variables for DB operations

    let moves = 0;
    let roomsCompleted = 0;

    //-----------------------------------------------------------------------------------------------------

    const generateMap = function() {
        enemies = [];
        if (level < tutorialLevels.length) {
            currentUse = 0;
            mapData = tutorialLevels[level];
            for (let e = 0; e < tutorialEnemies[level].length; ++e) {
                let enemy = tutorialEnemies[level][e];
                addEnemy(enemyList[enemy.type](enemy.pos));
            }
            playerPos = tutorialPlayer[level];
            statusMessage = tutorialStatus[level];

            PS.border(PS.ALL, PS.ALL, 0);

            PS.gridPlane(LAYER_OVERLAY);
            for (let i = 0; i < GRID_SIZE/2; ++i) {
                let neg = GRID_SIZE - i - 1;
                PS.color(i, i, COLOR_OVERLAY);
                PS.alpha(i, i, tutorialQuadrantAlpha[level]);
                PS.color(neg, i, COLOR_OVERLAY);
                PS.alpha(neg, i, tutorialQuadrantAlpha[level]);
                PS.color(i, neg, COLOR_OVERLAY);
                PS.alpha(i, neg, tutorialQuadrantAlpha[level]);
                PS.color(neg, neg, COLOR_OVERLAY);
                PS.alpha(neg, neg, tutorialQuadrantAlpha[level]);
            }
        }
        else {
            tutorial = false;

            currentUse = maxUse;
            statusMessage = "";

            PS.gridPlane(LAYER_OVERLAY);
            PS.alpha(PS.ALL, PS.ALL, 0);
            //Make shape
            let maxDim = Math.floor(level * LEVEL_SIZE_SCALAR) + 2;
            if (maxDim > LEVEL_SIZE_MAX) {
                maxDim = LEVEL_SIZE_MAX;
            }

            let template = Array(maxDim), visited = Array(maxDim);
            for (let i = 0; i < maxDim; ++i) {
                template[i] = Array(maxDim);
                visited[i] = Array(maxDim);
                for (let j = 0; j < maxDim; ++j) {
                    template[i][j] = [false, false, false, false];
                    visited[i][j] = false;
                }
            }
            //up, right, down, left (opp = +2)
            const directions = [{r: -1, c: 0}, {r: 0, c: 1}, {r: 1, c: 0}, {r: 0, c: -1}];

            visited[0][0] = true;
            let heads = [{r: 0, c: 0}];
            let lastRoom = heads[0];

            //Modified breadth first search
            while (heads.length > 0) {
                for (let h = 0; h < heads.length; ++h) {
                    let head = heads[h], start = Math.floor(4 * Math.random()), //choose a random direction
                        dir = start, found = 0,
                        split = (head.r === 0 && head.c === 0 && ROOM_DIVISION_CHANCE > 0) || Math.random() < ROOM_DIVISION_CHANCE; //Split chance
                    do {
                        let nr = head.r + directions[dir].r, nc = head.c + directions[dir].c;
                        if (nr >= 0 && nr < maxDim && nc >= 0 && nc < maxDim
                            && visited[nr][nc] === false) {

                            template[head.r][head.c][dir] = true;
                            template[nr][nc][(dir + 2) % 4] = true;

                            visited[nr][nc] = true;

                            let newHead = {r: nr, c: nc};
                            lastRoom = newHead;

                            ++found;
                            if (split) {
                                if (found === 1) {
                                    heads.push(newHead);
                                } else {
                                    heads[h] = newHead;
                                    break;
                                }
                            } else {
                                heads[h] = newHead;
                                break;
                            }
                        }
                        dir = (dir + 1) % 4;
                    } while (dir !== start);

                    if (found === 0) {
                        heads.splice(h, 1);
                        --h;
                    }
                }
            }

            let maxDimRoom = maxDim * ROOM_SIZE;

            //make matrix
            let data = Array(maxDimRoom);
            for (let i = 0; i < maxDimRoom; ++i) {
                data[i] = Array(maxDimRoom);
                for (let j = 0; j < maxDimRoom; ++j) {
                    data[i][j] = WALL;
                }
            }

            for (let i = 0; i < maxDim; ++i) {
                let str = "|";
                for (let j = 0; j < maxDim; ++j) {
                    for (let k = 0; k < 4; ++k) {
                        str += template[i][j][k].toString() + ',';
                    }
                    str += "|";
                }
                //console.log(str+'\n');
            }


            //fill out walls
            for (let i = 0; i < maxDimRoom; ++i) {
                for (let j = 0; j < maxDimRoom; ++j) {
                    let roomRow = Math.floor(i / ROOM_SIZE),
                        roomCol = Math.floor(j / ROOM_SIZE);

                    if (visited[roomRow][roomCol] === true) {
                        if (i % ROOM_SIZE === 0) {
                            data[i][j] = generateHelper(directions, template, j, roomRow, roomCol, 0);
                        } else if (i % ROOM_SIZE === ROOM_SIZE - 1) {
                            data[i][j] = generateHelper(directions, template, j, roomRow, roomCol, 2);
                        } else if (j % ROOM_SIZE === 0) {
                            data[i][j] = generateHelper(directions, template, i, roomRow, roomCol, 3);
                        } else if (j % ROOM_SIZE === ROOM_SIZE - 1) {
                            data[i][j] = generateHelper(directions, template, i, roomRow, roomCol, 1);
                        } else {
                            data[i][j] = FLOOR;
                        }
                    }
                }
            }

            const ROOM_VAR = ROOM_SIZE - 2;

            //Assignments
            mapData = data;
            playerPos = {x: Math.floor(ROOM_SIZE / 2), y: Math.floor(ROOM_SIZE / 2)};

            //post processing

            //Add exit
            mapData[lastRoom.r * ROOM_SIZE + Math.floor(Math.random() * ROOM_VAR) + 1]
                [lastRoom.c * ROOM_SIZE + Math.floor(Math.random() * ROOM_VAR) + 1] = EXIT;

            //Place enemies
            for (let roomRow = 0; roomRow < maxDim; ++roomRow) {
                for (let roomCol = 0; roomCol < maxDim; ++roomCol) {
                    if ((roomRow !== 0 || roomCol !== 0) && visited[roomRow][roomCol] === true) {
                        let numEnemies = Math.floor(Math.random() * (ENEMY_MAX + (level * ENEMY_SCALAR))) + ENEMY_MIN;
                        for (let e = 0; e < numEnemies; ++e) {
                            let spawn = {
                                x: roomCol * ROOM_SIZE + (Math.floor(Math.random() * (ROOM_SIZE - 2))) + 1,
                                y: roomRow * ROOM_SIZE + (Math.floor(Math.random() * (ROOM_SIZE - 2))) + 1
                            };
                            if (mapData[spawn.y][spawn.x] === FLOOR) {
                                addEnemy(enemyList[Math.floor(enemyList.length * Math.random())](spawn));

                            }
                        }
                    }
                }
            }

            //Output debugging
            /*
            for (let i = 0; i < maxDimRoom; ++i) {
                let str = "";
                for (let j = 0; j < maxDimRoom; ++j) {
                    str += (data[i][j].toString() +  ",");
                }
                console.log(str+'\n');
            }
             */
        }
        updateStatusLine();
        ++level;
    }

    const generateHelper = function(directions, template, index, roomRow, roomCol, dir) {
        if ( Math.abs((index%ROOM_SIZE)-(ROOM_SIZE/2)) <= 1) { //3 Wide
            //console.log("row: " + roomRow + " col: " + roomCol + " dir: " + dir + " template: " + template[roomRow][roomCol][dir]);
            if (template[roomRow][roomCol][dir] === true) {
                return FLOOR;
            }
        }
        return WALL;
    }

    const makeGenericEnemy = function(pos) {
        return {
            pos:pos,
            color:PS.COLOR_RED,
            glyph:'G',
            screenCount: 0,
            data:null,
            getThreat : function() {
                let threat = [];
                return threat;
            },
            doMove : function() {
                return false;
            }
        };
    }

    const makeGenericCombo = function() {
        return {
            moves: [],
            getThreat : function(current) {
                let threat = [];
                return threat;
            },
            doMove : function(current) {
                return false;
            }
        }
    }

    const makePawn = function(pos) {
        return {
            pos:pos,
            color:{r:236, g:19, b:19},
            glyph: 0x265F,
            screenCount: 0,
            data:null,
            dir: null,
            getThreat : function() {
                this.adjustDir();
                let threat = [],
                    perp = {x:this.dir.x === 0?1:0, y:this.dir.y===0?1:0};

                for (let i = -1; i <= 1; ++i) {
                    let dest = addPos(this.pos, addPos(this.dir, {x:perp.x*i, y:perp.y*i}));
                    if (!oobm(dest) && mapData[dest.y][dest.x] === FLOOR) {
                        threat.push(dest);
                    }
                }
                return threat;
            },
            doMove : function() {
		    
				PS.audioPlayChannel( placement_id );
                this.adjustDir();
                let threat = this.getThreat();
                for (let i = 0; i < threat.length; ++i) {
                    if (equalPos(playerPos, threat[i])) {
                        moveEnemy(this, threat[i]);
                        return false;
                    }
                }

                let dPlayer = subPos(playerPos, this.pos);
                if ( (this.dir.x !== 0 && Math.sign(dPlayer.x) === this.dir.x)
                    || (this.dir.y !== 0 && Math.sign(dPlayer.y) === this.dir.y))
                {
                    moveEnemy(this, addPos(this.pos, this.dir));
                }
                return false; //Done
            },
            adjustDir : function() {
                if (this.dir === null) {
                    let dPlayer = subPos(playerPos, this.pos);
                    if (Math.abs(dPlayer.x) > Math.abs(dPlayer.y)) {
                        this.dir = {x:Math.sign(dPlayer.x), y:0};
                    }
                    else {
                        this.dir = {y:Math.sign(dPlayer.y), x:0};
                    }
                }
            }
        };
    }
    const makeRook = function(pos) {
        return {
            pos:pos,
            color:PS.COLOR_ORANGE,
            glyph: 0x265C,
            screenCount: 0,
            data:null,
            getThreat : function() {
                let threat = getThreatRay(this.pos, {x:1, y:0});
                threat = threat.concat(getThreatRay(this.pos, {x:-1, y:0}));
                threat = threat.concat(getThreatRay(this.pos, {x:0, y:1}));
                threat = threat.concat(getThreatRay(this.pos, {x:-0, y:-1}));
                return threat;
            },
            doMove : function() {
				PS.audioPlayChannel( placement_id );
                let dPos = subPos(playerPos, this.pos);
                if (this.data === undefined || this.data === null) {
                    //Decide direction
                    if (Math.abs(dPos.x) > Math.abs(dPos.y)) {
                        this.data = {x:dPos.x, y:0};
                    }
                    else {
                        this.data = {x:0, y:dPos.y}
                    }
                }

                if (this.data.x < 0) {
                    ++this.data.x;
                    return moveEnemy(this, addPos(this.pos, {x:-1, y:0}));
                }
                else if (this.data.x > 0) {
                    --this.data.x;
                    return moveEnemy(this, addPos(this.pos, {x:1, y:0}));
                }
                else if (this.data.y < 0) {
                    ++this.data.y;
                    return moveEnemy(this, addPos(this.pos, {x:0, y:-1}));
                }
                else if (this.data.y > 0) {
                    --this.data.y;
                    return moveEnemy(this, addPos(this.pos, {x:0, y:1}));
                }
                else {
                    return false; //Done
                }
            }
        };
    }

    const makeKnight = function(pos) {

        return {
            pos:pos,
            color:{r:140,g:70,b:10},
            glyph: 0x265E,
            screenCount: 0,
            data:null,
            getThreat : function() {
                return getKnightMoves(this.pos);
            },
            doMove : function() {
				PS.audioPlayChannel( placement_id );
                let moves = getKnightMoves(this.pos);

                if (moves.length === 0) {
                    return false;
                }
                else {
                    let leastDSq = -1;
                    let leastMove = undefined;

                    for (let i = 0; i < moves.length; ++i) {
                        let move = moves[i],
                            dPlayer = subPos(playerPos, move),
                            distSq = dPlayer.x*dPlayer.x+dPlayer.y*dPlayer.y;
                        if (mapData[move.y][move.x] === FLOOR
                            && (leastDSq < 0 || distSq < leastDSq)) {
                                leastMove = move;
                                leastDSq = distSq;
                        }
                    }
                    if (leastMove !== undefined) {moveEnemy(this, leastMove);}
                    return false;
                }
            }
        };
    }

    const getKnightMoves = function(pos) {
        let moves =  [
            addPos(pos, {x:2, y:1}),
            addPos(pos, {x:2, y:-1}),
            addPos(pos, {x:-2, y:1}),
            addPos(pos, {x:-2, y:-1}),
            addPos(pos, {x:1, y:2}),
            addPos(pos, {x:-1, y:2}),
            addPos(pos, {x:1, y:-2}),
            addPos(pos, {x:-1, y:-2}),
        ], result = [];
        for (let i = 0; i < moves.length; ++i) {
            let move = moves[i];
            if (!oobm(move) && mapData[move.y][move.x] === FLOOR) {
                result.push(move);
            }
        }
        return result;
    }

    const makeBishop = function(pos) {


        return {
            pos:pos,
            color:{r:127, g:0, b:127},
            glyph: 0x265D,
            screenCount: 0,
            data:null,
            getThreat : function() {
                let threat = getThreatRay(this.pos, {x:1, y:1});
                threat = threat.concat(getThreatRay(this.pos, {x:-1, y:1}));
                threat = threat.concat(getThreatRay(this.pos, {x:1, y:-1}));
                threat = threat.concat(getThreatRay(this.pos, {x:-1, y:-1}));
                return threat;
            },
            doMove : function() {
				PS.audioPlayChannel( placement_id );
                let dPos = subPos(playerPos, this.pos);
                if (this.data === undefined || this.data === null) {
                    //If player on line -> try kill:
                    if (Math.abs(dPos.x) === Math.abs(dPos.y)) {
                        this.data = {dir:{x:Math.sign(dPos.x), y:Math.sign(dPos.y)}, remaining: Math.abs(dPos.x)};
                    }
                    //Move towards
                    else {
                        let modX = Math.sign(dPos.x), modY = Math.sign(dPos.y);
                        if (modX === 0) {
                            modX = Math.random()<.5?-1:1
                        }
                        if (modY === 0) {
                            modY = Math.random()<.5?-1:1
                        }
                        this.data = {dir:{x:modX, y:modY}, remaining:Math.floor(Math.random()*GRID_SIZE)};
                    }
                }
                if (this.data.remaining-- <= 0) {
                    return false;
                }
                else {
                    return moveEnemy(this, addPos(this.pos, this.data.dir));
                }
            }
        };
    }

    const makeFireball = function(dir) {
	    
	PS.audioPlayChannel( fireball_id );
	    
        return {
            dir: dir,
            pos: addPos(playerPos, {x:0, y:0}),
            doMove : function() {
                let newPos = addPos(this.pos, dir),
                    oldPixel = coordsToPixel(this.pos),
                    newPixel = coordsToPixel(newPos);

                PS.gridPlane(LAYER_ENTITY);

                if (!oobp(oldPixel) && !oobm(this.pos)) {
                    PS.alpha(oldPixel.x, oldPixel.y, 0);
                }
                if (!oobp(newPixel) && !oobm(newPos)) {
                    removeEnemyAt(newPos, true); //Kill enemies at this position
                    PS.alpha(newPixel.x, newPixel.y, 255);
                    PS.color(newPixel.x, newPixel.y, COLOR_FIRE);
                    //PS.radius(newPixel.x, newPixel.y, 50);
                    this.pos = newPos;
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    }

    const getThreatRay = function(start, dir, max=-1) {
        let threat = [], pos = start;
        while (max !== 0 && !oobm(pos) && mapData[pos.y][pos.x] !== WALL) {
            threat.push(pos);
            pos = addPos(pos, dir);
            --max;
        }
        return threat;
    }

    const addEnemy = function(enemy) {
        enemies.push(enemy);
        mapData[enemy.pos.y][enemy.pos.x] = -enemies.length;
    }

    const animateAll = function() {
        if (!playerTurn) {
            let animated = false;
            while (!animated || skipAnim) {
                animated = false;
                if (fireball !== null) {
                    if (fireball.doMove()) {
                        animated = true;
                    }
                    else {
                        fireball = null;
                    }
                }
                else if (animateEnemy < enemies.length) {
                    let enemy = enemies[animateEnemy];
                    if (enemy !== undefined) {
                        if (enemy.screenCount >= SCREEN_MINCOUNT && enemy.doMove()) {
                            animated = true;
                        } else {
                            enemy.data = null;
                            ++animateEnemy;
                        }
                    }
                    else {
                        ++animateEnemy;
                    }
                }
                else {
                    animateEnemy = 0;

                    //Draw enemy indicators
                    PS.gridPlane(LAYER_INDICATOR_E);
                    PS.alpha(PS.ALL, PS.ALL, 0);
                    for (let i = 0; i < enemies.length; ++i) {
                        let enemy = enemies[i];
                        if (enemy !== undefined && enemy.screenCount >= SCREEN_MINCOUNT-1) {
                            let threatList = enemy.getThreat();
                            for (let i = 0; i < threatList.length; ++i) {
                                let threat = coordsToPixel(threatList[i]);
                                if (!oobp(threat)) {
                                    PS.alpha(threat.x, threat.y, ALPHA_INDICATOR);
                                    PS.color(threat.x, threat.y, enemy.color);
                                }
                            }
                        }
                    }
                    skipAnim = false;
                    animated = true;
                    playerTurn = true; //Player turn again
                }
            }
        }
    }

    const gameOver = function() {
	    
	PS.audioPlayChannel( death_id );
	PS.audioPlayChannel( death_jingle_id );
	PS.audioStop( music_id);
	
        gameRunning = false;
        for (let t = 0; t < timers.length; ++t) {
            PS.timerStop(timers[t]);
        }
        timers = [];
        PS.statusText("Game Over | Final Score: " + score);


        //----------------------------------------------*DB*---------------------------------------------------
        //Finalizes all data we have collected and sends to himiller@wpi.edu

        if ( PS.dbValid( DB ) ) {

            PS.dbEvent(DB, "Points", score);
            PS.dbEvent(DB, "Moves", moves);
            PS.dbEvent(DB, "Rooms", roomsCompleted);
            PS.dbEvent(DB, "Game Over", true);

            PS.dbSend( DB, EMAIL, { discard : true } );
        }
    }

    const coordsToPixel = function(pos) {
        return {
            x:pos.x-Math.floor(playerPos.x - GRID_SIZE / 2 + 1),
            y:pos.y-Math.floor(playerPos.y - GRID_SIZE / 2 + 1)
        };
    }

    const oobp = function(pixel) { //Out of bounds pixel
        return pixel.x < 0 || pixel.x >= GRID_SIZE
            || pixel.y < 0 || pixel.y >= GRID_SIZE;
    }

    const oobm = function(pos) { //Out of bounds map
        return pos.x < 0 || pos.x >= mapData[0].length
            || pos.y < 0 || pos.y >= mapData.length;
    }

    const removeEnemyAt = function (pos, redraw) {

	PS.audioPlayChannel( kill_id );

        let enemyIndex = mapData[pos.y][pos.x];

        if (enemyIndex < 0) {
            enemies[-(enemyIndex + 1)] = undefined;
            mapData[pos.y][pos.x] = FLOOR;

            if (redraw) {
                let pixel = coordsToPixel(pos);
                if (!oobp(pixel)) {
                    PS.gridPlane(LAYER_ENTITY);
                    PS.alpha(pixel.x, pixel.y, 0);
                    PS.glyph(pixel.x, pixel.y, '');
                }
            }
            score += ENEMY_POINTS;
            updateStatusLine();

            //Spawn enemy
            //addEnemy(makeRook({x:PS.random(GRID_SIZE - 1), y:PS.random(GRID_SIZE - 1)}));

        }
    }

    const moveEnemy = function(enemy, newPos) {
	    
        if (oobm(newPos)) {
            return false; //Stop - out of bounds
        }
        let pixel = coordsToPixel(newPos);
        if (oobp(pixel)) {
            return false; //Stop - went off screen
        }
        else if (mapData[newPos.y][newPos.x] !== FLOOR) {
            return false; //Stop - cannot move into wall or other enemies
        }
        else {
            let index = mapData[enemy.pos.y][enemy.pos.x],
                oldPixel = coordsToPixel(enemy.pos);

            mapData[enemy.pos.y][enemy.pos.x] = FLOOR;
            mapData[newPos.y][newPos.x] = index;

            PS.gridPlane(LAYER_ENTITY);
            if (oldPixel.x > 0 && oldPixel.y > 0) {
                PS.alpha(oldPixel.x, oldPixel.y, 0);
                PS.glyph(oldPixel.x, oldPixel.y, '');
                PS.color(pixel.x, pixel.y, enemy.color);
                PS.glyph(pixel.x, pixel.y, enemy.glyph);
                PS.alpha(pixel.x, pixel.y, 255);
            } else if (oldPixel.x < 0){
                PS.alpha(-oldPixel.x, oldPixel.y, 0);
                PS.glyph(-oldPixel.x, oldPixel.y, '');
                PS.color(pixel.x, pixel.y, enemy.color);
                PS.glyph(pixel.x, pixel.y, enemy.glyph);
                PS.alpha(pixel.x, pixel.y, 255);
            } else if (oldPixel.y < 0){
                PS.alpha(oldPixel.x, -oldPixel.y, 0);
                PS.glyph(oldPixel.x, -oldPixel.y, '');
                PS.color(pixel.x, pixel.y, enemy.color);
                PS.glyph(pixel.x, pixel.y, enemy.glyph);
                PS.alpha(pixel.x, pixel.y, 255);
            } else if (oldPixel.x < 0 && oldPixel.y < 0) {
                PS.alpha(-oldPixel.x, -oldPixel.y, 0);
                PS.glyph(-oldPixel.x, -oldPixel.y, '');
                PS.color(pixel.x, pixel.y, enemy.color);
                PS.glyph(pixel.x, pixel.y, enemy.glyph);
                PS.alpha(pixel.x, pixel.y, 255);
            }

            enemy.pos = newPos;
            //PS.debug("x: " + enemy.pos.x + " pixelX: " + pixel.x);
            //PS.debug(" y: " + enemy.pos.y + " pixelY: " + pixel.y);
            //PS.debug("\n");
            if (equalPos(newPos, playerPos)) {
                gameOver();
                return false; //Stop - game over
            }
            else {
                return true;
            }
        }
    }

    /*
    const toIndex = function(pos) {
        return pos.x + pos.y*GRID_SIZE;
    }

    const fromIndex = function(index) {
        return {x:index%GRID_SIZE, y:Math.floor(index/GRID_SIZE)};
    }
     */

    const addPos = function(pos1, pos2) {
        return {x:pos1.x+pos2.x, y:pos1.y+pos2.y};
    }

    const subPos = function(pos1, pos2) {
        return {x:pos1.x-pos2.x, y:pos1.y-pos2.y};
    }

    const equalPos = function(pos1, pos2) {
        return pos1.x===pos2.x && pos1.y===pos2.y;
    }

    const updateStatusLine = function() {
        if (statusMessage.length > 0) {
            PS.statusText(statusMessage);
        }
        else {
            PS.statusText(SCORE_PREFIX + score + SCORE_SUFFIX + " Fireballs: " + currentUse + "/" + maxUse);
        }
    }

    const redrawScreen = function() {
	    
        let yOffset = Math.floor(playerPos.y - GRID_SIZE / 2 + 1),
            xOffset = Math.floor(playerPos.x - GRID_SIZE / 2 + 1);

        //Reset enemies
        for (let i = 0; i < enemies.length; ++i) {
            let enemy = enemies[i];
            if (enemy === undefined) {continue;}
            if (enemy.screenCount <= 0) {
                enemy.screenCount = 0;
            } else {
                enemy.screenCount *= -1;
            }
        }

        PS.gridPlane(LAYER_ENVIR);

        PS.color(PS.ALL, PS.ALL, COLOR_FLOOR);

            for (let i = 0; i < GRID_SIZE; i++) {
                for (let j = 0; j < GRID_SIZE; j++) {

                    if ((i + j + playerPos.x + playerPos.y) % 2 == 0) {
                        PS.color(i, j, COLOR_FLOOR_2);
                    }

                }
            }

        PS.gridPlane(LAYER_ENTITY);
        PS.alpha(PS.ALL, PS.ALL, 0);
        PS.gridPlane(LAYER_INDICATOR_E);
        PS.alpha(PS.ALL, PS.ALL, 0);
        PS.glyph(PS.ALL, PS.ALL, '');


            for (let y = 0; y < GRID_SIZE; ++y) {
                let yMod = y + yOffset;
                let bounds = yMod < 0 || yMod >= mapData.length;
                for (let x = 0; x < GRID_SIZE; ++x) {
                    let xMod = x + xOffset;
                    if (bounds || xMod < 0 || xMod >= mapData[0].length
                        || mapData[yMod][xMod] === WALL) {
                        PS.gridPlane(LAYER_ENVIR);
                        PS.color(x, y, COLOR_WALL);
                    } else {
                        let data = mapData[yMod][xMod];
                        if (data < 0 && -(data + 1) < enemies.length) {
                            let enemy = enemies[-(data + 1)];
                            enemy.screenCount = (-enemy.screenCount) + 1;
                            PS.gridPlane(LAYER_ENTITY);
                            PS.alpha(x, y, 255);
                            PS.glyph(x, y, enemy.glyph);
                            PS.color(x, y, enemy.color);
                        } else if (data === EXIT) {
                            PS.gridPlane(LAYER_ENVIR);
                            PS.glyph(x, y, GLYPH_EXIT);
                            PS.color(x, y, COLOR_EXIT);
                        }
                        else if (data === POWERUP_MAX) {
                            //TODO Hannah
                        }
                        else if (data === POWER_USE) {
                            //TODO Hannah
                        }
                    }
                }
            }
        }


    return {
        init: function() {

            PS.gridSize(GRID_SIZE, GRID_SIZE);

            PS.gridPlane(LAYER_ENVIR);
            PS.alpha(PS.ALL, PS.ALL, ALPHA_ENVIR);

            PS.gridPlane(LAYER_PLAYER);
            PS.alpha(Math.floor(GRID_SIZE/2), Math.floor(GRID_SIZE/2), 200);
            PS.color(Math.floor(GRID_SIZE/2), Math.floor(GRID_SIZE/2), COLOR_PLAYER);
            PS.radius(Math.floor(GRID_SIZE/2), Math.floor(GRID_SIZE/2), 10);
            PS.scale(Math.floor(GRID_SIZE/2), Math.floor(GRID_SIZE/2), 95);
            PS.glyph(Math.floor(GRID_SIZE/2), Math.floor(GRID_SIZE/2), 0x2659);

            enemyList = [makePawn, makeRook, makeKnight, makeBishop];

            generateMap();
            redrawScreen();
        },
        onLogin : function() {
          gameRunning = true;
          //Start the animation clock
          timers.push(PS.timerStart(TICKS_ANIMATION, animateAll));
          updateStatusLine();
        },
        touch : function(x,y,data,options) {
            lastTouch.x = x;
            lastTouch.y = y;

            if (!playerTurn) {
                skipAnim = true;
                animateAll();
            }
        },
        release : function(x, y, data, options) {
		
            if (gameRunning && playerTurn) {
                moves += 1;
                let drag = {x: x - lastTouch.x, y: y - lastTouch.y};
                if (currentUse > 0 && fireball === null && drag.x * drag.x + drag.y * drag.y >= DRAG_MIN_SQ) {
                    let dir = {x:0, y:0};
                    if (Math.abs(drag.x) > Math.abs(drag.y)) {
                        dir.x = Math.sign(drag.x);
                    }
                    else {
                        dir.y = Math.sign(drag.y);
                    }
                    --currentUse;
                    updateStatusLine();

                    fireball = makeFireball(dir);
                    playerTurn = false;
                } else {
                    let negX = GRID_SIZE - x - 1, negY = GRID_SIZE - y - 1;

                    if (x === y || x === negY || negX === y || negX === negY) {
                        return;
                    }

                    let moveDir = {x: 0, y: 0};
                    let eq1 = x > y, eq2 = x > negY;

                    if (eq1 && eq2) {
                        moveDir.x = 1;
                    } else if (eq1) {
                        moveDir.y = -1;
                    } else if (eq2) {
                        moveDir.y = 1;
                    } else {
                        moveDir.x = -1;
                    }

                    let newPos = addPos(playerPos, moveDir);

                    if (!oobm(newPos)
                        && mapData[newPos.y][newPos.x] !== WALL) {
                        //Allow move
                        playerPos = newPos;

                        //Kill enemies at the position

                        if (mapData[newPos.y][newPos.x] === EXIT) {
                            score += LEVEL_POINTS;
                            roomsCompleted++;
                            generateMap();
                        } else {
                            if (mapData[newPos.y][newPos.x] === POWER_USE) {
                                ++currentUse;
                                mapData[newPos.y][newPos.x] = FLOOR;
                                updateStatusLine();
                                //TODO sfx
                            } else if (mapData[newPos.y][newPos.x] === POWERUP_MAX) {
                                ++maxUse;
                                mapData[newPos.y][newPos.x] = FLOOR;
                                updateStatusLine();
                                //TODO sfx
                            }
                            removeEnemyAt(newPos, false);

                            //Let animation take over
                            playerTurn = false;
                        }
                        redrawScreen();
                    } else {
                        //Fail
                    }
                }
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
        PS.statusText( "Hello, " + user + "!" );

        // Final game startup code goes here
        TKID.onLogin();
    };

    // Collect user credentials, init database
    // NOTE: To disable DB operations during development,
    // change the value of .active to false
    TKID.init();
    PS.dbLogin( DB, onLogin, { active : false } ); //TODO toggle back on
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
	TKID.touch(x,y,data,options);
	
	PS.audioPlayChannel( placement_id );
	
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
	TKID.release(x,y,data, options);
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
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
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


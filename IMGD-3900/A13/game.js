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
    const LAYER_INDICATOR_P = 3;
    const LAYER_INDICATOR_E = 4;

    const COLOR_OVERLAY = {r:100,g:100,b:100};
    const ALPHA_OVERLAY = 128;
    const COLOR_PLAYER = {r:0,g:50,b:255};
    const COLOR_INDICATOR_P = {r:0,g:100,b:255};
    const COLOR_INDICATOR_E = {r:255,g:25,b:0};
    const ALPHA_INDICATOR = 128;

    const COLOR_WALL = {r:0,g:0,b:0};
    const COLOR_FLOOR = {r:255,g:255,b:255};
    const ALPHA_ENVIR = 255;

    const WALL = 1;
    const FLOOR = 0;

    const ENEMY_POINTS = 10;
    const SCREEN_MINCOUNT = 2;
    const TICKS_ANIMATION = 5;

    const LEVEL_SIZE_SCALAR = 0.5;
    const LEVEL_SIZE_MAX = 8;
    const ROOM_DIVISION_CHANCE = .2;
    const ROOM_SIZE = 15;

    let mapData = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    let playerTurn = true;

    let playerPos = {x:0, y:0}
    let playerCombos = [];
    let currentCombos = []; //Combos the player is currently attempting

    let enemies = [];

    let animateEnemy = 0; //Index of current enemy
    let animateCombo = 0; //Index of current combo

    let gameRunning = true; //Still playable?
    let timers = []; //Timers
    let score = 0;
    let level = 0; //Level the player is on

    const SCORE_PREFIX = "[S: "
    const SCORE_SUFFIX = "] "

    let statusMessage = "Fireball: <-, ->, ^"

    //----------------------------------------------*DB*---------------------------------------------------
    //Variables for DB operations

    let moves = 0;

    //-----------------------------------------------------------------------------------------------------

    const generateMap = function() {

        //Make shape
        let maxDim = (level*LEVEL_SIZE_SCALAR) + 2;
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
        const directions = [{r:-1, c:0},{r:0, c:1},{r:1, c:0},{r:0, c:-1}];

        visited[0][0] = true;
        let heads = [{r:0, c:0}];
        let lastRoom = heads[0];

        while (heads.length > 0) {
            for (let h = 0; h < heads.length; ++h) {
                let head = heads[h], start = Math.floor(4*Math.random()),
                    dir = start, found = 0,
                    split = (head.r === 0 && head.c === 0 && ROOM_DIVISION_CHANCE>0) || Math.random() < ROOM_DIVISION_CHANCE;
                do {
                    let nr = head.r + directions[dir].r, nc = head.c + directions[dir].c;
                    if (nr >= 0 && nr < maxDim && nc >= 0 && nc < maxDim
                        && visited[nr][nc] === false) {

                        template[head.r][head.c][dir] = true;
                        template[nr][nc][(dir+2)%4] = true;

                        visited[nr][nc] = true;

                        let newHead = {r:nr, c:nc};
                        lastRoom = newHead;

                        ++found;
                        if (split) {
                            if (found === 1) {
                                heads.push(newHead);
                            }
                            else {
                                heads[h] = newHead;
                                break;
                            }
                        }
                        else {
                            heads[h] = newHead;
                            break;
                        }
                    }
                    dir = (dir+1)%4;
                } while (dir !== start);

                if (found === 0) {
                    heads.splice(h, 1);
                    --h;
                }
            }
        }

        let maxDimRoom = maxDim*ROOM_SIZE;

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
            console.log(str+'\n');
        }


        //fill out walls
        for (let i = 0; i < maxDimRoom; ++i) {
            for (let j = 0; j < maxDimRoom; ++j) {
                let roomRow = Math.floor(i/ROOM_SIZE),
                    roomCol = Math.floor(j/ROOM_SIZE);

                if (visited[roomRow][roomCol]===true) {
                    if (i%ROOM_SIZE === 0) {
                        data[i][j] = generateHelper(directions, template, j, roomRow, roomCol, 0);
                    } else if (i%ROOM_SIZE === ROOM_SIZE-1) {
                        data[i][j] = generateHelper(directions, template, j, roomRow, roomCol, 2);
                    } else if (j%ROOM_SIZE === 0) {
                        data[i][j] = generateHelper(directions, template, i, roomRow, roomCol, 3);
                    } else if (j%ROOM_SIZE === ROOM_SIZE-1) {
                        data[i][j] = generateHelper(directions, template, i, roomRow, roomCol, 1);
                    }
                    else {
                        data[i][j] = FLOOR;
                    }
                }
            }
        }

        //TODO post processing terrain here

        //Place enemies

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

        //Assign mapdata

        mapData = data;
        playerPos = {x: Math.floor(ROOM_SIZE/2), y:Math.floor(ROOM_SIZE/2)};
        ++level;
    }

    const generateHelper = function(directions, template, index, roomRow, roomCol, dir) {
        if (index%ROOM_SIZE === Math.floor(ROOM_SIZE/2)) {
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
            color: COLOR_INDICATOR_P,
            getThreat : function(current) {
                let threat = [];
                return threat;
            },
            doMove : function(current) {
                return false;
            }
        }
    }

    const makePawnV = function(pos) {
        return {
            pos:pos,
            color:PS.COLOR_RED,
            glyph:'P',
            screenCount: 0,
            data:null,
            getThreat : function() {
                let threat = [];
                for (let i = -1; i <= 1; ++i) {
                    threat.push(addPos(this.pos, {x:i,y:1}));
                }
                return threat;
            },
            doMove : function() {
                if (pos.y < playerPos.y) {
                    let target, dx = playerPos.x - this.pos.x;
                    if (Math.abs(dx) <= 1) {
                        target = addPos(this.pos, {x:dx, y:1});
                    }
                    else {
                        target = addPos(this.pos, {x:0, y:1});
                    }
                    moveEnemy(this, target);
                }
                return false; //Done
            }
        };
    }
    const makeRook = function(pos) {
        return {
            pos:pos,
            color:PS.COLOR_RED,
            glyph:'R',
            screenCount: 0,
            data:null, //TODO pathfinding
            getThreat : function() {
                let threat = [];
                for (let i = -GRID_SIZE; i < GRID_SIZE; i++) { //TODO radiate outwards and discriminate walls/enemies
                    threat.push(addPos(this.pos, {x:i, y:0}));
                    threat.push(addPos(this.pos, {x:0, y:i}));
                }
                return threat;
            },
            doMove : function() {
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

    const makeFireballCombo = function() {
        return {
            moves: [{x:-1, y:0}, {x:1, y:0}, {x:0, y:-1}],
            color: COLOR_INDICATOR_P,
            getThreat : function(current) {
                let threat = [];
                for (let i = 0; i < GRID_SIZE; ++i) {
                    let pos = addPos(playerPos, {x:0, y:-i});
                    if (!oobm(pos)) {
                        threat.push(pos);
                    }
                    else {
                        break;
                    }
                }
                return threat;
            },
            doMove : function(current) {
                if (current.data === null || current.data === undefined) {
                    current.data = 0;
                    PS.audioPlay( "fx_blast2" );
                }
                let oldPos = addPos(playerPos, {x:0, y:current.data}),
                    newPos = addPos(playerPos, {x:0, y:--current.data}),
                    oldPixel = coordsToPixel(oldPos),
                    newPixel = coordsToPixel(newPos);

                PS.gridPlane(LAYER_ENTITY);

                if (!oobp(oldPixel) && !oobm(oldPos)) {
                    PS.alpha(oldPixel.x, oldPixel.y, 0);
                }
                if (!oobp(newPixel) && !oobm(newPos)) {
                    removeEnemyAt(newPos, true); //Kill enemies at this position
                    PS.alpha(newPixel.x, newPixel.y, 255);
                    PS.color(newPixel.x, newPixel.y, this.color);
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    }

    const addEnemy = function(enemy) {
        enemies.push(enemy);
        mapData[enemy.pos.y][enemy.pos.x] = -enemies.length;
    }

    const animateAll = function() {
        if (!playerTurn) {
            //Player combos
            if (animateCombo < currentCombos.length) {
                let current = currentCombos[animateCombo],
                    combo = playerCombos[current.index];

                if (current.step >= combo.moves.length) {
                    if (!combo.doMove(current)) {
                        currentCombos.splice(animateCombo, 1); //Delete this combo
                    }
                }
                else {
                    ++animateCombo;
                }
            }
            //Enemy combos
            else if (animateEnemy < enemies.length) {
                let enemy = enemies[animateEnemy];
                if (enemy.screenCount < SCREEN_MINCOUNT
                    || !enemy.doMove()) {

                    enemy.data = null;
                    ++animateEnemy;
                }
            }
            else {
                animateCombo = 0;
                animateEnemy = 0;

                //Draw enemy indicators
                PS.gridPlane(LAYER_INDICATOR_E);
                for (let i = 0; i < enemies.length; ++i) {
                    let enemy = enemies[i];
                    if (enemy.screenCount >= SCREEN_MINCOUNT-1) {
                        let threatList = enemy.getThreat();
                        for (let i = 0; i < threatList.length; ++i) {
                            let threat = coordsToPixel(threatList[i]);
                            if (!oobp(threat)) {
                                PS.alpha(threat.x, threat.y, ALPHA_INDICATOR);
                                PS.color(threat.x, threat.y, COLOR_INDICATOR_E);
                            }
                        }
                    }
                }
                PS.gridPlane(LAYER_INDICATOR_P)
                //Draw player indicators
                for (let i = 0; i < currentCombos.length; ++i) {
                    let current = currentCombos[i],
                        combo = playerCombos[current.index];
                    //PS.debug("Combo length: " + combo.moves.length);
                    //PS.debug("Current steps: " + current.step);

                    if (combo.moves.length-1 === current.step) {
                        //PS.debug("Should display threats for player")
                        let threatList = combo.getThreat(current);
                        for (let j = 0; j < threatList.length; ++j) {
                            let threat = coordsToPixel(threatList[j]);
                            if (!oobp(threat)) {
                                PS.alpha(threat.x, threat.y, ALPHA_INDICATOR);
                                PS.color(threat.x, threat.y, COLOR_INDICATOR_P);
                            }

                        }
                    }
                }

                playerTurn = true; //Player turn again
            }
        }
    }

    const gameOver = function() {
        gameRunning = false;
        for (let t = 0; t < timers.length; ++t) {
            PS.timerStop(timers[t]);
        }
        timers = [];
        PS.statusText("Game Over | Score: " + score);


        //----------------------------------------------*DB*---------------------------------------------------
        //Finalizes all data we are able to currently collect and sends to himiller@wpi.edu
        //Todo Hannah:
        // -Return rooms completed once different rooms are added
        // -Return average time per room

        if ( PS.dbValid( DB ) ) {

            PS.dbEvent(DB, "Points", score);
            PS.dbEvent(DB, "Moves", moves);
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
        let enemyIndex = mapData[pos.y][pos.x];

        if (enemyIndex < 0) {
            enemies.splice(-(enemyIndex + 1), 1);
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
            addEnemy(makeRook({x:PS.random(GRID_SIZE - 1), y:PS.random(GRID_SIZE - 1)}));

            PS.audioPlay( "fx_coin8" );

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
        if (equalPos(newPos, playerPos)) {
            gameOver();
            return false; //Stop - game over
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
            PS.alpha(oldPixel.x, oldPixel.y, 0);
            PS.glyph(oldPixel.x, oldPixel.y, '');
            PS.color(pixel.x, pixel.y, enemy.color);
            PS.glyph(pixel.x, pixel.y, enemy.glyph);
            PS.alpha(pixel.x, pixel.y, 255);

            enemy.pos = newPos;
            //PS.debug("x: " + enemy.pos.x + " pixelX: " + pixel.x);
            //PS.debug(" y: " + enemy.pos.y + " pixelY: " + pixel.y);
            //PS.debug("\n");
            return true;
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
        PS.statusText(SCORE_PREFIX + score + SCORE_SUFFIX + statusMessage);
    }

    const redrawScreen = function() {
        let yOffset = Math.floor(playerPos.y - GRID_SIZE / 2 + 1),
            xOffset = Math.floor(playerPos.x - GRID_SIZE / 2 + 1);

        //Reset enemies
        for (let i = 0; i < enemies.length; ++i) {
            let enemy = enemies[i];
            if (enemy.screenCount <= 0) {
                enemy.screenCount = 0;
            }
            else {
                enemy.screenCount *= -1;
            }
        }

        PS.gridPlane(LAYER_ENVIR);
        PS.color(PS.ALL, PS.ALL, COLOR_FLOOR);
        PS.gridPlane(LAYER_ENTITY);
        PS.alpha(PS.ALL, PS.ALL, 0);
        PS.gridPlane(LAYER_INDICATOR_P);
        PS.alpha(PS.ALL, PS.ALL, 0);
        PS.gridPlane(LAYER_INDICATOR_E);
        PS.alpha(PS.ALL, PS.ALL, 0);
        PS.glyph(PS.ALL, PS.ALL, '');

        for (let y = 0; y < GRID_SIZE; ++y) {
            let yMod = y+yOffset;
            let bounds = yMod < 0 || yMod >= mapData.length;
            for (let x = 0; x < GRID_SIZE; ++x) {
                let xMod = x+xOffset;
                if (bounds || xMod < 0 || xMod >= mapData[0].length
                    || mapData[yMod][xMod] === WALL) {
                    PS.gridPlane(LAYER_ENVIR);
                    PS.color(x,y,COLOR_WALL);
                }
                else {
                    let data = mapData[yMod][xMod];
                    if (data < 0) {
                        let enemy = enemies[-(data+1)];
                        enemy.screenCount = (-enemy.screenCount)+1;
                        PS.gridPlane(LAYER_ENTITY);
                        PS.alpha(x,y,255);
                        PS.glyph(x,y,enemy.glyph);
                        PS.color(x,y,enemy.color);
                    }
                }
            }
        }
    }

    return {
        init: function() {
            //Start the animation clock
            timers.push(PS.timerStart(TICKS_ANIMATION, animateAll));

            PS.gridSize(GRID_SIZE, GRID_SIZE);

            PS.gridPlane(LAYER_ENVIR);
            PS.alpha(PS.ALL, PS.ALL, ALPHA_ENVIR);

            //draw overlay
            PS.gridPlane(LAYER_OVERLAY);
            for (let i = 0; i < GRID_SIZE/2; ++i) {
                let neg = GRID_SIZE - i - 1;
                PS.color(i, i, COLOR_OVERLAY);
                PS.alpha(i, i, ALPHA_OVERLAY);
                PS.color(neg, i, COLOR_OVERLAY);
                PS.alpha(neg, i, ALPHA_OVERLAY);
                PS.color(i, neg, COLOR_OVERLAY);
                PS.alpha(i, neg, ALPHA_OVERLAY);
                PS.color(neg, neg, COLOR_OVERLAY);
                PS.alpha(neg, neg, ALPHA_OVERLAY);
            }
            PS.alpha(Math.floor(GRID_SIZE/2), Math.floor(GRID_SIZE/2), 200);
            PS.color(Math.floor(GRID_SIZE/2), Math.floor(GRID_SIZE/2), COLOR_PLAYER);

            addEnemy(makeRook({x:1, y:14}));
            //addEnemy(makeGenericEnemy({x:8, y:1}));
            playerCombos.push(makeFireballCombo());

            generateMap();

            updateStatusLine();
            redrawScreen();
        },
        touch : function(x, y, data, options) {

            moves += 1;

            if (gameRunning && playerTurn) {
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
                    removeEnemyAt(newPos, false);

                    redrawScreen();

                    //Progress combos
                    for (let index = 0; index < currentCombos.length; ++index) {
                        let current = currentCombos[index],
                            combo = playerCombos[current.index];

                        if (equalPos(combo.moves[current.step], moveDir)) {
                            ++current.step;
                        }
                        else {
                            //PS.debug("Fail");
                            currentCombos.splice(index--, 1);
                        }
                    }
                    //Add to combos
                    for (let index = 0; index < playerCombos.length; ++index) {
                        let combo = playerCombos[index];
                        if (equalPos(moveDir, combo.moves[0])) {
                            currentCombos.push({
                                index:index,
                                step:1,
                                data:null
                            });
                            //PS.debug("Success!");
                        }
                    }

                    //Let animation take over
                    playerTurn = false;

                } else {
                    //Fail
                }
            }
            //Else the game is over

            //todo Make additional enemies appear every 10(? may need to adjust this) moves
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
        TKID.init();
    };

    // Collect user credentials, init database
    // NOTE: To disable DB operations during development,
    // change the value of .active to false

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
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
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


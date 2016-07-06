//***************************//
// fight_bule_bird.js
//
//***************************//

// constant values
var SCREEN_WIDTH = 800;
var SCREEN_HEIGHT = 600;
var PILLAR_MAX = 10;
var SPAN = 1.5; // Frame = 1/60 sec
var GRAVITY = 0.05;
var BIRD_JUMP_VEL = -3.0
var PILLAR_INTERVAL = 1600;
var GAME_CLEAR_TIME = 1600 * (2 + 5);
var NORMAL_PILLAR_ID = [4, 2, 8, 6, 0]

// Game State
var GAMESTATE = {
    'TITLE'   : 0,
    'PLAYING' : 1,
    'END'     : 2
};

// Cursor State
var CURSOR_TITLE = {
    'NORMAL'   : 0,
    'RANDOM'   : 1,
    'INFINITE' : 2
};

var CURSOR_END = {
    'RETRY'   : 0,
    'GOTITLE' : 1
};

var GAMELEVEL = {
    'NORMAL'   : 0,
    'RANDOM'   : 1,
    'INFINITE' : 2
};

// Background image object
var Background = function (pos) {
    this.pos = [pos[0], pos[1]];  // [x, y]
    this.running = false;
};

Background.prototype.updateParam = function (t_span, mv_unit) {
    if (this.running) {
        this.pos[0] = this.pos[0] + t_span * mv_unit;
    }

    if (this.pos[0] < -2 * SCREEN_WIDTH) {
        this.pos[0] = 2 * SCREEN_WIDTH;
    }
}

Background.prototype.run = function () {
    this.running = true;
}

Background.prototype.stop = function () {
    this.running = false;
}

// Bird object
var Bird = function (pos, vel, size) {
    // pos_x is always "0"
    this.pos = [pos[0], pos[1]]; // [x, y]
    this.size = size;       // [height, width]
    this.vel = vel;
    this.dead = false;
    this.gameclear = false;
};

Bird.prototype.updateParam = function (t_span) {
    this.vel = this.vel + gravity * t_span;

    if (this.gameclear) {
        gamestate = GAMESTATE.END;
    } else if (this.pos[1] >= SCREEN_HEIGHT - this.size[0]) {
        this.pos[1] = SCREEN_HEIGHT + this.size[0];
        this.vel = 0;
        this.dieing();
        gamestate = GAMESTATE.END;
    } else {
        this.pos[1] =  this.pos[1] + this.vel * t_span + gravity * t_span * t_span;
    }
};

Bird.prototype.jump = function () {
    this.vel = this.vel + bird_jump_vel;
};

Bird.prototype.collision = function (Pillar) {
    var hit = false;
    hit = detCollision(this, Pillar)
    return hit;
};

Bird.prototype.dieing = function () {
    if (intervalID != null) {
        clearInterval(intervalID);
        intervalID = null;
    }
    this.vel = 0;
    this.dead = true;
    background.forEach(function (bk) {
        bk.stop();
    });
}

// Pillar Object
var Pillar = function (pos, gap, width) {
    // pos_y is always "0"
    this.pos = [pos[0], pos[1]];    // [x, y]
    this.gap = [gap[0], gap[1]];    // [gap_H, gap_L]
    this.width = width              // width
    this.running = false;
};

Pillar.prototype.updateParam = function (t_span, mv_unit) {
    
    if (this.running) {
        this.pos[0] = this.pos[0] +  t_span * mv_unit;
    }

    if (this.pos[0] < (-1 * this.width)) {
        this.pos[0] = SCREEN_WIDTH;
        this.stop();
    }
};

Pillar.prototype.run = function () {
    this.running = true;
};

Pillar.prototype.stop = function () {
    this.running = false;
};


//==== Main ==================================
var canvas;
var ctx;
var gamestate = GAMESTATE;
var gamelevel = GAMELEVEL.NORMAL
var cursor_title = CURSOR_TITLE.NORMAL;
var cursor_end = CURSOR_END.RETRY;
var gravity = GRAVITY;
var bird_jump_vel = BIRD_JUMP_VEL;
var pillar_interval = PILLAR_INTERVAL;
var pillar_count = 0;

var background = [
    new Background([0,0]),
    new Background([2*SCREEN_WIDTH,0])
];
var bird = new Bird([SCREEN_WIDTH/2, SCREEN_HEIGHT/3], 0 ,[30, 30]);
var pillar = [
    new Pillar([SCREEN_WIDTH, 0], [80,  180], 50),
    new Pillar([SCREEN_WIDTH, 0], [80,  180], 50),
    new Pillar([SCREEN_WIDTH, 0], [150, 250], 50),
    new Pillar([SCREEN_WIDTH, 0], [150, 250], 50),
    new Pillar([SCREEN_WIDTH, 0], [220, 320], 50),
    new Pillar([SCREEN_WIDTH, 0], [220, 320], 50),
    new Pillar([SCREEN_WIDTH, 0], [290, 390], 50),
    new Pillar([SCREEN_WIDTH, 0], [290, 390], 50),
    new Pillar([SCREEN_WIDTH, 0], [360, 460], 50),
    new Pillar([SCREEN_WIDTH, 0], [360, 460], 50)
];

var Asset = {};
Asset.images = {};
Asset.assets = [
    { type: 'image', name: 'title', src: 'assets/title.png' },
    { type: 'image', name: 'gameover', src: 'assets/gameover.png' },
    { type: 'image', name: 'gameclear', src: 'assets/gameclear.png' },
    { type: 'image', name: 'background0', src: 'assets/background0.png' },
    { type: 'image', name: 'background1', src: 'assets/background1.png' },
    { type: 'image', name: 'bird', src: 'assets/bird.png' },
    { type: 'image', name: 'pillar01', src: 'assets/pillar0-1.png' },
    { type: 'image', name: 'pillar02', src: 'assets/pillar0-2.png' },
    { type: 'image', name: 'pillar11', src: 'assets/pillar1-1.png' },
    { type: 'image', name: 'pillar12', src: 'assets/pillar1-2.png' },
    { type: 'image', name: 'pillar21', src: 'assets/pillar2-1.png' },
    { type: 'image', name: 'pillar22', src: 'assets/pillar2-2.png' },
    { type: 'image', name: 'pillar31', src: 'assets/pillar3-1.png' },
    { type: 'image', name: 'pillar32', src: 'assets/pillar3-2.png' },
    { type: 'image', name: 'pillar41', src: 'assets/pillar4-1.png' },
    { type: 'image', name: 'pillar42', src: 'assets/pillar4-2.png' },
    { type: 'image', name: 'cursor_normal',    src: 'assets/cursor0.png' },
    { type: 'image', name: 'cursor_random',    src: 'assets/cursor1.png' },
    { type: 'image', name: 'cursor_infinite',  src: 'assets/cursor2.png' },
    { type: 'image', name: 'cursor_retry',     src: 'assets/end_cursor0.png' },
    { type: 'image', name: 'cursor_gotitle',   src: 'assets/end_cursor1.png' }
];

Asset.loadAssets = function(onComplete) {
    var total = Asset.assets.length;
    var loadCount = 0;

    // Callback when finish laoding images
    var onLoad = function() {
        loadCount++;
        if (loadCount >= total) {
            onComplete();
        }
    };

    Asset.assets.forEach(function(asset) {
        switch (asset.type) {
            case 'image':
                Asset._loadImage(asset, onLoad);
                break;
        }
    });
};

Asset._loadImage = function(asset, onLoad) {
    var image = new Image();
    image.src = asset.src;
    image.onload = onLoad;
    Asset.images[asset.name] = image;
};

var intervalID;
function pillarGo() {
    if (gamelevel == GAMELEVEL.NORMAL) {
        if (pillar_count == 5) {
            return;
        }
        pillar[NORMAL_PILLAR_ID[pillar_count]].run();
        pillar_count += 1
    } else {
        while (true) {
            if (gamelevel == GAMELEVEL.RANDOM && pillar_count == 5) {
                return;
            }
            var i = Math.floor(Math.random() * PILLAR_MAX);
            if (pillar[i].running == false) {
                pillar[i].run();
                pillar_count += 1;
                break;
            }
        }
    }
}

var timeoutID;
function gameClear() {
    bird.gameclear = true;
    background.forEach(function (bk) {
        bk.stop();
    });
}

window.addEventListener('load', init);
function init() {
    canvas = document.getElementById('maincanvas');
    ctx = canvas.getContext('2d');
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    gamestate = GAMESTATE.TITLE;
    pillar_count = 0
    requestAnimationFrame(update);

    Asset.loadAssets(function() {
        requestAnimationFrame(update);
    });
}

function update() {
    requestAnimationFrame(update);
    render();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(Asset.images['background0'], background[0].pos[0], background[0].pos[1]);
    ctx.drawImage(Asset.images['background1'], background[1].pos[0], background[1].pos[1]);
    if (gamestate == GAMESTATE.TITLE) {
        ctx.drawImage(Asset.images['title'], 0,0);
        switch (cursor_title) {
            case CURSOR_TITLE.NORMAL:
                ctx.drawImage(Asset.images['cursor_normal'], 0,0);
                break;
            case CURSOR_TITLE.RANDOM:
                ctx.drawImage(Asset.images['cursor_random'], 0,0);
                break;
            case CURSOR_TITLE.INFINITE:
                ctx.drawImage(Asset.images['cursor_infinite'], 0,0);
                break;
        }
        pillar.forEach(function(p) {
            p.stop();
        });
        return;
    }
    ctx.drawImage(Asset.images['pillar01'], pillar[0].pos[0], pillar[0].pos[1]);
    ctx.drawImage(Asset.images['pillar02'], pillar[1].pos[0], pillar[1].pos[1]);
    ctx.drawImage(Asset.images['pillar11'], pillar[2].pos[0], pillar[2].pos[1]);
    ctx.drawImage(Asset.images['pillar12'], pillar[3].pos[0], pillar[3].pos[1]);
    ctx.drawImage(Asset.images['pillar21'], pillar[4].pos[0], pillar[4].pos[1]);
    ctx.drawImage(Asset.images['pillar22'], pillar[5].pos[0], pillar[5].pos[1]);
    ctx.drawImage(Asset.images['pillar31'], pillar[6].pos[0], pillar[6].pos[1]);
    ctx.drawImage(Asset.images['pillar32'], pillar[7].pos[0], pillar[7].pos[1]);
    ctx.drawImage(Asset.images['pillar41'], pillar[8].pos[0], pillar[8].pos[1]);
    ctx.drawImage(Asset.images['pillar42'], pillar[9].pos[0], pillar[9].pos[1]);
    ctx.drawImage(Asset.images['bird'], bird.pos[0], bird.pos[1]);

    if (bird.gameclear) {
        if (intervalID != null) {
            clearInterval(intervalID);
            intervalID = null;
        }
        ctx.drawImage(Asset.images['gameclear'], 0,0);
        switch (cursor_end) {
            case CURSOR_END.RETRY:
                ctx.drawImage(Asset.images['cursor_retry'], 0,0);
                break;
            case CURSOR_END.GOTITLE:
                ctx.drawImage(Asset.images['cursor_gotitle'], 0,0);
                break;
        }
        gamestate = GAMESTATE.END
    } else if (bird.dead) {
        ctx.drawImage(Asset.images['gameover'], 0,0);
        switch (cursor_end) {
            case CURSOR_END.RETRY:
                ctx.drawImage(Asset.images['cursor_retry'], 0,0);
                break;
            case CURSOR_END.GOTITLE:
                ctx.drawImage(Asset.images['cursor_gotitle'], 0,0);
                break;
        }
        if (timeoutID != null) {
            clearTimeout(timeoutID);
            timeoutID = null;
        }
        gamestate = GAMESTATE.END
    } else if (gamestate == GAMESTATE.PLAYING) {

        background.forEach(function(bk) {
            bk.updateParam(SPAN, -0.3);
        });
        
        pillar.forEach(function(p) {
            p.updateParam(SPAN, -1);
        });
        
        bird.updateParam(SPAN);
        
        var hit = false;
        for (var i=0; i<PILLAR_MAX; i++) {
            hit = bird.collision(pillar[i]);
            if (hit) {
                bird.dieing();
                break;
            }
        }
    }
}

function initGame() {
    bird.dead = false;
    bird.gameclear = false;
    bird.pos[1] = SCREEN_HEIGHT/3;
    pillar.forEach(function(p) {
        p.pos = [SCREEN_WIDTH, 0];
        p.stop();
    });
    pillar_count = 0

    if (intervalID != null) {
        clearInterval(intervalID);
        intervalID = null;
    }
    intervalID = window.setInterval(pillarGo, pillar_interval);

    if (timeoutID != null) {
        clearTimeout(timeoutID);
        timeoutID = null;
    }
    if (gamelevel != GAMELEVEL.INFINITE) {
        timeoutID = window.setTimeout(gameClear, GAME_CLEAR_TIME);
    }
}

function retryGame() {
    initGame();
    background.forEach(function(bk) {
        bk.run();
    });
    gamestate = GAMESTATE.PLAYING;
}

function detCollision(_bird, _pillar) {
    // bird's size must be smaller than pillar width.
    // bird's size must be equaled to "x:y = 1;1"
    // area of collition regarded circle as the circle center.point.
    //
    var hit = true;
    var birdcntr = [0,0];
    birdcntr[0] = _bird.pos[0]+_bird.size[0]/2.0;
    birdcntr[1] = _bird.pos[1]+_bird.size[1]/2.0;
    
    if (birdcntr[0] >= _pillar.pos[0] &&
        birdcntr[0] <= _pillar.pos[0] + _pillar.width) {
        
        if (birdcntr[1] > _pillar.gap[0] &&
            birdcntr[1] < _pillar.gap[1]   ) {
            hit = false;
        }
    } else {
        hit = false;
    }

    return hit;
}

function changeLevel() {
    switch (cursor_title) {
        case CURSOR_TITLE.NORMAL:
            gamelevel = GAMELEVEL.NORMAL
            break;
        case CURSOR_TITLE.RANDOM:
            gamelevel = GAMELEVEL.RANDOM
            break;
        case CURSOR_TITLE.INFINITE:
            gamelevel = GAMELEVEL.INFINITE
            break;
    }
    initGame();
}

// Key Events
var keyupflag = true;
document.onkeypress = function(event) {
    if (event != null) {
        keycode = event.which;
        event.preventDefault();
        event.stopPropagation();
    } else {
        keycode = event.keyCode;
        event.returnValue = false;
        event.cancelBubble = true;
    }

    //alert("keycode: %d", keycode);
    if (keycode == 32 && keyupflag == true) { // SPACE key
        //alert("space pressed.");
        if (!bird.dead && !bird.gameclear) {
            bird.jump();
        }
        keyupflag = false;
    } else if (keycode == 13) { // 'Enter' key
        if (gamestate == GAMESTATE.TITLE) {
            changeLevel();
            background.forEach(function (bk) {
                bk.run();
            });
            gamestate = GAMESTATE.PLAYING;
        } else if (gamestate == GAMESTATE.END && cursor_end == CURSOR_END.RETRY) {
            retryGame();
        } else if (gamestate == GAMESTATE.END && cursor_end == CURSOR_END.GOTITLE) {
            initGame();
            gamestate = GAMESTATE.TITLE;
            cursor_end = CURSOR_END.RETRY;
        }
    } else if (keycode == 107) { // 'j' key
        if (gamestate == GAMESTATE.TITLE) {
            switch (cursor_title) {
                case CURSOR_TITLE.NORMAL:
                    cursor_title = CURSOR_TITLE.INFINITE;
                    break;
                case CURSOR_TITLE.RANDOM:
                    cursor_title = CURSOR_TITLE.NORMAL;
                    break;
                case CURSOR_TITLE.INFINITE:
                    cursor_title = CURSOR_TITLE.RANDOM;
                    break;
            }
        } else if (gamestate == GAMESTATE.END) {
            switch (cursor_end) {
                case CURSOR_END.RETRY:
                    cursor_end = CURSOR_END.GOTITLE
                    break;
                case CURSOR_END.GOTITLE:
                    cursor_end = CURSOR_END.RETRY;
                    break;
            }
        }
    } else if (keycode == 106) { // 'k' key
        if (gamestate == GAMESTATE.TITLE) {
            switch (cursor_title) {
                case CURSOR_TITLE.NORMAL:
                    cursor_title = CURSOR_TITLE.RANDOM;
                    break;
                case CURSOR_TITLE.RANDOM:
                    cursor_title = CURSOR_TITLE.INFINITE;
                    break;
                case CURSOR_TITLE.INFINITE:
                    cursor_title = CURSOR_TITLE.NORMAL;
                    break;
            }
        } else if (gamestate == GAMESTATE.END) {
            switch (cursor_end) {
                case CURSOR_END.RETRY:
                    cursor_end = CURSOR_END.GOTITLE
                    break;
                case CURSOR_END.GOTITLE:
                    cursor_end = CURSOR_END.RETRY;
                    break;
            }
        }
    }
}

document.onkeyup =  function(event) {
    if (event != null) {
        keycode = event.which;
        event.preventDefault();
        event.stopPropagation();
    } else {
        keycode = event.keyCode;
        event.returnValue = false;
        event.cancelBubble = true;
    }

    if (keycode == 32) {    // SPACE key
        //alert("space pressed.");
        keyupflag = true;
    }
}



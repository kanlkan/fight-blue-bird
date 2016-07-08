//***************************//
// fight_bule_bird_ga.js
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
var NORMAL_PILLAR_ID = [4, 2, 8, 6, 0];
var GENE_CNT_MAX = 32; // 4*n (n >= 3).
var GENE_ELEM_MAX = 100;
var JUMP_INTERVAL = 200;

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
        this.vel = 0;
        gamestate = GAMESTATE.END;
    } else if (this.gameover) {
        gamestate = GAMESTATE.END;
    } else if (this.pos[1] >= (SCREEN_HEIGHT - this.size[0])) {
        this.pos[1] = SCREEN_HEIGHT + this.size[0];
        this.vel = 0;
        this.dieing();
        gamestate = GAMESTATE.END;
    } else if (this.pos[1] <= (-this.size[0])) {
        this.pos[1] = 0;
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
    // update fitness of gene
    my_date = new Date();
    var fitness = my_date.getTime() - now_time;
    ga.gene[now_gene_index][0] = fitness;
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

// GA Objects
var Ga = function () {
    this.gene = new Array(GENE_CNT_MAX);
    for (var i=0; i<GENE_CNT_MAX; i++) {
        this.gene[i] = new Array(GENE_ELEM_MAX+1);
        this.gene[i][0] = 0; // fitness = 0 (init value)
        for (var j=1; j<GENE_ELEM_MAX+1; j++) {
            this.gene[i][j] = Math.round(Math.random());
        }
    }
}

Ga.prototype.printGene = function () {
    for (var i=0; i<GENE_CNT_MAX; i++) {
        str = "";
        for (var j=0; j<GENE_ELEM_MAX+1; j++) {
            str += (String(this.gene[i][j]) + ",")
        }
        console.log(String(i) +  " : " + str);
    }
}

// sort gene list by fitness(gene[gene_index][0])
Ga.prototype.geneBubbleSort = function () {
    var temp;
    for (var i=0; i<GENE_CNT_MAX-1; i++) {
        for (var j=GENE_CNT_MAX-1; j>i; j--) {
            if (this.gene[j][0] > this.gene[j-1][0]) {
                for (var k=0; k<GENE_ELEM_MAX+1; k++) {
                    temp = this.gene[j-1][k];
                    this.gene[j-1][k] = this.gene[j][k];
                    this.gene[j][k] = temp;
                }
            }
        }
    }
}

// gene must be sorted by fitness before selection.
Ga.prototype.selection = function() {
    for (var i=0; i<GENE_ELEM_MAX+1; i++) {
        this.gene[GENE_CNT_MAX-1][i] = this.gene[0][i];
        this.gene[GENE_CNT_MAX-2][i] = this.gene[1][i];
        this.gene[GENE_CNT_MAX-3][i] = this.gene[2][i];
    }
}

// gene must be sorted by fitness before crossover.
Ga.prototype.crossover = function () {
    var temp;
    for (var i=2; i<GENE_CNT_MAX-1; i++) {
        for (var j=1; j<GENE_ELEM_MAX+1; j++) {
            if (Math.random() > 0.5) { // probability = 50%
                temp = this.gene[i][j];
                this.gene[i][j] = this.gene[i+1][j];
                this.gene[i+1][j] = temp;
            }
        }
    }
}

Ga.prototype.roulette = function (sum_fitness) {
    var range = 0;
    var tgt = Math.floor(Math.random() * sum_fitness);
    var tgt_index;
    var inc = 0;
    for (var i=0; i<GENE_CNT_MAX; i++) {
        inc += this.gene[i][0];
        if (tgt <= inc) {
            tgt_index = i;
            break;
        }
    }

    return tgt_index;
}

Ga.prototype.mutation = function() {
    var gene_index;
    var elem_index;
    gene_index = Math.floor(Math.random() * GENE_CNT_MAX);
    for (var i=1; i<GENE_ELEM_MAX+1; i++) {
        if (Math.floor(Math.random() * 100) == 0) { // mutation probability = 1%
            this.gene[gene_index][i] = (this.gene[gene_index][i] + 1) % 2;
        }
    }
}


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
var now_gene_index = 0;
var now_gene_elem_index = 1;
var now_time;
var generation = 1;
var max_fitness = 0;
var max_fitness_generation = 1;
var fitness_record = new Array(15);
fitness_record = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var fitness_record_update = false;
var do_retry = false;
var gameclear_once = false;

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
var ga = new Ga();

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

var jumpIntervalID;
function jumpBird() {
    if (bird.dead) {
        now_gene_elem_index = 1;
        return;
    }
    if (ga.gene[now_gene_index][now_gene_elem_index] == 1) {
        bird.jump();
    }
    now_gene_elem_index += 1;
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

    ctx.drawImage(Asset.images['background0'], background[0].pos[0],
                                               background[0].pos[1]);
    ctx.drawImage(Asset.images['background1'], background[1].pos[0],
                                               background[1].pos[1]);
    if (gamestate == GAMESTATE.TITLE) {
        gamelevel = GAMELEVEL.NORMAL;
        pillar.forEach(function(p) {
            p.stop();
        });
        background.forEach(function(bk) {
            bk.run();
        });
        initGame();
        gamestate = GAMESTATE.PLAYING;
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

    if (bird.gameclear && !gameclear_once) {
        console.log("Game Clear!");
        gameclear_once = true;
        gamestate = GAMESTATE.END;
        if (!do_retry) {
            delayTimeoutID = window.setTimeout(retryGame, 200);
            now_gene_elem_index = 1;
            do_retry = true;
        }
    } else if (bird.dead) {
        gamestate = GAMESTATE.END;
        if (!do_retry) {
            delayTimeoutID = window.setTimeout(retryGame, 200);
            now_gene_elem_index = 1;
            do_retry = true;
        }
    } else if (gamestate == GAMESTATE.PLAYING) {
        ctx.font = "24px 'Arial'"
        ctx.fillText(String(generation) + " - " +
                     String(now_gene_index) + " - " +
                     String(now_gene_elem_index), 50, 50);
        if (max_fitness < ga.gene[0][0] && !gameclear_once) {
            max_fitness = ga.gene[0][0];
            max_fitness_generation = generation - 1;
        }
        ctx.fillText("MAX Fitness " + String(max_fitness) +
                     " (" + String(max_fitness_generation) + ")", 50, 90);
        ctx.font = "18px 'Arial'";
        if (now_gene_index == 0 && !fitness_record_update) {
            for (var i=14; i>0; i--) {
                fitness_record[i] = fitness_record[i-1];
            }
            fitness_record[0] = ga.gene[0][0];
            fitness_record_update = true;
        }
        for (var i=0; i<15; i++) {
            ctx.fillText(String(fitness_record[i]), 50, 130 + 22 * i);
        }

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

    my_date = new Date();
    now_time = my_date.getTime();

    if (jumpIntervalID != null) {
        clearInterval(jumpIntervalID);
        jumpIntervalID = null;
    }
    jumpIntervalID = window.setInterval(jumpBird, JUMP_INTERVAL);
    now_gene_elem_index = 1;
}

var delayTimeoutID;
function retryGame() {
    if (now_gene_index == GENE_CNT_MAX - 1) {
        now_gene_index = 0;
        ga.geneBubbleSort();
        if (!gameclear_once) {
            ga.selection();
            ga.crossover();
            ga.mutation();
            generation += 1;
            fitness_record_update = false;
        }
    } else {
        now_gene_index += 1;
    }
    
    background.forEach(function(bk) {
        bk.run();
    });
    do_retry = false;
    initGame();
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


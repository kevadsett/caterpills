var UP = 1.5, LEFT = 1, DOWN = 0.5, RIGHT = 0;
var directions = ["UP", "LEFT", "DOWN", "RIGHT"];
var colours = {
    brown: {
        score: -5,
        hex: "#6f471f",
        frames: {
            apple: 0,
            caterpillar: 5,
        }
    },
    red: {
        score: 5,
        hex: "#af0c0c",
        frames: {
            apple: 1,
            caterpillar: 6,
        },
        next: 'green',
        prev: 'brown'
    },
    green: {
        score: 10,
        hex: "#47c924",
        frames: {
            apple: 2,
            caterpillar: 7,
        },
        next: 'gold',
        prev: 'red',
    },
    gold: {
        score: 25,
        hex: "#dde00b",
        frames: {
            apple: 3,
            caterpillar: 8,
        },
        next: 'diamond',
        prev: 'green'
    },
    diamond: {
        score: 100,
        hex: "#7defea",
        frames: {
            apple: 4,
            caterpillar: 9,
        },
        prev: 'gold'
    }
};
var maxX, maxY;
var cellSize = 30;
var halfCellSize = cellSize / 2;
var gameSize = {
    width: 35,
    height: 20
};
var halfGameWidth = Math.round(gameSize.width / 2);
var quarterGameWidth = Math.round(gameSize.width / 4);
var halfGameHeight = Math.round(gameSize.height / 2);
var quarterGameHeight = Math.round(gameSize.height / 4);

var apples = [];
var scoreTexts = [];
var appleCoords;
var cursors;
var bgm;
var menuMusic;
var grass = [];
var score = 0;
var deathReason = "";

var boot = {
    preload: function() {
        game.load.image('loading', 'img/loading.png', 30, 30);
    },
    create: function() {
        game.stage.backgroundColor = 0x248100;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.setMinMax(0, 0, 1050, 600);
        game.state.start('preload');
    }
};

var preload = {
    preload: function() {
        var loadingBar = game.add.sprite(game.world.width / 2, game.world.height / 2, 'loading');
        loadingBar.anchor.setTo(0.5, 0.5);
        this.load.setPreloadSprite(loadingBar);
        var introText = game.add.text(game.world.width / 2, (game.world.height / 2) + 50, "Loading...");
        introText.font = 'GoodDogRegular';
        introText.fontSize = 30;
        introText.anchor.setTo(0.5, 0.5);
        game.load.spritesheet('sprites', 'img/sprites.png', 30, 30);
        game.load.spritesheet('grass', 'img/grass.png', 30, 30);
        game.load.audio('bgm', ['sound/mm-main.ogg', 'sound/mm-main.mp3']);
        game.load.audio('introMusic', ['sound/mm-intro.ogg', 'sound/mm-intro.mp3']);
        game.load.audio('death', ['sound/death.ogg', 'sound/death.mp3']);
        game.load.audiosprite('munches', ['sound/munches.ogg', 'sound/munches.mp3'], 'sound/munches.json');
        game.load.audiosprite('pings', ['sound/pings.ogg', 'sound/pings.mp3'], 'sound/pings.json');
    },
    create: function() {
        game.state.start('intro');
    }
};

var intro = {
    preload: function() {},
    create: function() {
        menuMusic = game.add.audio('introMusic', 0.3, true);
        menuMusic.play();
        var introText = game.add.text(game.world.width / 2, (game.world.height / 2) - 25, "Munch Match");
        introText.font = 'GoodDogRegular';
        introText.fontSize = 120;
        introText.anchor.setTo(0.5, 0.5);
        var instructionText = game.add.text(game.world.width / 2, game.world.height / 2 + game.world.height / 4, "Tap to start");
        instructionText.font = 'GoodDogRegular';
        instructionText.fontSize = 30;
        instructionText.anchor.setTo(0.5, 0.5);
        game.input.onTap.add(this.startGame, this);
        var amountOfGrass = Math.floor(Math.random() * 500);
        for (i = 0; i < amountOfGrass; i++) {
            var x = Math.floor(Math.random() * gameSize.width);
            var y = Math.floor(Math.random() * gameSize.height);
            var grassIndex = Math.floor(Math.random() * 5);
            grass.push(game.add.sprite(Math.random() * game.world.width, Math.random() * game.world.height, 'grass', grassIndex));
        }
        new Caterpillar(halfGameWidth, halfGameHeight, false);
    },
    startGame: function() {
        menuMusic.stop();
        game.state.start('main');
    },
    shutdown: function() {
        for (var i = 0; i < grass.length; i++) {
            this.world.remove(grass[i]);
        }
    }
};
var main = {
    preload: function() {},
    create: function() {
        score = 0;
        events.off();
        game.input.onTap.removeAll();
        if (!bgm) {
            bgm = game.add.audio('bgm', 0.3, true);
        }
        bgm.play();
        this.death = game.add.audio('death');
        this.munches = game.add.audioSprite('munches');
        this.pings = game.add.audioSprite('pings');
        this.munches.allowMultiple = true;
        this.pings.allowMultiple = true;
        cursors = game.input.keyboard.createCursorKeys();
        game.tutorialMode = localStorage.tutorialSeen !== 'true';
        apples = [];
        scoreTexts = [];
        appleCoords = new Array(gameSize.width);
        var i;
        for (i = 0; i < appleCoords.length; i++) {
            appleCoords[i] = new Array(gameSize.height);
        }
        game.time.advancedTiming = true;
        for (i = 0; i < grass.length; i++) {
            game.add.existing(grass[i]);
        }
        this.caterpillar = new Caterpillar(halfGameWidth, halfGameHeight, true);
        this.scoreText = game.add.text(20, 20, this.caterpillar.score);
        this.scoreText.font = 'GoodDogRegular';
        this.scoreText.fontSize = 50;

        if (game.tutorialMode) {
            this.caterpillar.secondsPerStep = 0.5;
            game.tutorialAging = true;
            game.tutorialStep = -1;
            game.tutorialText = game.add.text(game.world.width / 2, game.world.height / 2 - 50, "");
            game.tutorialText.font = 'GoodDogRegular';
            game.tutorialText.algin = 'center';
            game.tutorialText.anchor.setTo(0.5, 0.5);
            game.seenDirections = {
                right: false,
                down: false,
                left: false,
                up: false
            };
            this.nextTutorialStep();
        }

        events.on('playSound', this.playSound, this);
        events.on('advanceTutorial', this.nextTutorialStep, this);
    },
    onDirectionSeen: function(direction) {
        switch (direction) {
            case RIGHT:
                game.seenDirections.right = true;
                break;
            case DOWN:
                game.seenDirections.down = true;
                break;
            case LEFT:
                game.seenDirections.left = true;
                break;
            case UP:
                game.seenDirections.up = true;
                break;
        }
        var seenAll = true;
        for (var key in game.seenDirections) {
            if (!game.seenDirections[key]) {
                seenAll = false;
            }
        }
        if (seenAll) {
            this.nextTutorialStep();
        }
    },
    nextTutorialStep: function() {
        switch (++game.tutorialStep) {
            case 0:
                events.on('directionSeen', this.onDirectionSeen, this);
                if (game.device.desktop) {
                    game.tutorialText.text = "Use the arrow keys to move around.";
                } else {
                    game.tutorialText.text = "Tap the screen to change direction";
                }
                break;
            case 1:
                events.off('directionSeen');
                apples.push(new Apple(quarterGameWidth, halfGameHeight, 'red'));
                game.tutorialText.text = "This is an apple. Apples are good.";
                break;
            case 2:
                game.tutorialText.text = "Eating apples of the same kind will change your colour\nand make you shorter.";
                while (apples.length < 2) {
                    appleX = (apples.length + 1) * quarterGameWidth;
                    appleY = quarterGameHeight;
                    apples.push(new Apple(appleX, appleY, 'red'));
                }
                break;
            case 3:
                game.tutorialText.text = "Three red apples make a green body segment.\nWhat do three greens make?";
                while (apples.length < 3) {
                    appleX = quarterGameWidth + halfGameWidth;
                    appleY = (apples.length + 1) * quarterGameHeight;
                    apples.push(new Apple(appleX, appleY, 'red'));
                }
                break;
            case 4:
                game.tutorialText.text = "Sometimes, different coloured apples appear.\nThis lets you skip some steps!";
                appleX = quarterGameWidth;
                appleY = quarterGameHeight + halfGameHeight;
                apples.push(new Apple(appleX, appleY, 'green'));
                break;
            case 5:
                game.tutorialText.text = "Apples degrade over time.\nSee what happens when you eat rotten apples!";
                game.tutorialAging = false;
                apples.push(new Apple(halfGameWidth + quarterGameHeight, quarterGameHeight, 'gold'));
                break;
            case 6:
                game.tutorialText.text = "Yuck! If you find a diamond apple, it'll clear up those nasty brown segments";
                game.tutorialAging = true;
                apples.push(new Apple(quarterGameWidth, halfGameHeight, 'diamond'));
                break;
            case 7:
                game.tutorialAging = game.tutorialMode = false;
                break;
        }
    },
    update: function(info) {
        if (menuMusic && menuMusic.isPlaying) {
            menuMusic.stop();
        }
        this.caterpillar.update(info._deltaTime / 1000);
        var appleX, appleY;
        if (!game.tutorialMode) {
            if (!game.setFinalTutorialText) {
                game.setFinalTutorialText = true;
                if (game.tutorialText) {
                    game.tutorialText.text = "Good luck!";
                    localStorage.tutorialSeen = true;
                    setTimeout(function() {
                        game.tutorialText.destroy();
                    }, 1000);
                }
            }
            if (Math.random() > 0.99 && apples.length < 10) {
                var appleChance = Math.random();
                var colour;
                if (appleChance < 0.8) {
                    colour = 'red';
                } else if (appleChance < 0.9) {
                    colour = 'green';
                } else if (appleChance < 0.95) {
                    colour = 'gold';
                } else {
                    colour = 'diamond';
                }
                appleX = Math.floor(Math.random() * gameSize.width);
                appleY = Math.floor(Math.random() * gameSize.height);
                apples.push(new Apple(appleX, appleY, colour));
            }
        }
        var i;
        for (i = 0; i < apples.length; i++) {
            apples[i].update();
        }

        for (i = 0; i < scoreTexts.length; i++) {
            scoreTexts[i].update();
        }
        this.scoreText.text = score;
    },
    playSound: function(soundKey, spriteKey) {
        if (!this[soundKey] || !this[soundKey].play) return;
        this[soundKey].play(spriteKey);
    },
    shutdown: function() {
        bgm.stop();
        for (var i = 0; i < grass.length; i++) {
            this.world.remove(grass[i]);
        }
    }
};

var gameover = {
    create: function() {
        var outroText = game.add.text(game.world.width / 2, (game.world.height / 2) - 25, deathReason);
        outroText.font = 'GoodDogRegular';
        outroText.fontSize = 65;
        outroText.anchor.setTo(0.5, 0.5);
        var scoreText = game.add.text(game.world.width / 2, game.world.height / 2 + 70, "You scored " + score);
        scoreText.font = 'GoodDogRegular';
        scoreText.fontSize = 65;
        scoreText.anchor.setTo(0.5, 0.5);
        var instructionText = game.add.text(game.world.width / 2, game.world.height / 2 + game.world.height / 4, "Tap to try again");
        instructionText.font = 'GoodDogRegular';
        instructionText.fontSize = 30;
        instructionText.anchor.setTo(0.5, 0.5);
        game.input.onTap.add(this.startGame, this);
        for (i = 0; i < grass.length; i++) {
            game.add.existing(grass[i]);
        }
        menuMusic = game.add.audio('introMusic', 0.3, true);
        menuMusic.play();
    },
    startGame: function() {
        menuMusic.stop();
        game.state.start('main');
    },
    shutdown: function() {
        bgm.stop();
        for (var i = 0; i < grass.length; i++) {
            this.world.remove(grass[i]);
        }
    }
};

function lerp(a, b, f) {
    return (a * (1 - f)) + (b * f);
}

var game = new Phaser.Game(gameSize.width * cellSize, gameSize.height * cellSize, Phaser.AUTO);
game.state.add('main', main);
game.state.add('boot', boot);
game.state.add('intro', intro);
game.state.add('preload', preload);
game.state.add('gameover', gameover);
game.state.start('boot');
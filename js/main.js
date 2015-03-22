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
        score: 50,
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

var boot = {
    preload: function() {
        game.load.spritesheet('loading', 'img/loading.png', 30, 30);
    },
    create: function() {
        game.stage.backgroundColor = 0x248100;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.state.start('preload');
    }
};

var preload = {
    preload: function() {
        var loadingBar = game.add.sprite(game.world.width / 2, game.world.height / 2, 'loading');
        loadingBar.frame = 1;
        loadingBar.anchor.setTo(0.5, 0.5);
        this.load.setPreloadSprite(loadingBar);
        game.load.spritesheet('sprites', 'img/sprites.png', 30, 30);
        game.load.spritesheet('grass', 'img/grass.png', 30, 30);
        game.load.audio('bgm', ['sound/mm-main.ogg']);
        game.load.audio('death', ['sound/death.ogg']);
        game.load.audiosprite('munches', 'sound/munches.ogg', 'sound/munches.json');
        game.load.audiosprite('pings', 'sound/pings.ogg', 'sound/pings.json');
    },
    create: function() {
        game.state.start('main');
    }
};
var main = {
    preload: function() {
    },
    create: function() {
        events.off();
        if (!bgm) {
            bgm = game.add.audio('bgm', 0.3, true);
            bgm.play();
        }
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
        var amountOfGrass = Math.floor(Math.random() * 500);
        for (i = 0; i < amountOfGrass; i++) {
            var x = Math.floor(Math.random() * gameSize.width);
            var y = Math.floor(Math.random() * gameSize.height);
            var grassIndex = Math.floor(Math.random() * 5);
            game.add.sprite(Math.random() * game.world.width, Math.random() * game.world.height, 'grass', grassIndex);
        }
        this.caterpillar = new Caterpillar(halfGameWidth, halfGameHeight);
        this.scoreText = game.add.text(20, 20, this.caterpillar.score);
        this.scoreText.font = 'GoodDogRegular';
        this.scoreText.fontSize = 50;

        if (game.tutorialMode) {
            this.caterpillar.secondsPerStep = 0.5;
            game.tutorialAging = true;
            game.tutorialStep = 0;
            game.tutorialText = game.add.text(game.world.width / 2, game.world.height / 2 - 50, "");
            game.tutorialText.font = 'GoodDogRegular';
            game.tutorialText.algin = 'center';
            game.tutorialText.anchor.setTo(0.5, 0.5);
        }

        events.on('playSound', this.playSound, this);
    },
    update: function(info) {
        this.caterpillar.update(info._deltaTime / 1000);
        var appleX, appleY;
        if (game.tutorialMode) {
            switch (game.tutorialStep) {
                case 0:
                    if (apples.length === 0) {
                        apples.push(new Apple(quarterGameWidth, halfGameHeight, 'red'));
                        game.tutorialText.text = "This is an apple. Apples are good.";
                    }
                    break;
                case 1:
                    if (!game.tutorialApplesReady) {
                        if (apples.length < 2) {
                            game.tutorialText.text = "Eating apples of the same kind will change your colour\nand make you shorter.";
                            console.log(apples.length);
                            appleX = (apples.length + 1) * quarterGameWidth;
                            appleY = quarterGameHeight;
                            apples.push(new Apple(appleX, appleY, 'red'));
                        } else {
                            game.tutorialApplesReady = true;
                        }
                    }
                    break;
                case 2:
                    game.tutorialText.text = "Three red apples make a green body segment.\nWhat do three greens make?";
                    if (!game.tutorialApplesReady) {
                        if (apples.length < 3) {
                            appleX = quarterGameWidth + halfGameWidth;
                            appleY = (apples.length + 1) * quarterGameHeight;
                            apples.push(new Apple(appleX, appleY, 'red'));
                        } else {
                            game.tutorialApplesReady = true;
                        }
                    }
                    break;
                case 3:
                    game.tutorialText.text = "Sometimes, different coloured apples appear.\nThis lets you skip some steps!";
                    if (!game.tutorialApplesReady) {
                        appleX = quarterGameWidth;
                        appleY = quarterGameHeight + halfGameHeight;
                        apples.push(new Apple(appleX, appleY, 'green'));
                        game.tutorialApplesReady = true;
                    }
                    break;
                case 4:
                    game.tutorialText.text = "Apples degrade over time, avoid rotten apples!";
                    if (!game.tutorialApplesReady) {
                        game.tutorialAging = false;
                        apples.push(new Apple(halfGameWidth + quarterGameHeight, quarterGameHeight, 'gold'));
                        game.tutorialApplesReady = true;
                    }
                    break;
            }
        } else {
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
        this.scoreText.text = this.caterpillar.score;
    },
    playSound: function(soundKey, spriteKey) {
        if (!this[soundKey] || !this[soundKey].play) return;
        this[soundKey].play(spriteKey);
    }
};

function lerp(a, b, f) {
    return (a * (1 - f)) + (b * f);
}

var game = new Phaser.Game(gameSize.width * cellSize, gameSize.height * cellSize, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.add('boot', boot);
game.state.add('preload', preload);
game.state.start('boot');
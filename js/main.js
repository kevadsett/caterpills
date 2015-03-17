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
var apples = [];
var scoreTexts = [];
var appleCoords;
var cursors;
var main = {
    preload: function() {
        game.load.spritesheet('sprites', 'img/sprites.png', 30, 30);
        game.load.spritesheet('grass', 'img/grass.png', 30, 30);
    },
    create: function() {
        cursors = game.input.keyboard.createCursorKeys();
        apples = [];
        scoreTexts = [];
        appleCoords = new Array(gameSize.width);
        var i;
        for (i = 0; i < appleCoords.length; i++) {
            appleCoords[i] = new Array(gameSize.height);
        }
        game.stage.backgroundColor = 0x248100;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        var amountOfGrass = Math.floor(Math.random() * 500);
        for (i = 0; i < amountOfGrass; i++) {
            var x = Math.floor(Math.random() * gameSize.width);
            var y = Math.floor(Math.random() * gameSize.height);
            var grassIndex = Math.floor(Math.random() * 5);
            game.add.sprite(Math.random() * game.world.width, Math.random() * game.world.height, 'grass', grassIndex);
        }
        this.caterpillar = new Caterpillar(Math.round(gameSize.width / 2), Math.round(gameSize.height / 2));
        this.scoreText = game.add.text(20, 20, this.caterpillar.score);
        this.scoreText.font = 'GoodDogRegular';
        this.scoreText.fontSize = 50;
    },
    update: function(info) {
        this.caterpillar.update(info._deltaTime / 1000);
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
            var appleX = Math.floor(Math.random() * gameSize.width);
            var appleY = Math.floor(Math.random() * gameSize.height);
            apples.push(new Apple(appleX, appleY, colour));
        }
        var i;
        for (i = 0; i < apples.length; i++) {
            apples[i].update();
        }

        for (i = 0; i < scoreTexts.length; i++) {
            scoreTexts[i].update();
        }
        this.scoreText.text = this.caterpillar.score;
    }
};

function lerp(a, b, f) {
    return (a * (1 - f)) + (b * f);
}

var game = new Phaser.Game(gameSize.width * cellSize, gameSize.height * cellSize, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.start('main');
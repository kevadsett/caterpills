var UP = 1.5, LEFT = 1, DOWN = 0.5, RIGHT = 0;
var directions = ["UP", "LEFT", "DOWN", "RIGHT"];
var colours = {
    brown: {
        frames: {
            apple: 0,
            caterpillar: 5,
        },
        next: 'red'
    },
    red: {
        frames: {
            apple: 1,
            caterpillar: 6,
        },
        next: 'green',
        prev: 'brown'
    },
    green: {
        frames: {
            apple: 2,
            caterpillar: 7,
        },
        next: 'gold',
        prev: 'red',
    },
    gold: {
        frames: {
            apple: 3,
            caterpillar: 8,
        },
        next: 'diamond',
        prev: 'green'
    },
    diamond: {
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
    },
    update: function() {
        this.caterpillar.update();
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
        for (var i = 0; i < apples.length; i++) {
            apples[i].update();
        }
    }
};
var game = new Phaser.Game(gameSize.width * cellSize, gameSize.height * cellSize, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.start('main');
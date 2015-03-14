var UP = 1.5, LEFT = 1, DOWN = 0.5, RIGHT = 0;
var directions = ["UP", "LEFT", "DOWN", "RIGHT"];
var gameSpeed = 3;
var maxX, maxY;
var appleCount = 0;
var cellSize = 30;
var halfCellSize = cellSize / 2;
var gameSize = {
    width: 35,
    height: 20
};
var main = {
    preload: function() {
        game.load.image('body', '../img/body.png');
        game.load.image('body-red', '../img/red-body.png');
        game.load.image('body-green', '../img/green-body.png');
        game.load.image('body-blue', '../img/blue-body.png');
        game.load.image('apple-red', '../img/red-apple.png');
        game.load.image('apple-green', '../img/green-apple.png');
        game.load.image('apple-blue', '../img/blue-apple.png');
    },
    create: function() {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.caterpillar = new Caterpillar(Math.round(gameSize.width / 2), Math.round(gameSize.height / 2));
    },
    update: function() {
        this.caterpillar.update();
        if (Math.random() > 0.9 && appleCount < 25) {
            appleCount++;
            var colour = ["red", "green", "blue"][Math.floor(Math.random() * 3)];
            new Apple(Math.round(Math.random() * gameSize.width), Math.round(Math.random() * gameSize.height), colour);
        }
    }
};
var game = new Phaser.Game(gameSize.width * cellSize, gameSize.height * cellSize, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.start('main');
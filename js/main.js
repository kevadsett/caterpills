var UP = 1.5, LEFT = 1, DOWN = 0.5, RIGHT = 0;
var directions = ["UP", "LEFT", "DOWN", "RIGHT"];
var gameSpeed = 3;
var maxX, maxY;
var appleCount = 0;
var main = {
    preload: function() {
        game.load.image('body', '../img/body.png');
        game.load.image('body-red', '../img/red-body.png');
        game.load.image('body-green', '../img/green-body.png');
        game.load.image('body-blue', '../img/blue-body.png');
        game.load.image('apple-red', '../img/red-body.png');
        game.load.image('apple-green', '../img/green-body.png');
        game.load.image('apple-blue', '../img/blue-body.png');
    },
    create: function() {
        maxX = Math.floor(game.world.width / 30);
        maxY = Math.floor(game.world.height / 30);
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.caterpillar = new Caterpillar(((maxX / 2) * 30) - 15, ((maxY / 2) * 30) - 15);
    },
    update: function() {
        this.caterpillar.update();
        if (Math.random() > 0.9 && appleCount < 25) {
            appleCount++;
            var colour = ["red", "green", "blue"][Math.floor(Math.random() * 3)];
            new Apple(Math.round(Math.random() * maxX) * 30, Math.round(Math.random() * maxY) * 30, colour);
        }
    }
};
var game = new Phaser.Game(1104, 621, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.start('main');
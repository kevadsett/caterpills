var main = {
	preload: function() {

	},
	create: function() {
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	},
	update: function() {

	}
};
var game = new Phaser.Game(1104, 621, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.start('main');
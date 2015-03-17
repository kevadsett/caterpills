var ScoreText = function(x, y, colour, score) {
    this.startingY = y;
    this.scoreText = game.add.text(x, y, score);
    this.scoreText.font = 'GoodDogRegular';
    this.scoreText.fontSize = 50;
    this.scoreText.regX = 0.5;
    this.scoreText.regY = 0.5;
    this.scoreText.fill = colour;
};

ScoreText.prototype = {
    update: function() {
        this.scoreText.y--;
        if (this.scoreText.y < this.startingY - 100) {
            this.destroy();
        }
    },
    destroy: function() {
        this.scoreText.destroy();
        scoreTexts.splice(scoreTexts.indexOf(this), 1);
    }
};
var Caterpillar = function(x, y) {
    this.actCount = -1;
    this.bodyLength = 1;
    this.bodySegments = game.add.group();
    this.speed = 30;
    this.head = game.add.sprite(x, y, 'body');
    this.head.anchor.setTo(0.5, 0.5);
    this.head.currentPosition = {
        x: this.head.x,
        y: this.head.y
    };
    this.head.direction = LEFT;
    this.head.rotation = Math.PI * this.head.direction;
    this.head.directionChangePoints = new Array(this.bodyLength);
    this.bodySegments.add(this.head);
    for (var i = 0; i < this.bodyLength - 1; i++) {
        var newSeg = game.add.sprite(x + ((i+1) * 30), y, 'body');
        newSeg.anchor.setTo(0.5, 0.5);
        newSeg.currentPosition = {
            x: newSeg.x,
            y: newSeg.y
        };
        newSeg.direction = LEFT;
        newSeg.rotation = Math.PI * newSeg.direction;
        this.bodySegments.add(newSeg);
    }
    game.input.onTap.add(this.onTap, this);
    events.on('addSegment', this.addSegment, this);
};
Caterpillar.prototype = {
    update: function() {
        var nextMoveAt = 60/gameSpeed;
        var raiseSegmentStep = Math.floor(nextMoveAt / (this.bodySegments.length));
        var raisedSegmentIndex = this.bodySegments.length - 1 - Math.floor(this.actCount / raiseSegmentStep);
        var seg;
        this.actCount = (this.actCount + 1) % nextMoveAt;
        if (this.actCount === 0) {
            for (var i = this.bodySegments.length - 1; i > 0; i--) {
                seg = this.bodySegments.getChildAt(i);
                var nextPosition = {};
                var nextDirection;
                var prevSeg = this.bodySegments.getChildAt(i - 1);
                seg.x = seg.currentPosition.x = prevSeg.currentPosition.x;
                seg.y = seg.currentPosition.y =  prevSeg.currentPosition.y;
                seg.direction = prevSeg.direction;
                seg.rotation = Math.PI * seg.direction;
            }
            switch (this.head.direction) {
                case UP:
                    this.head.y -= this.speed;
                    break;
                case LEFT:
                    this.head.x -= this.speed;
                    break;
                case DOWN:
                    this.head.y += this.speed;
                    break;
                case RIGHT:
                    this.head.x += this.speed;
                    break;
            }
            this.head.currentPosition.x = this.head.x;
            this.head.currentPosition.y = this.head.y;
            this.x = this.head.x / 30 - 0.5;
            this.y = this.head.y / 30 - 0.5;
            events.emit('move', this.x, this.y);
            console.log(this.x, this.y);
        } else if (this.actCount % raiseSegmentStep === 0) {
            var maxInfluence = this.bodySegments.length / 4;
            for (var i = 1; i < this.bodySegments.length; i++) {
                seg = this.bodySegments.getChildAt(i);
                if (i === raisedSegmentIndex) {
                    seg.y = seg.currentPosition.y - 30;
                } else {
                    var influence = Math.round(30 * Math.max(maxInfluence - Math.abs(i - raisedSegmentIndex), 0) / maxInfluence);
                    seg.y = seg.currentPosition.y - influence;
                }
            }
        }
    },
    onTap: function(e) {
        var tapThreshold = 15;
        var tapX = e.x, tapY = e.y;
        var tappedAbove = e.y < this.head.y - tapThreshold;
        var tappedBelow = e.y > this.head.y + tapThreshold;
        var tappedLeft = e.x < this.head.x - tapThreshold;
        var tappedRight = e.x > this.head.x + tapThreshold;
        var travellingHorizontally = this.head.direction === RIGHT || this.head.direction === LEFT;
        var travellingVertically = this.head.direction === DOWN || this.head.direction === UP;
        if (tappedAbove && travellingHorizontally) {
            this.head.direction = UP;
        } else if (tappedBelow && travellingHorizontally) {
            this.head.direction = DOWN;
        } else if (tappedLeft && travellingVertically) {
            this.head.direction = LEFT;
        } else if (tappedRight && travellingVertically) {
            this.head.direction = RIGHT;
        }
        this.head.rotation = Math.PI * this.head.direction;
    },
    addSegment: function(colour) {
        var tailSeg = this.bodySegments.getChildAt(this.bodySegments.length - 1);
        var x, y;
        switch (tailSeg.direction) {
            case UP:
                x = tailSeg.x;
                y = tailSeg.y + 30;
                break;
            case LEFT:
                x = tailSeg.x + 30;
                y = tailSeg.y;
                break;
            case DOWN:
                x = tailSeg.x;
                y = tailSeg.y - 30;
                break;
            case RIGHT:
                x = tailSeg.x - 30;
                y = tailSeg.y;
                break;
        }
        var newSeg = game.add.sprite(x, y, 'body-' + colour);
        newSeg.anchor.setTo(0.5, 0.5);
        newSeg.currentPosition = {
            x: newSeg.x,
            y: newSeg.y
        };
        newSeg.direction = LEFT;
        newSeg.rotation = Math.PI * newSeg.direction;
        this.bodySegments.add(newSeg);
    }
};
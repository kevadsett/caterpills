var Caterpillar = function(x, y, interactive) {
    this.x = x;
    this.y = y;
    this.interactive = interactive;
    this.secondsPerStep = 0.25;
    this.stepDivider = 20;
    this.secondsPerMergeStep = this.secondsPerStep / this.stepDivider;
    this.age = 0;
    this.dt = 0;
    this.mergeDt = 0;
    this.isAlive = true;
    this.actCount = -1;
    this.bodyLength = 1;
    this.bodySegments = game.add.group();
    this.head = game.add.sprite(x * cellSize + halfCellSize, y * cellSize + halfCellSize, 'sprites', 11);
    this.head.anchor.setTo(0.5, 0.5);
    this.head.currentPosition = {
        x: x,
        y: y
    };
    this.head.direction = LEFT;
    this.head.directionChangePoints = new Array(this.bodyLength);
    this.bodySegments.add(this.head);
    for (var i = 1; i < this.bodyLength; i++) {
        var prevSeg = this.bodySegments.getChildAt(i - 1);
        var newX = prevSeg.currentPosition.x + 1;
        var newSeg = game.add.sprite(newX * cellSize + halfCellSize, prevSeg.y, 'sprites', colours.red.frames.caterpillar);
        newSeg.anchor.setTo(0.5, 0.5);
        newSeg.colour = 'red';
        newSeg.currentPosition = {
            x: newX,
            y: prevSeg.currentPosition.y
        };
        newSeg.direction = LEFT;
        this.bodySegments.add(newSeg);
    }
    game.input.onTap.add(this.onTap, this);
    events.off('mergeFinished');
    events.on('mergeFinished', this.onMergeFinished, this);
};
Caterpillar.prototype = {
    update: function() {
        var i;
        if (!this.isAlive || !this.interactive) {
            return;
        }
        var elapsedSeconds = game.time.elapsedMS / 1000;
        this.dt += elapsedSeconds;
        this.age += elapsedSeconds;
        this.mergeDt += elapsedSeconds;
        if (this.age > 1) {
            this.age--;
            this.secondsPerStep -= 0.001;
            this.secondsPerMergeStep = this.secondsPerStep / this.stepDivider;
        }
        if (!this.frameDecisionMade) {
            if (cursors.up.isDown && this.head.direction !== DOWN) {
                this.head.direction = UP;
                events.emit('directionSeen', UP);
                this.frameDecisionMade = true;
                this.head.frame = 13;
            } else if (cursors.down.isDown && this.head.direction !== UP) {
                this.head.direction = DOWN;
                events.emit('directionSeen', DOWN);
                this.frameDecisionMade = true;
                this.head.frame = 12;
            } else if (cursors.left.isDown && this.head.direction !== RIGHT) {
                this.head.direction = LEFT;
                events.emit('directionSeen', LEFT);
                this.frameDecisionMade = true;
                this.head.frame = 11;
            } else if (cursors.right.isDown && this.head.direction !== LEFT) {
                this.head.direction = RIGHT;
                events.emit('directionSeen', RIGHT);
                this.frameDecisionMade = true;
                this.head.frame = 10;
            }
        }
        var seg;
        var moveFrame = false, mergeFrame = false;
        if (this.dt > this.secondsPerStep) {
            this.frameDecisionMade = false;
            this.dt -= this.secondsPerStep;
            moveFrame = true;
        }
        if (this.mergeDt > this.secondsPerMergeStep) {
            this.mergeDt -= this.secondsPerMergeStep;
            mergeFrame = true;
        }
        if (this.isMerging) {
            if (mergeFrame) {
                for (i = this.mergeStart + 1; i < this.bodySegments.length; i++) {
                    var mergingSeg = this.bodySegments.getChildAt(i);
                    var target = {
                        x: mergingSeg.targetPosition.x,
                        y: mergingSeg.targetPosition.y
                    };
                    var newPosition = {
                        x: lerp(mergingSeg.currentPosition.x, target.x, this.mergeStep / this.stepDivider),
                        y: lerp(mergingSeg.currentPosition.y, target.y, this.mergeStep / this.stepDivider)
                    };
                    mergingSeg.x = cellSize * newPosition.x + halfCellSize;
                    mergingSeg.y = cellSize * newPosition.y + halfCellSize;
                }
                this.mergeStep = (this.mergeStep + 1) % this.stepDivider;
                if (this.mergeStep === 0) {
                    this.isMerging = false;
                    events.emit('mergeFinished', this.mergeStart);
                }
            }
        } else if (moveFrame) {
            var nextPosition = {};
            switch (this.head.direction) {
                case UP:
                    nextPosition.x = this.x;
                    nextPosition.y = this.y - 1;
                    break;
                case LEFT:
                    nextPosition.x = this.x - 1;
                    nextPosition.y = this.y;
                    break;
                case DOWN:
                    nextPosition.x = this.x;
                    nextPosition.y = this.y + 1;
                    break;
                case RIGHT:
                    nextPosition.x = this.x + 1;
                    nextPosition.y = this.y;
                    break;
            }
            if (nextPosition.x < 0) {
                nextPosition.x = gameSize.width - 1;
            } else if (nextPosition.x >= gameSize.width) {
                nextPosition.x = 0;
            }
            if (nextPosition.y < 0) {
                nextPosition.y = gameSize.height - 1;
            } else if (nextPosition.y >= gameSize.height) {
                nextPosition.y = 0;
            }
            var hitTail = false;
            for (i = 0; !hitTail && i < this.bodySegments.length; i++) {
                seg = this.bodySegments.getChildAt(i);
                hitTail = nextPosition.x === seg.currentPosition.x &&
                    nextPosition.y === seg.currentPosition.y;
            }
            if (hitTail) {
                this.isAlive = false;
                deathReason = "You crashed into your own tail!";
                events.emit('playSound', 'death');
                game.state.start('gameover');
            } else {
                for (i = this.bodySegments.length - 1; i > 0; i--) {
                    seg = this.bodySegments.getChildAt(i);
                    var nextDirection;
                    var prevSeg = this.bodySegments.getChildAt(i - 1);
                    seg.currentPosition.x = prevSeg.currentPosition.x;
                    seg.currentPosition.y = prevSeg.currentPosition.y;
                    seg.x = seg.currentPosition.x * cellSize + halfCellSize;
                    seg.y = seg.currentPosition.y * cellSize + halfCellSize;
                    seg.direction = prevSeg.direction;
                }
                this.x = nextPosition.x;
                this.y = nextPosition.y;
                this.head.x = this.x * cellSize + halfCellSize;
                this.head.y = this.y * cellSize + halfCellSize;
                this.head.currentPosition.x = this.x;
                this.head.currentPosition.y = this.y;
                var apple = appleCoords[this.x][this.y];
                if (apple) {
                    var appleColour = apple.colour;
                    if (appleColour !== 'diamond') {
                        this.addSegment(appleColour);
                        var munchIndex = Math.floor(Math.random() * 4);
                        if (appleColour !== 'brown') {
                            events.emit('playSound', 'munches', 'munch' + munchIndex);
                        } else {
                            events.emit('playSound', 'munches', 'yuck' + munchIndex);
                        }
                    } else {
                        this.flushBrowns();
                    }
                    apple.destroy();
                    var shouldAdvanceTutorial = game.tutorialMode &&
                        game.tutorialStep === 1 ||
                        game.tutorialStep === 5 ||
                        game.tutorialStep === 6;
                    if (shouldAdvanceTutorial) {
                        this.secondsPerStep -= 0.05;
                        events.emit('advanceTutorial');
                    }
                }
                if (this.bodySegments.length > 2) {
                    this.detectColourMatch(1);
                }
            }
        }/* else if (this.actCount % raiseSegmentStep === 0) {
            var maxInfluence = this.bodySegments.length / 4;
            for (var i = 1; i < this.bodySegments.length; i++) {
                seg = this.bodySegments.getChildAt(i);
                if (i === raisedSegmentIndex) {
                    seg.y = (seg.currentPosition.y - 1) * cellSize - halfCellSize;
                } else {
                    var influence = Math.round(30 * Math.max(maxInfluence - Math.abs(i - raisedSegmentIndex), 0) / maxInfluence);
                    seg.y = (seg.currentPosition.y) * cellSize - halfCellSize - influence;
                }
            }
        }*/
    },
    onTap: function(e) {
        if (!this.isAlive) {
            game.state.start("main");
            return;
        }
        if (!this.interactive) {
            return;
        }
        var tapX = e.x;
        var tapY = e.y;

        var tappedLeft = tapX < game.world.width / 2;
        var tappedUp = tapY < game.world.height / 2;
        var travellingVertically = this.head.direction === UP || this.head.direction === DOWN;

        if (travellingVertically) {
            if (tappedLeft) {
                this.head.direction = LEFT;
                events.emit('directionSeen', LEFT);
            } else {
                this.head.direction = RIGHT;
                events.emit('directionSeen', RIGHT);
            }
        } else {
            if (tappedUp) {
                this.head.direction = UP;
                events.emit('directionSeen', UP);
            } else {
                this.head.direction = DOWN;
                events.emit('directionSeen', DOWN);
            }
        }
        switch (this.head.direction) {
            case UP:
                this.head.frame = 13;
                break;
            case RIGHT:
                this.head.frame = 10;
                break;
            case DOWN:
                this.head.frame = 12;
                break;
            case LEFT:
                this.head.frame = 11;
                break;
        }
    },
    addSegment: function(colour) {
        var x, y;
        score += colours[colour].score;
        if (this.head.direction === LEFT || this.head.direction === RIGHT) {
            y = this.head.currentPosition.y;
        } else {
            x = this.head.currentPosition.x;
        }
        switch (this.head.direction) {
            case UP:
                y = this.head.currentPosition.y + 1;
                break;
            case DOWN:
                y = this.head.currentPosition.y - 1;
                break;
            case LEFT:
                x = this.head.currentPosition.x + 1;
                break;
            case RIGHT:
                x = this.head.currentPosition.x - 1;
                break;
        }
        var newSeg = game.add.sprite(x * cellSize + halfCellSize, y * cellSize + halfCellSize, 'sprites', colours[colour].frames.caterpillar);
        newSeg.anchor.setTo(0.5, 0.5);
        newSeg.currentPosition = {
            x: x,
            y: y
        };
        newSeg.direction = this.head.direction;
        newSeg.colour = colour;
        this.bodySegments.addChildAt(newSeg, 1);
        for (var i = 2; i < this.bodySegments.length - 1; i++) {
            var seg = this.bodySegments.getChildAt(i);
            var nextSeg = this.bodySegments.getChildAt(i + 1);
            seg.currentPosition.x = nextSeg.currentPosition.x;
            seg.currentPosition.y = nextSeg.currentPosition.y;
            seg.x = seg.currentPosition.x * cellSize + halfCellSize;
            seg.y = seg.currentPosition.y * cellSize + halfCellSize;
        }
        var finalSeg = this.bodySegments.getChildAt(this.bodySegments.length - 1);
        var newX, newY;
        if (finalSeg.direction === LEFT || finalSeg.direction === RIGHT) {
            newY = finalSeg.currentPosition.y;
        } else {
            newX = finalSeg.currentPosition.x;
        }
        switch (finalSeg.direction) {
            case UP:
                newY = finalSeg.currentPosition.y + 1;
                break;
            case DOWN:
                newY = finalSeg.currentPosition.y - 1;
                break;
            case LEFT:
                newX = finalSeg.currentPosition.x + 1;
                break;
            case RIGHT:
                newX = finalSeg.currentPosition.x - 1;
                break;
        }
        finalSeg.currentPosition.x = newX;
        finalSeg.currentPosition.y = newY;
        finalSeg.x = finalSeg.currentPosition.x * cellSize + halfCellSize;
        finalSeg.y = finalSeg.currentPosition.y * cellSize + halfCellSize;
 
        scoreTexts.push(new ScoreText(newSeg.x, newSeg.y, colours[colour].hex, colours[colour].score));
    },
    detectColourMatch: function(startIndex) {
        this.isMerging = false;
        var startSeg = this.bodySegments.getChildAt(startIndex);
        console.log("Detect " + startSeg.colour + "s");
        var i = 0;
        console.log("\t" + startIndex + ": " + startSeg.colour);
        var endIndex = startIndex;
        var foundMatch = true;
        var nextSeg;
        while (i + startIndex < this.bodySegments.length - 1 && i < 2 && foundMatch) {
            i++;
            nextSeg = this.bodySegments.getChildAt(i + startIndex);
            console.log("\t" + (i + startIndex) + ": " + nextSeg.colour);
            if (nextSeg.colour === startSeg.colour) {
                endIndex = i + startIndex;
            } else {
                foundMatch = false;
            }
        }
        if (!foundMatch) i--;
        console.log("Found " + (i + 1) + " " + startSeg.colour + "s");
        if (i === 2 && foundMatch) {
            if (startSeg.colour === 'brown') {
                this.isAlive = false;
                deathReason = "You ate too many rotten apples!"
                events.emit('playSound', 'death');
                game.state.start('gameover');
            } else if (startSeg.colour !== 'diamond'){
                this.startMerge(startIndex, endIndex);
            }
            // found 3 in a row!
        }
        /*var segmentsToRemove = [startSeg];
        var match = true;
        i = startIndex;
        while (i < this.bodySegments.length - 1 && match) {
            seg = this.bodySegments.getChildAt(++i);
            if (seg.colour === startSeg.colour) {
                segmentsToRemove.push(seg);
                console.log(seg.colour);
            } else {
                match = false;
                console.log("Found " + segmentsToRemove.length + " " + startSeg.colour + " segment" + (segmentsToRemove.length > 1 ? "s" : ""));
            } 
        }

        if (segmentsToRemove.length > 2) {
            if (startSeg.colour !== 'brown') {
                setTimeout(function() {
                    var nextColour = colours[startSeg.colour].next;
                    for (var i = 0; i < segmentsToRemove.length; i++) {
                        this.bodySegments.remove(segmentsToRemove[i]);
                        if ((i + 1) % 3 === 0) {
                            if (nextColour) {
                                this.addSegment(nextColour);
                            }
                        }
                    }
                }.bind(this), 500);
            }
        } else if (segmentsToRemove.length > 0) {
            var nextIndex = startIndex + segmentsToRemove.length;
            if (nextIndex < this.bodySegments.length) {
                var nextSegment = this.bodySegments.getChildAt(nextIndex);
                this.detectColourMatch(nextSegment, nextIndex);
            }
        }*/

    },
    flushBrowns: function() {
        var newBody = [], i, seg;
        newBody.push(this.head);
        for (i = 1; i < this.bodySegments.length; i++) {
            seg = this.bodySegments.getChildAt(i);
            console.log(seg.colour);
            if (seg.colour !== 'brown') {
                newBody.push(seg);
            }
        }
        var newBodySegments = game.add.group();
        for (i = 0; i < newBody.length; i++) {
            seg = newBody[i];
            newBodySegments.addChild(seg);
        }
        this.bodySegments.destroy();
        this.bodySegments = newBodySegments;
        for (i = 1; i < this.bodySegments.length; i++) {
            seg = this.bodySegments.getChildAt(i);
            var prevSeg = this.bodySegments.getChildAt(i - 1);
            if (prevSeg.direction === LEFT || prevSeg.direction === RIGHT) {
                seg.currentPosition.y = prevSeg.currentPosition.y;
            } else {
                seg.currentPosition.x = prevSeg.currentPosition.x;
            }
            switch (prevSeg.direction) {
                case UP:
                    seg.currentPosition.y = prevSeg.currentPosition.y + 1;
                    break;
                case DOWN:
                    seg.currentPosition.y = prevSeg.currentPosition.y - 1;
                    break;
                case LEFT:
                    seg.currentPosition.x = prevSeg.currentPosition.x + 1;
                    break;
                case RIGHT:
                    seg.currentPosition.x = prevSeg.currentPosition.x - 1;
                    break;
            }
            seg.x = seg.currentPosition.x * cellSize + halfCellSize;
            seg.y = seg.currentPosition.y * cellSize + halfCellSize;
            seg.direction = prevSeg.direction;
        }
    },
    print: function() {
        var string = "";
        for (var i = 0; i  < this.bodySegments.length; i++) {
            string += (i === 0 ? "X" : this.bodySegments.getChildAt(i).currentPosition.x + ",");
        }
        console.log(string + score);
    },
    startMerge: function(startIndex, endIndex) {
        this.mergingSegments = [];
        this.isMerging = true;
        this.mergeStep = 0;
        this.mergeStart = startIndex;
        var startSeg =  this.bodySegments.getChildAt(startIndex);
        this.mergeColour = startSeg.colour;
        console.log("Start " + this.mergeColour + " merge from " + endIndex + " to " + startIndex);
        for (var i = 0; i < this.bodySegments.length; i++) {
            var distance = i - startIndex;
            if (distance > 0) {
                var seg = this.bodySegments.getChildAt(i);
                if (distance < 3) {
                    seg.targetPosition = {
                        x: startSeg.currentPosition.x,
                        y: startSeg.currentPosition.y
                    };
                } else {
                    var targetSeg = this.bodySegments.getChildAt(startIndex + (distance - 2));
                    seg.targetPosition = {
                        x: targetSeg.currentPosition.x,
                        y: targetSeg.currentPosition.y
                    };
                }

            }
        }
    },
    onMergeFinished: function() {
        var i, seg;
        console.log("Merge finished");
        var pingIndex = -1;
        switch(this.mergeColour) {
            case 'red':
                pingIndex = 0;
                break;
            case 'green':
                pingIndex = 1;
                break;
            case 'gold':
                pingIndex = 2;
                break;
        }
        if (pingIndex > -1) {
            events.emit('playSound', 'pings', 'ping' + pingIndex);
        }
        for (i = this.bodySegments.length - 1; i > this.mergeStart + 2; i--) {
            seg = this.bodySegments.getChildAt(i);
            var prevSeg = this.bodySegments.getChildAt(i - 3);
            seg.currentPosition.x = prevSeg.currentPosition.x;
            seg.currentPosition.y = prevSeg.currentPosition.y;
        }
        var segmentsToRemove = [];
        for (i = 0; i < 3; i++) {
            segmentsToRemove.push(this.bodySegments.getChildAt(i + this.mergeStart));
        }
        for (i = 0; i < segmentsToRemove.length; i++) {
            this.bodySegments.remove(segmentsToRemove[i]);
        }
        var nextColour = colours[this.mergeColour].next; 
        if (nextColour) {
            this.addSegment(nextColour);
        }
        if (this.mergeStart + 1 < this.bodySegments.length) {
            this.detectColourMatch(this.mergeStart + 1);
        }
        if (game.tutorialMode) {
            switch (game.tutorialStep) {
                case 2:
                    this.secondsPerStep -= 0.05;
                    break;
                case 3:
                    events.emit('destroyApples');
                    this.secondsPerStep -= 0.05;
                    break;
            }
            game.tutorialApplesReady = false;
            events.emit('advanceTutorial');
        }
    }
};
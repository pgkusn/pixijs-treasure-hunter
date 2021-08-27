let app = new PIXI.Application({
    width: 512,
    height: 512
});
document.body.appendChild(app.view);

PIXI.loader
    .add('images/treasureHunter.json')
    .load(setup);

function setup() {
    let id = PIXI.loader.resources['images/treasureHunter.json'].textures;
    
    // bg
    let gameScene = new PIXI.Container();
    app.stage.addChild(gameScene);

    // dungeon
    let dungeon = new PIXI.Sprite(id['dungeon.png']);
    gameScene.addChild(dungeon);

    // door
    let door = new PIXI.Sprite(id['door.png']);
    door.position.set(32, 0);
    gameScene.addChild(door);

    // explorer
    let explorer = new PIXI.Sprite(id['explorer.png']);
    explorer.position.set(62, gameScene.height / 2 - explorer.height / 2);
    explorer.vx = 0;
    explorer.vy = 0;
    gameScene.addChild(explorer);
    
    // blob
    let blobs = [];
    for (let i = 0; i < 3; i++) {
        let blob = new PIXI.Sprite(id['blob.png']);
        let y = Math.random() * (490 - 10) + 10;
        blob.position.set(80 * i + 150, y);
        blob.vy = 5;
        gameScene.addChild(blob);
        blobs.push(blob);
    }
    
    // treasure
    let treasure = new PIXI.Sprite(id['treasure.png']);
    treasure.position.set(420, gameScene.height / 2 - treasure.height / 2);
    gameScene.addChild(treasure);

    // game over
    let gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    app.stage.addChild(gameOverScene);
    let style = new PIXI.TextStyle({
        fill: '#fff',
        fontSize: 36
    });
    let message = new PIXI.Text('Game Over', style);
    message.x = app.view.width / 2 - message.width / 2;
    message.y = app.view.height / 2 - message.height / 2;
    gameOverScene.addChild(message);

    // blood bar
    let bloodBar = new PIXI.Container();
    bloodBar.position.set(app.stage.width - 170, 4);
    gameScene.addChild(bloodBar);
    
    // inner blood bar
    let innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 130, 10);
    innerBar.endFill();
    bloodBar.addChild(innerBar);
    
    // outer blood bar
    let outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xFF0000);
    outerBar.drawRect(0, 0, 130, 10);
    outerBar.endFill();
    bloodBar.addChild(outerBar);

    app.ticker.add(() => {
        // explorer move
        explorer.x += explorer.vx;
        explorer.y += explorer.vy;
        contain(explorer, {x: 28, y: 10, width: 488, height: 480});

        // blob move
        for (const blob of blobs) {
            blob.y += blob.vy;
            let result = contain(blob, {x: 28, y: 10, width: 488, height: 480});
            if (result === 'bottom') {
                blob.vy = -5;
            }
            else if (result === 'top') {
                blob.vy = 5;
            }
        }
        
        // hit treasure
        if (hitTestRectangle(explorer, treasure)) {
            treasure.x = explorer.x + 10;
            treasure.y = explorer.y + 10;
        }

        // hit blob or not
        let explorerHit = false;
        for (const blob of blobs) {
            if (hitTestRectangle(explorer, blob)) {
                explorerHit = true;
            }
        }
        if (explorerHit) {
            explorer.alpha = 0.5;
            outerBar.width--;
        }
        else {
            explorer.alpha = 1;
        }

        // win
        if (hitTestRectangle(treasure, door)) {
            message.text = 'You Win!';
            gameScene.visible = false;
            gameOverScene.visible = true;
        }
        
        // lose
        if (outerBar.width <= 0) {
            message.text = 'You Lose!';
            gameScene.visible = false;
            gameOverScene.visible = true;
        }
    });

    // keyboard event
    window.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp':
                explorer.vy = -5;
                break;
            case 'ArrowDown':
                explorer.vy = 5;
                break;
            case 'ArrowLeft':
                explorer.vx = -5;
                break;
            case 'ArrowRight':
                explorer.vx = 5;
                break;
            default:
                break;
        }
    });
    window.addEventListener('keyup', e => {
        explorer.vx = 0;
        explorer.vy = 0;
    });
}

function contain(sprite, container) {

    let collision = undefined;
  
    //Left
    if (sprite.x < container.x) {
      sprite.x = container.x;
      collision = "left";
    }
  
    //Top
    if (sprite.y < container.y) {
      sprite.y = container.y;
      collision = "top";
    }
  
    //Right
    if (sprite.x + sprite.width > container.width) {
      sprite.x = container.width - sprite.width;
      collision = "right";
    }
  
    //Bottom
    if (sprite.y + sprite.height > container.height) {
      sprite.y = container.height - sprite.height;
      collision = "bottom";
    }
  
    //Return the `collision` value
    return collision;
}

function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

        //A collision might be occuring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {

            //There's definitely a collision happening
            hit = true;
        } else {

            //There's no collision on the y axis
            hit = false;
        }
    } else {

        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
};
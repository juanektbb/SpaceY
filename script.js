//When the window is loaded
window.addEventListener('load', init);

function init(){

    //CREATE THE CANVAS
    var canvas = document.getElementById("theCanvas");
    var ctx = canvas.getContext("2d");

    canvas.width = 1200;
    canvas.height = 600;

    var fixTimeRound = 8;
    
    //CREATE THE OBJECT GAME
    var game = {
        status: 'Starting',
        round: 0,
        allowEnemies: 0,
        timeRound: fixTimeRound,
        totalRounds: 1
    }
    
    //CREATE THE OBJECT SHIP
    var ship = {
        x: 100,
        y: canvas.height - 75,
        width: 30,
        height: 47,
        counter: 0,
        status: 'Alive',
        bullets: 18,
        grumsKilled: 0
    }
    
    //OBJECT TO KEEP THE KEYS TO BE PRESSED
    var keys = {}
    
    //CREATES ARRAY FOR ALL SHOOTS AND A BOOL TO ALLOW ONE SHOT PER PRESS
    var shoots = [];
    var keyBoolShoot = false;
    
    //ARRAY WITH ENEMIES AND THEIR DROPS
    var enemies = [];
    var enemiesShoots = [];
    var specialBullets = [];
    
    //VAR TO KEEP THE BACKGROUND
    var background;
    
    //CREATES THE OBJECT TEXT
    var textResponse = {
        counter: -1,
        title: '',
        subtitle: ''
    }
    
    //AUDIOS NEED TO BE DECLARED ONLY ONCE HERE
    var simpleShoot = new Audio("./audios/simpleShoot.wav");
    var gameOver = new Audio("./audios/gameOver.wav");
    var winSound = new Audio("./audios/win.mp3");
    var enemySound = new Audio("./audios/enemy.mp3");
    var lifeSound = new Audio("./audios/life.wav");
    
    winSound.volume = 0.1;
    simpleShoot.volume = 0.1;
    
    //SET THE INTERVAL FOR UPDATING EVERY SECOND
    var intervalRound = setInterval(roundFunc, 1000);

    /**********************************************************/
    
    /*-----------------------------------------------
            ALL FUNCTIONS DECLARED UNDERNEATH
    -----------------------------------------------*/
    //FUNCTION TO BE CALLED WHEN ALL HAS BEEN LOADED    
    function loadMedia(){
        background = new Image(); 
        background.src = "./images/canvas-bg.jpg";
        
        spaceShip = new Image();
        spaceShip.src = "./images/ship.png";
        
        spaceShipDead = new Image();
        spaceShipDead.src = "./images/ship-dead.png";
        
        enemyImg = new Image();
        enemyImg.src = "./images/enemy.png";
        
        bulletImg = new Image();
        bulletImg.src = "./images/bullet.png"
        
        //When the background has been loaded, the frameLoop is going to called every x time
        background.onload = function(){ 
            var interval = window.setInterval(frameLoop, 1000/55);
        }
    }
    
    //FUNCTION CALLED EVERY SECOND TO UPDATE THE ROUND
    function roundFunc(){
        
        //The round reaches 6 then starts again
        if(game.round < 6){

            //Reduce the time round        
            if(game.timeRound > 0){
                game.timeRound--;

            //Create another round
            }else{
                game.timeRound = fixTimeRound;
                ship.bullets += 18;
                game.round++;
                game.allowEnemies = 1;
                game.totalRounds += 1;
            }
            
        //Restart to the first round
        }else{
            game.round = 0;
        }
        
    }
    
    
    /*------------------------------------
                DRAW FUNCTIONS
    ------------------------------------*/
    //DRAW BACKGROUND
    function drawBackground(){
        ctx.drawImage(background,0,0);
    }
    
    //DRAW ENEMIES
    function drawEnemies(){
        for(var i in enemies){
            //If the enemy is alive, draw it
            if(enemies[i].status == 1){
                ctx.drawImage(enemyImg, enemies[i].x, enemies[i].y);
            }
        }
    }
    
    //DRAW THE ENEMIES BULLETS
    function drawEnemiesShoots(){  
        ctx.save();
        ctx.fillStyle = 'yellow'; 
        for(var i in enemiesShoots){ 
            ctx.fillRect(enemiesShoots[i].x, enemiesShoots[i].y, enemiesShoots[i].width, enemiesShoots[i].height);      
        }
        ctx.restore();
    }
    
    //DRAW THE SPACE SHIP
    function drawSpaceShip(){
        if(ship.status == 'Dead' || ship.status == 'Hit'){
            ctx.drawImage(spaceShipDead, ship.x, ship.y);
        }else{
            ctx.drawImage(spaceShip, ship.x, ship.y);
        }
    }
    
    //DRAW BULLETS
    function drawShoots(){
        ctx.save();
        ctx.fillStyle = 'white';
        for(var i in shoots){
            ctx.fillRect(shoots[i].x, shoots[i].y, shoots[i].width, shoots[i].height);
        }
        ctx.restore();
    }
    
    //DRAW SPECIAL BULLETS
    function drawSpecial(){
        ctx.save();
        for(var i in specialBullets){
            ctx.drawImage(bulletImg,specialBullets[i].x,specialBullets[i].y);
        }
        ctx.restore();
    }
    
    //DRAW TEXT IN THE SCREEN
    function drawText(){
        ctx.save();
        ctx.fillStyle = "White";
        ctx.font = "Bold 15pt Gamja Flower";
        ctx.fillText("Grums: " + enemies.length, 10, 20);
        ctx.fillText("Missils: " + ship.bullets, 10, 40);
        
        ctx.fillText("Kills: " + ship.grumsKilled, canvas.width - 70, canvas.height - 10);
        ctx.fillText("Rounds: " + game.totalRounds, canvas.width - 160, canvas.height - 10);
        
        ctx.font = "Bold 60pt Gamja Flower";
        ctx.fillText(game.timeRound, canvas.width - 40, 53);
        ctx.restore();
        
        /***** TEXT FOR THE END OF THE GAME *****/
        //IF the counter hasn't changed, leave the functions
        if(textResponse.counter == -1){
            return false;
        }
        
        //INCLUDE EFFECTS
        if(textResponse.counter >= 0){
            textResponse.counter++;
        }
        
        //ALPHA IS GOING TO KEEP THE SPEED FROM 0 TO 1 TO APPLY IN globalAlpha UNDERNEATH
        var alpha = textResponse.counter/50.0;
        
        //DELETE ELEMENTS SO IT CAN NOT BE PLAYED AGAIN
        if(alpha > 0){
            for(var i in enemies){
                delete enemies[i];
            }
        }
        
        //ACTUAL DRAWING TEXT
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.globalAlpha = alpha; //Alpha changes shown on top
        
        ctx.font = 'Bold 50pt Gamja Flower';
        ctx.fillText(textResponse.title,140,200);
        ctx.font = '25pt Gamja Flower';
        ctx.fillText(textResponse.subtitle,150,240);        
        ctx.restore();
    }
    
    
    /*------------------------------------
                KEYS FUNCTIONS
    ------------------------------------*/
    //PRESSED KEYS
    function pressedKeys(){
        
        //IF THE KEY 37 IS TRUE (PRESSED) LEFT
        if(keys[37]){
            ship.x -= 5;

            //Find the limit of movement
            if(ship.x < 10){
                ship.x = 10;
            }
        }
        
        //IF THE KEY 39 IS TRUE (PRESSED) RIGHT
        if(keys[39]){
            ship.x += 5;

            //Find the limit of movement
            var limit =  canvas.width - ship.width - 10;
            if(ship.x > limit){
                ship.x = limit;
            }
        }
        
        //IF THE KEY 32 IS TRUE (PRESSED) SHOOT
        if(keys[32]){

            //The boolean must be FALSE 
            if(!keyBoolShoot){
                fire();
                keyBoolShoot = true; //Make the boolean true, so it doesn't allow to use this IF again for the FIRE()
            }
            
        //THE KEY MUST BE FALSE WHICH MEANS A RELEASE (keyup)    
        }else{
            keyBoolShoot = false; //The boolean becomes false, so it can be used again in the previous IF statement
        }
        
    }
    
    //SEND OUR BULLETS
    function fire(){
        if(ship.bullets > 0){
            shoots.push({
                x: ship.x + (ship.width / 2) - 2.5,
                y: ship.y - 10,
                width: 5,
                height: 10,
                status: 1
            });
            
            ship.bullets--;
            simpleShoot.play(); //Sound of shooting
        }
    }
    
    
    /*------------------------------------
                AUTO FUNCTIONS
    ------------------------------------*/
    //CREATES ENEMIES, MOVE THEM AND ADD SHOOTS
    function updateEnemies(){
                
        //WHEN THE GAMES STARTS, CREATES THE ENEMIES
        if(game.status == 'Starting' || game.allowEnemies == 1){
            for(var i = 0; i < 10; i++){
                enemies.push({
                    x: 10 + (i * 50), 
                    y: 10 + game.round * 50,
                    width: 55,
                    height: 40,
                    status: 1,
                    speed: (Math.random() * 7) + 2,
                    counter: 0
                });  
            }
            game.allowEnemies = 0;
            game.status = 'Playing';
        }
        
        //PUSH AN ENEMY SHOOT
        function addEnemyShoot(enemy){
            return {
                x: enemy.x + (enemy.width / 2) + 2.5,
                y: enemy.y + enemy.height,
                width: 5,
                height: 10,
                status: 1,
                counter: 0
            }
        }
        
        //PUSH SPECIAL SHOOT TO ARRAY
        function addSpecialShoot(enemy){
            return {
                x: enemy.x + (enemy.width / 2) - 10,
                y: enemy.y + enemy.height,
                width: 25,
                height: 25,
                status: 1
            }
        }
        
        //MOVEMENT OF THE ENEMIES
        for(var i in enemies){

            //If the enemy is false, jump to next iteration
            if(!enemies[i]){
                continue;
            }
            
            //If the enemy is true and it is alive
            if(enemies[i] && enemies[i].status == 1){
                enemies[i].counter++;
                
                //Limit to the right
                if(enemies[i].x > canvas.width + 50){
                    enemies[i].speed = -enemies[i].speed;
                }
                
                //Limit to the left
                if(enemies[i].x < -50){
                    enemies[i].speed = enemies[i].speed * -1;
                }
                
                //Make the actual movement
                enemies[i].x += enemies[i].speed;
                
                //Call the random function, if returns 4 then push a bullet the enemiesShoots
                if(random(0,enemies.length * 5) == 4){
                    enemiesShoots.push(addEnemyShoot(enemies[i]));
                }
                
                if(random(0, enemies.length * 100) == 1){
                    specialBullets.push(addSpecialShoot(enemies[i]));
                }
                
            }
        }
        
        //THIS IS GOING TO REMOVE THE ENEMIES FROM THE ARRAY
        enemies = enemies.filter(function(e){
            if(e && e.status != 0){ //If the enemy is ALIVE
                return true;
            }else{
                return false;
            }
        });
                
    }
    
    //MOVE OUR SHOOTS
    function moveShoots(){
        
        //Actual movement
        for(var i in shoots){
            var shoot = shoots[i];
            shoots[i].y -= 10;
        }
        
        //Remove shoots out of canvas
        shoots = shoots.filter(function(shoot){
            return shoot.y > 0;
        });

    }
    
    //MOVE THE ENEMIES BULLETS
    function moveEnemiesShoots(){

        //Actual movement
        for(var i in enemiesShoots){
            var singleShoot = enemiesShoots[i];
            enemiesShoots[i].y += 3;
        }
        
        //Remove enemies shoots out of canvas
        enemiesShoots = enemiesShoots.filter(function(singleShoot){
            return singleShoot.y < canvas.height;
        });

    }
    
    //MOVE SPECIAL SHOOT
    function moveSpecialShoot(){
        
        //Actual movement
        for(var i in specialBullets){
            specialBullets[i].y += 3; 
        }
        
        //Remove special bullets out of canvas
        specialBullets = specialBullets.filter(function(abc){
            return abc.y < canvas.height
        });
        
    }
    
    //CHECK ALL COLLISIONS 
    function checkCollision(){
        
        //COLLISION MY SHOOTS 
        for(var i in shoots){
            for(var j in enemies){
                if(collision(shoots[i],enemies[j]) && shoots[i].status == 1){
                    enemySound.play();
                    enemies[j].status = 0;
                    shoots[i].status = 0;
                    ship.grumsKilled += 1; 
                }
            }
        }   
        
        shoots = shoots.filter(function(a){
            return a.status != 0;
        });
   
        //IF THE SHIP IS ALIVE THEN WAIT FOR THE COLLISION
        if(ship.status == 'Alive'){
            
            //COLLISION SPECIAL BULLETS
            for(var i in specialBullets){
                if(collision(specialBullets[i],ship) && game.status == "Playing" && specialBullets[i].status == 1){
                    specialBullets[i].status = 0;
                    ship.bullets += 3;   
                    lifeSound.play();
                }
            }

            specialBullets = specialBullets.filter(function(a){
                return a.status != 0;
            });
            
            //COLLISION ENEMY'S BULLETS
            for(var i in enemiesShoots){
                if(collision(enemiesShoots[i],ship) && game.status == "Playing"){
                    ship.status = 'Hit';
                    ship.bullets = 0;
                    enemiesShoots[i].status = 0;
                    gameOver.play(); //Play sound 
                }
            }
            
            enemiesShoots = enemiesShoots.filter(function(a){
                return a.status != 0;
            });
            
         }  
        
    }
    
    //UPDATE STATUS
    function updateStatusGame(){
      
        //IF THE USER WINS
        if(game.status == 'Playing' && enemies.length == 0){
            game.status = 'Win';
            textResponse.title = 'You win';
            textResponse.subtitle = 'Press R to restart';
            textResponse.counter = 0;
            winSound.play();
            
            clearInterval(intervalRound);
        }
        
        //IF THE STATUS OF SHIP IS HIT (ONLY ONCE)
        if(ship.status == 'Hit'){

            //The ship.counter delays a bit to achieve a better effect
            ship.counter++;
            
            if(ship.counter >= 20){
                ship.counter = 0;
                ship.status = 'Dead';
                game.status = 'Lost';
                
                textResponse.title = 'Game Over';
                textResponse.subtitle = 'Press R to continue';
                textResponse.counter = 0;
                
                clearInterval(intervalRound);
            }

        }
        
        //RESTART THE GAME PRESSING R
        if((game.status == 'Lost' || game.status == 'Win') && keys[82]){
            ship.x = 100;
            ship.bullets = 18;
            ship.status = 'Alive';
            ship.grumsKilled = 0;
            
            textResponse.counter = -1;
            
            game.status = 'Starting';
            game.timeRound = fixTimeRound;
            game.allowEnemies = 0;
            game.round = 0;
            game.totalRounds = 1;
            
            intervalRound = setInterval(roundFunc, 1000);
        }
        
    }
    
    
    /*******************************
            HELPER FUNCTIONS
    *******************************/
    //RANDOM RETURNS AN INTEGER
    function random(low, high){
        var positibilites = high - low;
        var a = Math.random() * positibilites;
        
        a = Math.floor(a);
        return parseInt(low) + a;
    }
    
    //KEY LISTENERS
    function addEventKeys(){
        
        //Add the pressed key to the array
        document.addEventListener("keydown",function(e){
            keys[e.keyCode] = true; //Associative key to a true value
        },false);

        //False the pressed key in the array when keyingup
        document.addEventListener("keyup",function(e){
             keys[e.keyCode] = false; //Associative key to a false value
        },false);
 
    }
    
    //ALGORITHM FOR COLLISION ---> B = Bullet, E = Enemy
    function collision(b, e){
        var hit = false;
        
        //Collision check 1
        if(e.x + e.width >= b.x && e.x < b.x + b.width){
            if(e.y + e.height >= b.y && e.y < b.y + b.height){
                hit = true;   
            }
        }
        
        //Collision check 2
        if(e.x <= b.x && e.x + e.width >= b.x + b.width){
            if(e.y <= b.y && e.y + e.height >= b.y + b.height){
               hit = true;
            }
        }
        
        //Collision check 3
        if(b.x <= e.x && b.x + b.width >= e.x + e.width){
            if(b.y <= e.y && b.y + b.height >= e.y + e.height){
               hit = true;
            }
        }
        
        return hit;
    }

    /**********************************************************/
    
    //FUNCTION FOR EVERY FRAME 1000/55
    function frameLoop(){
        
        //Automatically functions
        updateStatusGame()
        updateEnemies();
        moveEnemiesShoots();
        moveSpecialShoot();
        moveShoots();
        checkCollision();
        
        //Functions from the user
        pressedKeys();
        
        //Drawing items
        drawBackground();
        drawEnemies();
        drawSpecial();
        drawEnemiesShoots();
        drawShoots();
        drawText();
        drawSpaceShip();
        
    }
    
    //LOAD TO START
    loadMedia();
    addEventKeys();

}
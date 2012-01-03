/*
メインロジック
*/
// フィールドサイズ
var FIELD_SIZE_X  = 200,
    FIELD_SIZE_Y  = 150,
    FIELD_SIZE_Z  = 250;

// バーサイズ
var BAR_SIZE_X  = 56,
    BAR_SIZE_Y  = 56;

var BALL_DIAMETER = 20;

var BALL_RADIUS_2 = BALL_DIAMETER * BALL_DIAMETER / 4;

// ブロックサイズ
var BLOCK_SIZE_X = 50,
    BLOCK_SIZE_Y = 50,
    BLOCK_SIZE_Z = 40;
// ボールスピード
var BALL_SPEED_X = 6,
    BALL_SPEED_Y = 6,
    BALL_SPEED_Z = 3;

var TRANS3D_2_2D_XPARAM = 2/Math.sqrt(5),
    TRANS3D_2_2D_YPARAM = 1/Math.sqrt(5);

// var TRANS3D_2_2D_XPARAM = 2/Math.cbrt(5),
//     TRANS3D_2_2D_YPARAM = 1/Math.cbrt(5);


var BAR_IMAGE_PADDING   =   26;
// var BAR_IMAGE_PADDING   =   100;

var HIT_TOP     = 1;//上面ヒット
var HIT_BOTTOM  = 2;//下面ヒット
var HIT_FRONT   = 3;//前面ヒット
var HIT_BACK    = 4;//後面ヒット
var HIT_RIGHT   = 5;//右面ヒット
var HIT_LEFT    = 6;//左面ヒット

var GAMESTATE_WAIT = 0,
    GAMESTATE_PLAY = 1,
    GAMESTATE_DIE  = 2,
    GAMESTATE_CLEAR= 3;
/*----------------------------
    global  variables
----------------------------*/
var keyHits = {
            up    : false,
            down  : false,
            right : false,
            left  : false,
            start : false
                };
var cursol = {
            x : 0,
            y : 0,
            old_x: 0,
            old_y: 0
                };

var bar = {
            x  : 0,
            y  : 0,
            //life  : 1,
            image : null
                    };
var ball=   {
            x : 50,
            y : 0,
            z           :   60,
            vx          :   BALL_SPEED_X,
            vy          :   BALL_SPEED_Y,
            vz          :   BALL_SPEED_Z,
            image       :   null,
            shade       :   null
        };
var squerCnt = 4;
var OFFSETX = 1;
var OFFSETY = 300;

var blocks = new Array(squerCnt);
for(var i=0;i<blocks.length;i++){
    blocks[i] = new Array(squerCnt);
    for(var j=0;j<blocks[i].length;j++){
        blocks[i][j] = new Array(squerCnt);
    }
}

var blocksImage = new Array(squerCnt);
for(var i=0;i<blocksImage.length;i++){
    blocksImage[i] = new Array(squerCnt);
    for(var j=0;j<blocksImage[i].length;j++){
        blocksImage[i][j] = new Array(squerCnt);
    }
}

var gameover_msg;
var gamestart_msg;
var gameclear_msg;

var gameState = GAMESTATE_WAIT;
var blockLeft = 0;
var isPlayed = false;
var isDied = false;
var timerID;

function stage(x,y,z){
    return (true);
}

function initGame(){
    
    //debugInit();//#
    initDraw();
    
    document.onkeydown  = function(eve){
        var key = eve ? eve.keyCode : window.event.keyCode ;
        updateKeyState(key,true);
    }
    document.onkeyup = function(eve){
        var key = eve ? eve.keyCode : window.event.keyCode ;
        updateKeyState(key,false);
    }
    
    document.onmousemove = function(eve){
        var offsetX = OFFSETX,offsetY = OFFSETY;
        var x = eve ? eve.clientX : window.event.clientX ;
        var y = eve ? eve.clientY : window.event.clientY ;
        
        var trans_x=(x-offsetX)/(2*TRANS3D_2_2D_XPARAM)-(y-offsetY )/(2*TRANS3D_2_2D_YPARAM)-BAR_SIZE_X/2;
        var trans_y=(x-offsetX)/(2*TRANS3D_2_2D_XPARAM)+(y-offsetY )/(2*TRANS3D_2_2D_YPARAM)-BAR_SIZE_Y/2;
// console.log("trans_x = " + trans_x);
// console.log("trans_y = " + trans_y);
        cursol.x = trans_x;
        cursol.y = trans_y;
    }
    
    document.onmousedown = function( eve ){
        var offsetX = OFFSETX;
        var x = eve ? eve.clientX : window.event.clientX ;
        var y = eve ? eve.clientY : window.event.clientY ;
        if(offsetX <= x && x <= offsetX + 360 
        && 0<= y && y <= 590 ){
            updateKeyState(13,true);
        }
    }

    document.onmouseup = function( eve ){
        var offsetX = OFFSETX;
        var x = eve ? eve.clientX : window.event.clientX ;
        var y = eve ? eve.clientY : window.event.clientY ;
        if(offsetX <= x && x <= offsetX + 360 
        && 0<= y && y <= 590 ){
            updateKeyState(13,false);
        }
    }
    
    timerID = setInterval("step()",50);
}
var waiting_min_msec = wait_until_msec = 2;
function step(){

    switch(gameState){
        case GAMESTATE_WAIT:
            if(isDied){
                resetStage();
                wait_until_msec = waiting_min_msec;
                isDied = false;
            }
            if(--wait_until_msec > 0){
                return;
            }
            waiting();
            break;
        case GAMESTATE_PLAY:
            //demo();//#
            if(!blockLeft){
                gameState = GAMESTATE_CLEAR;
                break;
            }
            updateBarPosition();
            updateBallPosition();
            draw();
            break;
        case GAMESTATE_DIE:
            isDied = true;
            gameover_msg.view();
            if(keyHits.start){
                gameover_msg.hide();
                gameState = GAMESTATE_WAIT;
            }
            break;
        
        case GAMESTATE_CLEAR:
            isDied = true;
            gameclear_msg.view();
            if(keyHits.start){
                gameclear_msg.hide();
                gameState = GAMESTATE_WAIT;
            }
            break;
    }
}

function updateKeyState(key,isHit){
    switch(key){
        case 37://←
            keyHits.left    = isHit;
            break;
        case 38://↑
            keyHits.up      = isHit;
            break;
        case 39://→
            keyHits.right   = isHit;
            break;
        case 40://↓
            keyHits.down    = isHit;
            break;
        case 13://enter
            keyHits.start = isHit;
            break;
        case 90:
            clearInterval(timerID);
        default:
            break;
    }
}

function initDraw(){
    bar.image = new createImage("bar.png",99,66);
    bar.image.setZ(2);
    ball.image= new createImage("ball.png",20,20);
    ball.image.setZ(4);
    ball.shade = new createImage("shade_t.png",20,20);
    ball.shade.setZ(3);
    // ball.image.hide();
    ball.shade.hide();
    // var ceil = new createImage("floor_t.png",357,179,OFFSETX,10,200);
    
    for(var z=0;z<blocks.length;z++){
        for(var x=0;x<blocks[z].length;x++){
            for(var y=0;y<blocks[z][x].length;y++){
                // blocksImage[z][x][y] = new createImage(
                //     "block_tt.png",
                //     89,
                //     84,
                //     TRANS3D_2_2D_XPARAM * ( x*BLOCK_SIZE_X + y*BLOCK_SIZE_Y ) + OFFSETX,
                //     TRANS3D_2_2D_YPARAM * ( y*BLOCK_SIZE_Y - x*BLOCK_SIZE_X) - (z+2)*BLOCK_SIZE_Z + 278,
                //     (y-x+7) + z*(blocks[z][x].length+blocks[z].length)
                // );
                blocks[z][x][y] = stage(x,y,z) ? 1 : 0;
                if(!stage(x,y,z)){
                    blocksImage[z][x][y].hide();
                }else{
                    blockLeft++;
                }
            }
        }
    }
    draw();
    gamestart_msg = new createImage("gamestart_t.png",358,200,OFFSETX,100,200);
    gameover_msg = new createImage("gameover_t.png",358,200,OFFSETX,100,200);
    gameover_msg.hide();
    gameclear_msg = new createImage("gameclear_t.png",358,200,OFFSETX,100,200);
    gameclear_msg.hide();
}

function draw(){
    var x,y,z,offsetX = OFFSETX,offsetY = OFFSETY;
    if(gameState == GAMESTATE_DIE){
        if((bar.y - bar.x)>(ball.y - ball.x)){
            var ball_z = ball.image.getZ();
            var bar_z = bar.image.getZ();
            ball.image.setZ(bar_z);
            bar.image.setZ(ball_z);
        }
    }
    //draw  bar
    x = TRANS3D_2_2D_XPARAM * (bar.y + bar.x) + offsetX;
    y = TRANS3D_2_2D_YPARAM * (bar.y - bar.x) - BAR_IMAGE_PADDING + offsetY;

    bar.image.setX(x);
    bar.image.setY(y);
    //draw  ball
    
    x = TRANS3D_2_2D_XPARAM * (ball.y + ball.x) + offsetX;
    y = TRANS3D_2_2D_YPARAM * (ball.y - ball.x) - ball.z + offsetY;

    {
        var indexX = Math.floor( ball.x/BLOCK_SIZE_X ),
            indexY = Math.floor( ball.y/BLOCK_SIZE_Y ),
            indexZ = Math.floor( ball.z/BLOCK_SIZE_Z )-4;
        z = indexY - indexX + 7;
        // z += indexZ >= 0 ? indexZ * (blocks[indexZ][indexX].length + blocks[indexZ].length): -4;
        z += indexZ >= 0 ? indexZ : -4;
    }
    // x = 100;
    // y = 100;
    // z = z + 10;
// console.log("xxxx = " + x);
// console.log("yyyy = " + y);
// console.log("zzzz = " + z);
// console.log("ball.img.y = " + y);
    ball.image.setX(x);
    ball.image.setY(y);
    ball.image.setZ(z);
// console.log("x=" + x);
// console.log("y=" + y);
// console.log("z=" + z);
// if(ball.x + BAR_SIZE_X < ball.x){
//     console.log("x over");
//     exit();
// }else if(bar.y > ball.y+BALL_DIAMETER ){
//     console.log("y over");
//     console.log("ball.image.z = " + ball.image.getZ());
//     exit();
// }
    z = (ball.z > BLOCK_SIZE_Z * 3) ? 1 :
            (bar.x+BAR_SIZE_X < ball.x || bar.y > ball.y+BALL_DIAMETER ) ? ball.image.getZ()+1 : 
            (ball.z < BALL_DIAMETER && (ball.x+BALL_DIAMETER/2 > bar+BAR_SIZE_X || ball.y+BALL_DIAMETER/2 < bar.y)) ? ball.image.getZ()+1:
            ball.image.getZ()-1;
    bar.image.setZ(z)
    //影描画
    y = TRANS3D_2_2D_YPARAM * (ball.y - ball.x) + offsetY;
    ball.shade.setX(x);
    ball.shade.setY(y);
    ball.shade.setZ(bar.image.getZ()+3);
}

function waiting(){
    if(keyHits.start){
        gameState = GAMESTATE_PLAY;
        gamestart_msg.hide();
        ball.image.view();
        ball.shade.view();
    }else{
        gamestart_msg.view();
    }
}


/*
ステージをリセット
*/
function resetStage(){
    bar.x = 0;              // barの座標をリセット
    bar.y = 0;              // barの座標をリセット

    bar.image.setZ(2);
    ball.x = 0;
    ball.y = 0;
    ball.z = 60;
    ball.vx = BALL_SPEED_X;
    ball.vy = BALL_SPEED_Y;
    ball.vz = BALL_SPEED_Z;
    ball.image.hide();
    ball.image.setZ(4);
    ball.shade.hide();
    blockLeft = 0;

    // for(var z=0;z<blocks.length;z++){
    //     for(var x=0;x<blocks[z].length;x++){
    //         for(var y=0;y<blocks[z][x].length;y++){
    //             blocks[z][x][y] = stage(x,y,z) ?1:0;
    //             if(!( stage(x,y,z) )){
    //                 blocksImage[z][x][y].hide();
    //             }else{
    //                 blocksImage[z][x][y].view();
    //                 blockLeft++;
    //             }
    //         }
    //     }
    // }
    draw();
}

function updateBarPosition(){
    var moveSpeed = 10;
    var x, y;
    //キー入力を座標に反映
    x = keyHits.left    ?   bar.x - moveSpeed   :
            keyHits.right   ?   bar.x   +   moveSpeed   :
            bar.x   ;
    y = keyHits.up      ?   bar.y - moveSpeed   :
            keyHits.down    ?   bar.y   +   moveSpeed   :
            bar.y   ;
    //マウス入力を座標に反映
    x = cursol.x != cursol.old_x ?  cursol.x    : x ;
    y = cursol.y != cursol.old_y ?  cursol.y    : y ;
    //フィールド内に制限
    // x   =   x > FIELD_SIZE_X - BAR_SIZE_X ? FIELD_SIZE_X - BAR_SIZE_X : x < 0 ? 0 : x;
    // y   =   y > FIELD_SIZE_Y - BAR_SIZE_Y ? FIELD_SIZE_Y - BAR_SIZE_Y : y < 0 ? 0 : y;
    bar.x = x;
    bar.y = y;
    cursol.old_x = cursol.x;
    cursol.old_y = cursol.y;
}

function updateBallPosition(){
    var x,y,z;
    //速度反映
    x = ball.x + ball.vx;
    y = ball.y + ball.vy;
    z = ball.z + ball.vz;

    //壁との当たり判定
    // if(x > FIELD_SIZE_X - BALL_DIAMETER){
    //     x = 2*(FIELD_SIZE_X - BALL_DIAMETER)-x;
    //     ball.vx = -ball.vx;
    if(x > FIELD_SIZE_X ){
        x = 2*(FIELD_SIZE_X )-x;
        ball.vx = -ball.vx;
console.log("折り返しX");
    }else if(x < 50){
console.log("折り返しX = 50");
        // x = -x;
        ball.vx = -ball.vx;
    }
y = 150;
    if(y > FIELD_SIZE_Y - BALL_DIAMETER - 20){
console.log("折り返しY");
        y = 2*(FIELD_SIZE_Y - BALL_DIAMETER - 20)-y;
        ball.vy = -ball.vy;
    }else if(y < 0){
console.log("折り返しY = 0");
        y = -y;
        ball.vy = -ball.vy;
    }

    if(z > FIELD_SIZE_Z){
        z = 2*FIELD_SIZE_Z-z;
        ball.vz = -ball.vz;
    }
console.log("y=" + y);
console.log("x= " + x);
console.log("z= " + z);


// y = 0;
    // if(y - x < 5){
    //     // 跳ね返り
    //     yy = y;
    //     xx = x;
    //     y = xx;
    //     x = yy+ 5;
    //     ball.vx = -ball.vx;
    //     ball.vy = -ball.vy;
    // }

    //barとの当たり判定
    if(z <= BALL_DIAMETER){
        switch(test = checkHitAgainstBar( x, y, z, bar.x, bar.y)){
            case HIT_TOP:
                z = 2 * BALL_DIAMETER - z;
                ball.vz = -ball.vz;
                break;
            case HIT_FRONT:
                ball.vz = BALL_SPEED_Z*0.85;
                ball.vy = BALL_SPEED_Y*1.03;
                break;
            case HIT_BACK:
                ball.vz = BALL_SPEED_Z*0.85;
                ball.vy = -BALL_SPEED_Y*1.03;
                break;
            case HIT_RIGHT:
                ball.vz = BALL_SPEED_Z*0.85;
                ball.vx = BALL_SPEED_X*1.03;
                break;
            case HIT_LEFT:
                ball.vz = BALL_SPEED_Z*0.85;
                ball.vx = -BALL_SPEED_X*1.03;
                break;
            default:
                if(z<BALL_DIAMETER/2){
                    gameState = GAMESTATE_DIE;
                    break;
                }

        }
console.log("HIT = " + test);
    }
/*    //blockとの当たり判定
    if(z > BLOCK_SIZE_Z*3){
        var hitableBlocks = getHitableBlocks(x,y,z);//当たり判定調べ候補抽出
        var hey = false;
        for(var i=0;i<hitableBlocks.length;i++){//各候補ブロックについて当たり判定
                var resCheck = checkHitAgainstBlock(hitableBlocks[i],x,y,z);
                switch(resCheck){
                    case HIT_TOP:
                        ball.vz = -ball.vz;
                        break;
                    case HIT_BOTTOM:
                        ball.vz = -ball.vz;
                        break;
                        
                    case HIT_FRONT:
                        ball.vy = -ball.vy;
                        break;
                        
                    case HIT_BACK:
                        ball.vy = -ball.vy;
                        break;
                        
                    case HIT_RIGHT:
                        ball.vx = -ball.vx;
                        break;
                        
                    case HIT_LEFT:
                        ball.vx = -ball.vx;
                        break;
                        
                }
                if(resCheck){
                    hey = true;
                    // blocks[hitableBlocks[i][2]][hitableBlocks[i][0]][hitableBlocks[i][1]] = 0;
                    // blocksImage[hitableBlocks[i][2]][hitableBlocks[i][0]][hitableBlocks[i][1]].hide();
                    blockLeft--;
                    break;
                }
        }
    }*/
    
    //壁との当たり判定をもう一回
    // if(x > FIELD_SIZE_X - BALL_DIAMETER){
    //     x = 2*(FIELD_SIZE_X - BALL_DIAMETER)-x;
    //     ball.vx = -ball.vx;
    // }else if(x < 0){
    //     x = -x;
    //     ball.vx = -ball.vx;
    // }
    // if(y > FIELD_SIZE_Y - BALL_DIAMETER){
    //     y = 2*(FIELD_SIZE_Y - BALL_DIAMETER)-y;
    //     ball.vy = -ball.vy;
    // }else if(y < 0){
    //     y = -y;
    //     ball.vy = -ball.vy;
    // }
    // if(z > FIELD_SIZE_Z){
    //     z = 2*FIELD_SIZE_Z-z;
    //     ball.vz = -ball.vz;
    // }
// console.log(ball.vx);
// console.log(ball.vy);
// console.log(ball.vz);

    ball.x = x;
    ball.y = y;
    ball.z = z;
}

function getHitableBlocks(x,y,z){//ボール位置から当たり判定を調べる候補のブロックを返す
    var b1x = Math.floor( x/BLOCK_SIZE_X );
    var b1y = Math.floor( y/BLOCK_SIZE_Y );
    var b1z = Math.floor( z/BLOCK_SIZE_Z - 3 );
    
    var b2x = Math.floor( (x + BALL_DIAMETER)/BLOCK_SIZE_X );
    var b2y = Math.floor( (y + BALL_DIAMETER)/BLOCK_SIZE_Y );
    var b2z = Math.floor( (z - BALL_DIAMETER)/BLOCK_SIZE_Z - 3);
    
    b2x = b2x == 4 ? 3 : b2x;
    b2y = b2y == 4 ? 3 : b2y;
    b1z = b1z == 4 ? 3 : b1z;
    b2z = b2z == 4 ? 3 : 
                b2z <  0 ? 0 : b2z;
    
    var res = new Array();
    for(var iz=b1z;iz>=b2z;iz--){
        for(var ix=b1x;ix<=b2x;ix++){
            for(var iy=b1y;iy<=b2y;iy++){
                if(blocks[iz][ix][iy] == 1){
                    res[res.length] = new Array(ix,iy,iz);
                }
            }
        }
    }
    
    return res;
}

function checkHitAgainstBlock(blockIndexArray,ball_x,ball_y,ball_z){
    var x = blockIndexArray[0]*BLOCK_SIZE_X;
    var y = blockIndexArray[1]*BLOCK_SIZE_Y;
    var z = ( blockIndexArray[2] + 3 )*BLOCK_SIZE_Z;
    
    var ball_center_x = ball_x + BALL_DIAMETER/2;
    var ball_center_y = ball_y + BALL_DIAMETER/2;
    var ball_center_z = ball_z  - BALL_DIAMETER/2;
    
    //x方向
    if(Math.abs(x - ball_center_x) - Math.abs(x + BLOCK_SIZE_X - ball_center_x) > 0){
        //右面ヒットかも
        if(checkHitAgainstAspect(y,z,y+BLOCK_SIZE_Y,z+BLOCK_SIZE_Z,ball_center_y,ball_center_z)){
            return HIT_RIGHT;
        }
    }else{
        //左面ヒットかも
        if(checkHitAgainstAspect(y,z,y+BLOCK_SIZE_Y,z+BLOCK_SIZE_Z,ball_center_y,ball_center_z)){
            return HIT_LEFT;
        }
    }
    
    //y方向
    if(Math.abs(y - ball_center_y) - Math.abs(y + BLOCK_SIZE_Y - ball_center_y) > 0){
        //前面ヒットかも
        if(checkHitAgainstAspect(x,z,x+BLOCK_SIZE_X,z+BLOCK_SIZE_Z,ball_center_x,ball_center_z)){
            return HIT_FRONT;
        }
    }else{
        //後面ヒットかも
        if(checkHitAgainstAspect(x,z,x+BLOCK_SIZE_X,z+BLOCK_SIZE_Z,ball_center_x,ball_center_z)){
            return HIT_BACK;
        }
    }
    
    //z方向
    if(Math.abs(z - ball_center_z) - Math.abs(z + BLOCK_SIZE_Z - ball_center_z) > 0){
        //下面ヒットかも
        if(checkHitAgainstAspect(x,y,x+BLOCK_SIZE_X,y+BLOCK_SIZE_Y,ball_center_x,ball_center_y)){
            return HIT_TOP;
        }
    }else{
        //上面ヒットかも
        if(checkHitAgainstAspect(x,y,x+BLOCK_SIZE_X,y+BLOCK_SIZE_Y,ball_center_x,ball_center_y)){
            return HIT_BOTTOM;
        }
    }
    return 0;
}

function poweredDistance(ax,ay,bx,by){
    return (ax-bx)*(ax-bx)+(ay-by)*(ay-by);
}

function checkHitAgainstBar( ball_x, ball_y, ball_z, bar_x, bar_y ){
    if(ball_z<BALL_DIAMETER*0.55){
        return 0;
    }

    if(ball_x >= bar_x - BALL_DIAMETER/2 
        &&  ball_x <= bar_x + BAR_SIZE_X - BALL_DIAMETER/2
        && ball_y >= bar_y - BALL_DIAMETER/2 
        &&  ball_y <= bar_y + BAR_SIZE_Y - BALL_DIAMETER/2
        ){
        return HIT_TOP;
    }
    if(ball_x >= bar_x - BALL_DIAMETER/2 
        &&  ball_x <= bar_x + BAR_SIZE_X - BALL_DIAMETER/2
        && BALL_RADIUS_2 >= poweredDistance( bar_y + BAR_SIZE_Y, 0, ball_y + BALL_DIAMETER/2, ball_z - BALL_DIAMETER/2 )
        ){
        return HIT_FRONT;
    }
    if(ball_x >= bar_x - BALL_DIAMETER/2 
        &&  ball_x <= bar_x + BAR_SIZE_X - BALL_DIAMETER/2
        && BALL_RADIUS_2 >= poweredDistance( bar_y, 0, ball_y + BALL_DIAMETER/2, ball_z - BALL_DIAMETER/2 )
        ){
        return HIT_BACK;
    }
    if(ball_y >= bar_y - BALL_DIAMETER/2 
        &&  ball_y <= bar_y + BAR_SIZE_Y - BALL_DIAMETER/2
        && BALL_RADIUS_2 >= poweredDistance( bar_x + BAR_SIZE_X, 0, ball_x + BALL_DIAMETER/2, ball_z - BALL_DIAMETER/2 )
        ){
        return HIT_RIGHT;
    }
    if(ball_y >= bar_y - BALL_DIAMETER/2 
        &&  ball_y <= bar_y + BAR_SIZE_Y - BALL_DIAMETER/2
        && BALL_RADIUS_2 >= poweredDistance( bar_x, 0, ball_x + BALL_DIAMETER/2, ball_z - BALL_DIAMETER/2 )
        ){
        return HIT_LEFT;
    }
    
    return 0;
}

function checkHitAgainstAspect(u_x,u_y,l_x,l_y,x,y){
    return (u_x <= x && x <= l_x && u_y <= y && y <= l_y);
}

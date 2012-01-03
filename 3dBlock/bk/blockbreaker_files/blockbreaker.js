//blockbreaker.js
//start			 :2008/10/21
//last update:2008/11/12

/*----------------------------
	constant
----------------------------*/

var FIELD_SIZE_X 	= 200,
		FIELD_SIZE_Y	=	200,
		FIELD_SIZE_Z	=	280;

var BAR_SIZE_X	= 56,
		BAR_SIZE_Y	=	56;
var BALL_DIAMETER = 20;
var BALL_RADIUS_2 = BALL_DIAMETER * BALL_DIAMETER / 4;
var BLOCK_SIZE_X = 50,
		BLOCK_SIZE_Y = 50,
		BLOCK_SIZE_Z = 40;
var BALL_SPEED_X = 4,
		BALL_SPEED_Y = 4,
		BALL_SPEED_Z = 4;

var TRANS3D_2_2D_XPARAM = 2/Math.sqrt(5),
		TRANS3D_2_2D_YPARAM = 1/Math.sqrt(5);
var	BAR_IMAGE_PADDING	=	26;

var HIT_TOP 		= 1;//��ʃq�b�g
var HIT_BOTTOM 	= 2;//���ʃq�b�g
var HIT_FRONT 	= 3;//�O�ʃq�b�g
var HIT_BACK 		= 4;//��ʃq�b�g
var HIT_RIGHT 	= 5;//�E�ʃq�b�g
var HIT_LEFT 		= 6;//���ʃq�b�g

var GAMESTATE_WAIT = 0,
		GAMESTATE_PLAY = 1,
		GAMESTATE_DIE  = 2,
		GAMESTATE_CLEAR= 3;
/*----------------------------
	global	variables
----------------------------*/
var keyHits = {
								up		:	false,
								down	:	false,
								right	:	false,
								left	:	false,
								start : false
							};
var cursol = 	{
								x : 0,
								y : 0,
								old_x: 0,
								old_y: 0
							};

var bar = {
						x				:	0,
						y				:	0,
						//life		:	1,
						image		:	null
					};
var ball=	{
						x				:	0,
						y				:	0,
						z				:	60,
						vx			:	BALL_SPEED_X,
						vy			:	BALL_SPEED_Y,
						vz			:	BALL_SPEED_Z,
						image		:	null,
						shade		:	null
					};

var blocks = new Array(4);
for(var i=0;i<blocks.length;i++){
	blocks[i] = new Array(4);
	for(var j=0;j<blocks[i].length;j++){
		blocks[i][j] = new Array(4);
	}
}

var blocksImage = new Array(4);
for(var i=0;i<blocksImage.length;i++){
	blocksImage[i] = new Array(4);
	for(var j=0;j<blocksImage[i].length;j++){
		blocksImage[i][j] = new Array(4);
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
	
	document.onkeydown	= function(eve){
		var key = eve ? eve.keyCode : window.event.keyCode ;
		updateKeyState(key,true);
	}
	document.onkeyup		= function(eve){
		var key = eve ? eve.keyCode : window.event.keyCode ;
		updateKeyState(key,false);
	}
	
	document.onmousemove = function(eve){
		var offsetX = 400,offsetY = 380;
		var x = eve ? eve.clientX : window.event.clientX ;
		var y = eve ? eve.clientY : window.event.clientY ;
		
		var trans_x=(x-offsetX)/(2*TRANS3D_2_2D_XPARAM)-(y-offsetY )/(2*TRANS3D_2_2D_YPARAM)-BAR_SIZE_X/2;
		var trans_y=(x-offsetX)/(2*TRANS3D_2_2D_XPARAM)+(y-offsetY )/(2*TRANS3D_2_2D_YPARAM)-BAR_SIZE_Y/2;
		cursol.x = trans_x;
		cursol.y = trans_y;
	}
	
	document.onmousedown = function( eve ){
		var offsetX = 400;
		var x = eve ? eve.clientX : window.event.clientX ;
		var y = eve ? eve.clientY : window.event.clientY ;
		if(offsetX <= x && x <= offsetX + 360 
		&& 0<= y && y <= 590 ){
			updateKeyState(13,true);
		}
	}

	document.onmouseup = function( eve ){
		var offsetX = 400;
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
		case 37://��
			keyHits.left	= isHit;
			break;
		case 38://��
			keyHits.up		= isHit;
			break;
		case 39://��
			keyHits.right	= isHit;
			break;
		case 40://��
			keyHits.down	= isHit;
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
	ball.image=	new createImage("ball.png",20,20);
	ball.image.setZ(4);
	ball.shade = new createImage("shade_t.png",20,20);
	ball.shade.setZ(3);
	ball.image.hide();
	ball.shade.hide();

	var ceil = new createImage("floor_t.png",357,179,400,10,200);
	
	for(var z=0;z<blocks.length;z++){
		for(var x=0;x<blocks[z].length;x++){
			for(var y=0;y<blocks[z][x].length;y++){
				blocksImage[z][x][y] = new createImage(
					"block_tt.png",
					89,
					84,
					TRANS3D_2_2D_XPARAM * ( x*BLOCK_SIZE_X + y*BLOCK_SIZE_Y ) + 400,
					TRANS3D_2_2D_YPARAM * ( y*BLOCK_SIZE_Y - x*BLOCK_SIZE_X) - (z+2)*BLOCK_SIZE_Z + 278,
					(y-x+7) + z*(blocks[z][x].length+blocks[z].length)
				);
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
	gamestart_msg = new createImage("gamestart_t.png",358,200,400,100,200);
	gameover_msg = new createImage("gameover_t.png",358,200,400,100,200);
	gameover_msg.hide();
	gameclear_msg = new createImage("gameclear_t.png",358,200,400,100,200);
	gameclear_msg.hide();
}

function draw(){
	var x,y,z,offsetX = 400,offsetY = 380;
	if(gameState == GAMESTATE_DIE){
		if((bar.y - bar.x)>(ball.y - ball.x)){
			var ball_z = ball.image.getZ();
			var bar_z = bar.image.getZ();
			ball.image.setZ(bar_z);
			bar.image.setZ(ball_z);
		}
	}
	//draw	bar
	x = TRANS3D_2_2D_XPARAM * (bar.y + bar.x) + offsetX;
	y = TRANS3D_2_2D_YPARAM * (bar.y - bar.x) - BAR_IMAGE_PADDING + offsetY;
	bar.image.setX(x);
	bar.image.setY(y);
	//draw	ball
	
	x = TRANS3D_2_2D_XPARAM * (ball.y + ball.x) + offsetX;
	y = TRANS3D_2_2D_YPARAM * (ball.y - ball.x) - ball.z + offsetY;
	{
		var indexX = Math.floor( ball.x/BLOCK_SIZE_X ),
				indexY = Math.floor( ball.y/BLOCK_SIZE_Y ),
				indexZ = Math.floor( ball.z/BLOCK_SIZE_Z )-4;
		z = indexY - indexX + 7;
		z += indexZ >= 0 ? indexZ * (blocks[indexZ][indexX].length + blocks[indexZ].length): -4;
	}
	ball.image.setX(x);
	ball.image.setY(y);
	ball.image.setZ(z);


	z = (ball.z > BLOCK_SIZE_Z * 3) ? 1	:
			(bar.x+BAR_SIZE_X < ball.x || bar.y > ball.y+BALL_DIAMETER ) ? ball.image.getZ()+1 : 
			(ball.z < BALL_DIAMETER && (ball.x+BALL_DIAMETER/2 > bar+BAR_SIZE_X || ball.y+BALL_DIAMETER/2 < bar.y)) ? ball.image.getZ()+1:
			ball.image.getZ()-1;
	bar.image.setZ(z)
	//�e�`��
	y = TRANS3D_2_2D_YPARAM * (ball.y - ball.x) + offsetY;
	ball.shade.setX(x);
	ball.shade.setY(y);
	ball.shade.setZ(bar.image.getZ()+1);
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

function resetStage(){
	bar.x = 0;
	bar.y	= 0;
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
	for(var z=0;z<blocks.length;z++){
		for(var x=0;x<blocks[z].length;x++){
			for(var y=0;y<blocks[z][x].length;y++){
				blocks[z][x][y] = stage(x,y,z) ?1:0;
				if(!( stage(x,y,z) )){
					blocksImage[z][x][y].hide();
				}else{
					blocksImage[z][x][y].view();
					blockLeft++;
				}
			}
		}
	}
	draw();
}

function updateBarPosition(){
	var moveSpeed = 10;
	var x, y;
	//�L�[���͂����W�ɔ��f
	x = keyHits.left	?	bar.x - moveSpeed	:
			keyHits.right	?	bar.x	+	moveSpeed	:
			bar.x	;
	y = keyHits.up		?	bar.y - moveSpeed	:
			keyHits.down	?	bar.y	+	moveSpeed	:
			bar.y	;
	//�}�E�X���͂����W�ɔ��f
	x = cursol.x != cursol.old_x ?	cursol.x	: x ;
	y = cursol.y != cursol.old_y ?	cursol.y	: y ;
	//�t�B�[���h���ɐ���
	x	=	x > FIELD_SIZE_X - BAR_SIZE_X	?	FIELD_SIZE_X - BAR_SIZE_X	:
			x <	0 												?	0													:
			x;
	y	=	y > FIELD_SIZE_Y - BAR_SIZE_Y	?	FIELD_SIZE_Y - BAR_SIZE_Y	:
			y <	0													?	0													:
			y;
	bar.x = x;
	bar.y = y;
	cursol.old_x = cursol.x;
	cursol.old_y = cursol.y;
}

function updateBallPosition(){
	var x,y,z;
	//���x���f
	x = ball.x + ball.vx;
	y = ball.y + ball.vy;
	z = ball.z + ball.vz;
	//�ǂƂ̓����蔻��
	if(x > FIELD_SIZE_X - BALL_DIAMETER){
		x = 2*(FIELD_SIZE_X - BALL_DIAMETER)-x;
		ball.vx = -ball.vx;
	}else if(x < 0){
		x = -x;
		ball.vx = -ball.vx;
	}
	if(y > FIELD_SIZE_Y - BALL_DIAMETER){
		y = 2*(FIELD_SIZE_Y - BALL_DIAMETER)-y;
		ball.vy = -ball.vy;
	}else if(y < 0){
		y = -y;
		ball.vy = -ball.vy;
	}
	if(z > FIELD_SIZE_Z){
		z = 2*FIELD_SIZE_Z-z;
		ball.vz = -ball.vz;
	}
	//bar�Ƃ̓����蔻��
	if(z <= BALL_DIAMETER){
		switch(checkHitAgainstBar( x, y, z, bar.x, bar.y)){
			case HIT_TOP:
				z = 2 * BALL_DIAMETER - z;
				ball.vz = -ball.vz;
				break;
			case HIT_FRONT:
				ball.vz = BALL_SPEED_Z*0.85;
				ball.vy = BALL_SPEED_Y*1.13;
				break;
			case HIT_BACK:
				ball.vz = BALL_SPEED_Z*0.85;
				ball.vy = -BALL_SPEED_Y*1.13;
				break;
			case HIT_RIGHT:
				ball.vz = BALL_SPEED_Z*0.85;
				ball.vx = BALL_SPEED_X*1.13;
				break;
			case HIT_LEFT:
				ball.vz = BALL_SPEED_Z*0.85;
				ball.vx = -BALL_SPEED_X*1.13;
				break;
			default:
				if(z<BALL_DIAMETER/2){
					gameState = GAMESTATE_DIE;
					break;
				}

		}
	}
	
	//block�Ƃ̓����蔻��
	if(z > BLOCK_SIZE_Z*3){
		var hitableBlocks = getHitableBlocks(x,y,z);//�����蔻�蒲�׌�⒊�o
		var hey = false;
		for(var i=0;i<hitableBlocks.length;i++){//�e���u���b�N�ɂ��ē����蔻��
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
					blocks[hitableBlocks[i][2]][hitableBlocks[i][0]][hitableBlocks[i][1]] = 0;
					blocksImage[hitableBlocks[i][2]][hitableBlocks[i][0]][hitableBlocks[i][1]].hide();
					blockLeft--;
					break;
				}
		}
	}
	
	//�ǂƂ̓����蔻����������
	if(x > FIELD_SIZE_X - BALL_DIAMETER){
		x = 2*(FIELD_SIZE_X - BALL_DIAMETER)-x;
		ball.vx = -ball.vx;
	}else if(x < 0){
		x = -x;
		ball.vx = -ball.vx;
	}
	if(y > FIELD_SIZE_Y - BALL_DIAMETER){
		y = 2*(FIELD_SIZE_Y - BALL_DIAMETER)-y;
		ball.vy = -ball.vy;
	}else if(y < 0){
		y = -y;
		ball.vy = -ball.vy;
	}
	if(z > FIELD_SIZE_Z){
		z = 2*FIELD_SIZE_Z-z;
		ball.vz = -ball.vz;
	}
	
	ball.x = x;
	ball.y = y;
	ball.z = z;
}

function getHitableBlocks(x,y,z){//�{�[���ʒu���瓖���蔻��𒲂ׂ���̃u���b�N��Ԃ�
	var b1x = Math.floor( x/BLOCK_SIZE_X );
	var b1y = Math.floor( y/BLOCK_SIZE_Y );
	var b1z	= Math.floor( z/BLOCK_SIZE_Z - 3 );
	
	var b2x = Math.floor( (x + BALL_DIAMETER)/BLOCK_SIZE_X );
	var b2y = Math.floor( (y + BALL_DIAMETER)/BLOCK_SIZE_Y );
	var b2z = Math.floor( (z - BALL_DIAMETER)/BLOCK_SIZE_Z - 3);
	
	b2x = b2x == 4 ? 3 : b2x;
	b2y = b2y == 4 ? 3 : b2y;
	b1z = b1z == 4 ? 3 : b1z;
	b2z = b2z == 4 ? 3 : 
				b2z	<  0 ? 0 : b2z;
	
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
	
	//x����
	if(Math.abs(x - ball_center_x) - Math.abs(x + BLOCK_SIZE_X - ball_center_x) > 0){
		//�E�ʃq�b�g����
		if(checkHitAgainstAspect(y,z,y+BLOCK_SIZE_Y,z+BLOCK_SIZE_Z,ball_center_y,ball_center_z)){
			return HIT_RIGHT;
		}
	}else{
		//���ʃq�b�g����
		if(checkHitAgainstAspect(y,z,y+BLOCK_SIZE_Y,z+BLOCK_SIZE_Z,ball_center_y,ball_center_z)){
			return HIT_LEFT;
		}
	}
	
	//y����
	if(Math.abs(y - ball_center_y) - Math.abs(y + BLOCK_SIZE_Y - ball_center_y) > 0){
		//�O�ʃq�b�g����
		if(checkHitAgainstAspect(x,z,x+BLOCK_SIZE_X,z+BLOCK_SIZE_Z,ball_center_x,ball_center_z)){
			return HIT_FRONT;
		}
	}else{
		//��ʃq�b�g����
		if(checkHitAgainstAspect(x,z,x+BLOCK_SIZE_X,z+BLOCK_SIZE_Z,ball_center_x,ball_center_z)){
			return HIT_BACK;
		}
	}
	
	//z����
	if(Math.abs(z - ball_center_z) - Math.abs(z + BLOCK_SIZE_Z - ball_center_z) > 0){
		//���ʃq�b�g����
		if(checkHitAgainstAspect(x,y,x+BLOCK_SIZE_X,y+BLOCK_SIZE_Y,ball_center_x,ball_center_y)){
			return HIT_TOP;
		}
	}else{
		//��ʃq�b�g����
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
		&&	ball_x <= bar_x + BAR_SIZE_X	- BALL_DIAMETER/2
		&& ball_y >= bar_y - BALL_DIAMETER/2 
		&&	ball_y <= bar_y + BAR_SIZE_Y - BALL_DIAMETER/2
		){
		return HIT_TOP;
	}
	if(ball_x >= bar_x - BALL_DIAMETER/2 
		&&	ball_x <= bar_x + BAR_SIZE_X	- BALL_DIAMETER/2
		&& BALL_RADIUS_2 >= poweredDistance( bar_y + BAR_SIZE_Y, 0, ball_y + BALL_DIAMETER/2, ball_z - BALL_DIAMETER/2 )
		){
		return HIT_FRONT;
	}
	if(ball_x >= bar_x - BALL_DIAMETER/2 
		&&	ball_x <= bar_x + BAR_SIZE_X	- BALL_DIAMETER/2
		&& BALL_RADIUS_2 >= poweredDistance( bar_y, 0, ball_y + BALL_DIAMETER/2, ball_z - BALL_DIAMETER/2 )
		){
		return HIT_BACK;
	}
	if(ball_y >= bar_y - BALL_DIAMETER/2 
		&&	ball_y <= bar_y + BAR_SIZE_Y - BALL_DIAMETER/2
		&& BALL_RADIUS_2 >= poweredDistance( bar_x + BAR_SIZE_X, 0, ball_x + BALL_DIAMETER/2, ball_z - BALL_DIAMETER/2 )
		){
		return HIT_RIGHT;
	}
	if(ball_y >= bar_y - BALL_DIAMETER/2 
		&&	ball_y <= bar_y + BAR_SIZE_Y - BALL_DIAMETER/2
		&& BALL_RADIUS_2 >= poweredDistance( bar_x, 0, ball_x + BALL_DIAMETER/2, ball_z - BALL_DIAMETER/2 )
		){
		return HIT_LEFT;
	}
	
	return 0;
}

function checkHitAgainstAspect(u_x,u_y,l_x,l_y,x,y){
	return (u_x <= x && x <= l_x && u_y <= y && y <= l_y);
}

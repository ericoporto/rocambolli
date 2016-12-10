
ENUM_GROUND = 255;
ENUM_AIR=0;
ENUM_COIN=1;
ENUM_END=2;
ENUM_DIE=3;
COINS = 0;

var first_action = 0;

function update_coins(){
    hud_ctx.clearRect(w-48,2,46,16)
    png_font.drawText(COINS.toString(),[w-48,0])
}

function setpixelated(context){
    context['imageSmoothingEnabled'] = false;       /* standard */
    context['mozImageSmoothingEnabled'] = false;    /* Firefox */
    context['oImageSmoothingEnabled'] = false;      /* Opera */
    context['webkitImageSmoothingEnabled'] = false; /* Safari */
    context['msImageSmoothingEnabled'] = false;     /* IE */
}


function reset(){
    bg_ctx.clearRect(0,0,w,h);
    ctx.clearRect(0,0,w,h);
    ptx.clearRect(0,0,w,h);
    curr_level = 0;
    COINS = 0;
    pl.xy = [6,16];
    pl.isJump = false;
    pl.facing = 'right';
    pl.animation = 'standing';
    update_coins()
    drawLevel()
}

function game_start(){

    loadLevels()


    bg_c = document.getElementById('bg_canvas')
    bg_ctx = bg_c.getContext("2d")
    setpixelated(bg_ctx)

    c = document.getElementById('level_canvas')
    ctx = c.getContext("2d")
    setpixelated(ctx);

    pc = document.getElementById('player_canvas')
    ptx = pc.getContext("2d")
    setpixelated(ptx);

    hud_c = document.getElementById('hud_canvas')
    hud_ctx = hud_c.getContext("2d")
    setpixelated(hud_ctx);

    png_font.setup( hud_ctx ,"img/unifont.png", function(){
      png_font.drawText("Rocambolli!", [0,0],'yellow',1,'purple');
      png_font.drawText("The Game",[16,16],'yellow',2,'purple');
      png_font.drawText("Arrow keys to move", [0,48],'white',1,'brown');
      png_font.drawText("Click to focus!", [16,64],'white',1,'brown');
      audio_start()
    })

    w = 160
    h = 90
    walkmatrix = Create2DArray(c.height)

    pl = {
        anim: {
            'right':{
                'standing':[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]],
                'walking':[[0,4],[1,4],[2,4],[3,4],[4,4],[5,4]],
                'falling':[[0,6],[1,6],[2,6],[3,6],[4,6],[5,6]]
            },
            'left':{
                'standing':[[0,3],[1,3],[2,3],[3,3],[4,3],[5,3]],
                'walking':[[0,5],[1,5],[2,5],[3,5],[4,5],[5,5]],
                'falling':[[0,7],[1,7],[2,7],[3,7],[4,7],[5,7]]
            }
        },
        h:5,
        w:6,
        facing: 'right',
        color: '#522',
        animation: 'standing',
        xy:[6,6],
        isJump: false,
        frameFirstJump: 0,
        isNotGrounded: function() {
            return pl.canWalk(pl.xy,[0,1])
        },
        grabCoin: function(xy){
            ctx.clearRect(xy[0]-1,xy[1]-1,3,3)
            for(var i=0; i<3; i++){
                for(var j=0; j<3; j++){
                    if(walkmatrix[  xy[1]-1+j][ xy[0]-1+i]== ENUM_COIN){
                        walkmatrix[  xy[1]-1+j][ xy[0]-1+i] =ENUM_AIR
                    }
                }
            }

        },
        checkMatrix: function(xy,modfier){
            var foundcoin = false;
            for(var i=0; i<pl.w; i++){
                for(var j=0; j<pl.h; j++){
                    if(walkmatrix[  xy[1] + modfier[1] - pl.h + j ][ xy[0] + modfier[0] - Math.floor(pl.w/2)+ i ] == ENUM_COIN) {
                        pl.grabCoin([xy[0] + modfier[0] - Math.floor(pl.w/2) + i,xy[1] + modfier[1] - pl.h + j])
                        foundcoin=true;
                        break;

                    } else if(walkmatrix[  xy[1] + modfier[1] - pl.h + j ][ xy[0] + modfier[0] - Math.floor(pl.w/2)+ i ] == ENUM_END) {
                        walkmatrix[  xy[1] + modfier[1] - pl.h + j ][ xy[0] + modfier[0] - Math.floor(pl.w/2) + i ] = ENUM_AIR;
                        nextLevel()
                        break;
                    } else if(walkmatrix[  xy[1] + modfier[1] - pl.h + j ][ xy[0] + modfier[0] - Math.floor(pl.w/2)+ i ] == ENUM_DIE) {
                        walkmatrix[  xy[1] + modfier[1] - pl.h + j ][ xy[0] + modfier[0] - Math.floor(pl.w/2) + i ] = ENUM_AIR;
                        reset()
                        return false
                    }
                }
            }
            if(walkmatrix[xy[1]+modfier[1]][xy[0]+modfier[0]] == ENUM_COIN){
                pl.grabCoin([xy[0]+modfier[0],xy[1]+modfier[1]])
                foundcoin=true;
            } else if(walkmatrix[xy[1]+modfier[1]][xy[0]+modfier[0]] == ENUM_END){
                walkmatrix[  xy[1] + modfier[1] - pl.h + j ][ xy[0] + modfier[0] - Math.floor(pl.w/2) + i ] = ENUM_AIR;
                nextLevel()
            } else if(walkmatrix[xy[1]+modfier[1]][xy[0]+modfier[0]] == ENUM_DIE){
                walkmatrix[  xy[1] + modfier[1] - pl.h + j ][ xy[0] + modfier[0] - Math.floor(pl.w/2) + i ] = ENUM_AIR;
                reset()
                return false
            }

            if(foundcoin){
                COINS++;
                update_coins()
                audio_coin()
            }

            return true
        },
        canWalk: function(xy,modfier){
            if(pl.checkMatrix(xy,modfier))
                return walkmatrix[xy[1]+modfier[1]][xy[0]+modfier[0]] == ENUM_AIR;
            else
                return false
        },
        update: function() {
          gravity=1;
          var nothing = true;
          if (Key.isDown(Key.UP)){
            if(first_action ==0)first_action=1;
            nothing = false;
            pl.jump();
          }

          if (Key.isDown(Key.RIGHT)){
            if(first_action ==0)first_action=1;
            nothing = false;
            pl.facing = 'right';
            pl.animation = 'walking';
            if(pl.canWalk(pl.xy,[1,0]))
                pl.xy[0]+=1;
          }

          if (Key.isDown(Key.LEFT)){

            if(first_action ==0)first_action=1;
            nothing = false;
            pl.facing = 'left';
            pl.animation = 'walking';
            if(pl.canWalk(pl.xy,[-1,0]))
                pl.xy[0]-=1;
          }

          if(pl.isJump){
              nothing = false;
              if(anim_frame- pl.frameFirstJump<4){
                pl.xy[1]=pl.xy[1]-1;
              } else if (Key.isDown(Key.UP)){
                pl.xy[1]=pl.xy[1]-1;
              }
              if(anim_frame- pl.frameFirstJump>8){
                pl.isJump=false;
              }
          } else {
            if (pl.isNotGrounded()){
              nothing = false;
              pl.xy[1]=pl.xy[1]+gravity;
              pl.animation = 'falling';
            } else {
              pl.isJump=false;

            }

          }

          if(nothing){
            pl.animation = 'standing';

          }

        },
        jump: function(){
          if(!pl.isJump && !pl.isNotGrounded()){
            audio_jump()
            pl.frameFirstJump = anim_frame
            pl.isJump=true
          }
        }
    }


    //for(var ix=0;ix<w; ix++){
    //    for(var iy=0;iy<h; iy++){
    //        ctx.draw

    //    }
    //}

    px_id = ctx.createImageData(1,1); // only do this once per page
    px_d  = px_id.data;    // only do this once per page
    increr = 0;

    resize();
    reset();
    draw();




}

function drawLevel(){
    ctx.clearRect(0,0,w,h);
    ctx.drawImage(level[curr_level],0,0);
    analyzeimg()

    bg_ctx.clearRect(0,0,w,h);
    for(var i=level.length-1; i>curr_level; i--){
        bg_ctx.drawImage(level[i],0,0);
        bg_ctx.drawImage(img_fog,0,0);
    }
}

function nextLevel(){
    curr_level++;
    drawLevel();
}

function Create2DArray(rows) {
    var arr = [];

    for (var i=0;i<rows;i++) {
        arr[i] = [];
    }

    return arr;
}



function analyzeimg(){

    walkdata = ctx.getImageData(0, 0, c.width, c.height);
    for (var j=0; j<walkdata.height; j++) {
        for (var i=0; i<walkdata.width; i++) {
            var index=(j*4)*walkdata.width+(i*4);
            var red =walkdata.data[index];
            var green =walkdata.data[index+1];
            var blue =walkdata.data[index+2];
            var alpha =walkdata.data[index+3];
            var mycolor = color.normalcolor([red,green,blue])
            if(alpha==0){
                walkmatrix[j][i] = ENUM_AIR;
            } else {
                walkmatrix[j][i] = ENUM_GROUND;
            }
            if(mycolor == 'yellow'){
                walkmatrix[j][i] = ENUM_COIN;
            }
            if(mycolor == 'blue'){
                walkmatrix[j][i] = ENUM_END;
            }
            if(mycolor == 'red'){
                walkmatrix[j][i] = ENUM_DIE;
            }

        }
    }

}

function resize(){
    bg_c.style.height = window.innerHeight + 'px';
    bg_c.style.width = window.innerWidth + 'px';
    c.style.height = window.innerHeight + 'px';
    c.style.width = window.innerWidth + 'px';
    pc.style.height = window.innerHeight + 'px';
    pc.style.width = window.innerWidth + 'px';
    hud_c.style.height = window.innerHeight + 'px';
    hud_c.style.width = window.innerWidth + 'px';
    setpixelated(bg_ctx)
    setpixelated(ctx);
    setpixelated(ptx);
    setpixelated(hud_ctx);
}

function drawPixel(xy,r,g,b,a){
    px_d[0]   = r;
    px_d[1]   = g;
    px_d[2]   = b;
    px_d[3]   = a;
    ctx.putImageData( px_id, xy[0], xy[1]);
}

function rotate(cxy, xy, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (xy[0] - cxy[0])) + (sin * (xy[1] - cxy[1])) + cxy[0],
        ny = (cos * (xy[1] - cxy[1])) - (sin * (xy[0] - cxy[0])) + cxy[1];
    return [nx, ny];
}

function drawPlayer(){
  //  var oc = 2;
  //  ptx.clearRect(pl.xy[0]-oc-Math.floor(pl.w/2),
  //               pl.xy[1]-oc-Math.floor(pl.h)+1,
  //               pl.w+oc*2,pl.h+oc*2);
  //  ptx.fillStyle = pl.color;
  //  ptx.fillRect(pl.xy[0]-Math.floor(pl.w/2),
  //               pl.xy[1]-Math.floor(pl.h)+1,
   //              pl.w,pl.h)

   ptx.clearRect(pl.xy[0]-6,
                 pl.xy[1]-10,
                 14,14);
   var pl_frame = Math.floor(anim_frame/4)%6
   ptx.drawImage(img_pl,
        pl.anim[pl.facing][pl.animation][pl_frame][0]*10, pl.anim[pl.facing][pl.animation][pl_frame][1]*10,
        10,10,
        pl.xy[0]-4,pl.xy[1]-9,
        10,10)
}

anim_frame = 0;

function drawLoopStuff(angl){
    drawPlayer();
    if(first_action==1){
        hud_ctx.clearRect(0,0,w,h);
        first_action=2;
    }
    anim_frame++;
}

window.addEventListener('resize', resize, false);
window.addEventListener('orientationchange', resize, false);

function draw(){
    increr++
    angler = Math.floor(3*Math.sin(2*Math.PI*(increr%80)/80))
    pl.update()
    drawLoopStuff()


    window.requestAnimationFrame(draw);
}

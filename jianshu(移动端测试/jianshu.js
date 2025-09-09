const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const btnStart = document.getElementById('startBtn');
const timeEl = document.getElementById('time');
const scoreEl = document.getElementById('score');
const totalEl = document.getElementById('total');
const btnExit = document.getElementById('exitBtn');
// 添加摇杆相关变量
const joystick = document.getElementById('joystick');
const joystickKnob = document.getElementById('joystick-knob');
let joystickActive = false;
let joystickCenter = { x: 0, y: 0 };
const joystickRadius = 60; // 摇杆活动半径

// 游戏原始尺寸（保持比例）
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// 声明图片对象
const bookImg = new Image();       // 课程图片
const obstacleImg = new Image();   // 网络异常块图片
const unluckyImg = new Image();    // 运气不佳块图片
const playerImg = new Image();     // 玩家图片

// 存储图片加载状态
let imagesLoaded = 0;
const totalImages = 4;

// 图片加载完成的回调函数
function onImageLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    btnStart.disabled = false;
    btnStart.textContent = "开始游戏";
  }
}

// 设置图片路径并绑定加载事件
bookImg.src = "book.png";
bookImg.onload = onImageLoaded;
bookImg.onerror = () => alert("课程图片加载失败！");

obstacleImg.src = "network-error.png";
obstacleImg.onload = onImageLoaded;
obstacleImg.onerror = () => alert("网络异常块图片加载失败！");

unluckyImg.src = "bad-luck.png";
unluckyImg.onload = onImageLoaded;
unluckyImg.onerror = () => alert("运气不佳块图片加载失败！");

playerImg.src = "player.png";
playerImg.onload = onImageLoaded;
playerImg.onerror = () => alert("玩家图片加载失败！");

// 初始禁用开始按钮
btnStart.disabled = true;
btnStart.textContent = "加载中...";
btnExit.style.display = 'none';

const CONFIG = { 
    timeLimit:10, 
    bookCount:5, 
    playerSpeed:180,
    blockCount:7,
    unluckyCount:2
};

let player = {}, books=[], obstacles=[], unluckyBlocks=[];
let score=0, timeLeft=CONFIG.timeLimit, state='menu', keys={};
let lastTime=0, freezeTime=0;

// 适配窗口大小
function resizeCanvas() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // 计算游戏比例
  const gameRatio = GAME_WIDTH / GAME_HEIGHT;
  const windowRatio = windowWidth / windowHeight;
  
  let newWidth, newHeight;
  
  // 根据窗口比例调整canvas大小，保持游戏比例
  if (windowRatio > gameRatio) {
    newHeight = windowHeight;
    newWidth = newHeight * gameRatio;
  } else {
    newWidth = windowWidth;
    newHeight = newWidth / gameRatio;
  }
  
  // 设置canvas元素尺寸
  canvas.style.width = `${newWidth}px`;
  canvas.style.height = `${newHeight}px`;

  // 调整摇杆位置（保持在右下角）
  if (joystick) {
    joystick.style.bottom = `${20 + (window.innerHeight - newHeight) / 2}px`;
    joystick.style.right = `${20 + (window.innerWidth - newWidth) / 2}px`;
  }
}

// 初始化摇杆中心位置
function initJoystick() {
  if (!joystick) return;
  
  // 计算摇杆中心（相对于摇杆元素）
  joystickCenter = {
    x: joystick.offsetWidth / 2,
    y: joystick.offsetHeight / 2
  };
  
  // 触摸开始 - 只在摇杆内部有效
  joystick.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = joystick.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    
    // 检查触摸点是否在摇杆圆形范围内
    const distance = Math.hypot(x - joystickCenter.x, y - joystickCenter.y);
    if (distance <= joystickRadius) {
      joystickActive = true;
      updateJoystick(e.touches[0]);
    }
  });
  
  // 触摸移动 - 限制在视口内且在摇杆区域
  joystick.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (joystickActive) {
      // 确保触摸点仍在视口内
      if (e.touches[0].clientX >= 0 && e.touches[0].clientX <= window.innerWidth &&
          e.touches[0].clientY >= 0 && e.touches[0].clientY <= window.innerHeight) {
        updateJoystick(e.touches[0]);
      }
    }
  });
  
  // 触摸结束或离开屏幕时重置
  joystick.addEventListener('touchend', resetJoystick);
  joystick.addEventListener('touchcancel', resetJoystick);
}

// 添加重置摇杆的函数
function resetJoystick() {
  joystickActive = false;
  // 重置摇杆位置
  if (joystickKnob) {
    joystickKnob.style.transform = 'translate(-50%, -50%)';
  }
  keys.joystick = null;
}

// 更新摇杆位置和玩家移动方向
function updateJoystick(touch) {
  if (!joystick) return;
  
  const rect = joystick.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  
  // 计算与中心的距离
  const dx = x - joystickCenter.x;
  const dy = y - joystickCenter.y;
  const distance = Math.hypot(dx, dy);
  
  // 限制在摇杆范围内
  if (distance > joystickRadius) {
    const ratio = joystickRadius / distance;
    // 使用transform而不是top/left，确保性能和精确性
    joystickKnob.style.transform = `translate(${dx * ratio - joystickCenter.x}px, ${dy * ratio - joystickCenter.y}px)`;
    
    // 设置移动方向
    const dirX = dx / distance;
    const dirY = dy / distance;
    keys.joystick = { x: dirX, y: dirY };
  } else {
    joystickKnob.style.transform = `translate(${dx - joystickCenter.x}px, ${dy - joystickCenter.y}px)`;
    keys.joystick = { x: dx / joystickRadius, y: dy / joystickRadius };
  }
}

// 初始化时调整一次，并监听窗口大小变化
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function rand(min,max){ return Math.random()*(max-min)+min; }

function resetGame(){
    score=0;
    timeLeft=CONFIG.timeLimit;
    freezeTime=0;
    player={x:GAME_WIDTH/2, y:GAME_HEIGHT/2, r:15};
    
    books=[]; obstacles=[]; unluckyBlocks=[];
    for(let i=0;i<CONFIG.bookCount;i++){
      books.push({x:rand(50, GAME_WIDTH-50), y:rand(50, GAME_HEIGHT-50), r:10, taken:false});
    }

    // 网络异常块
    for(let i=0;i<CONFIG.blockCount;i++){
      let x, y;
      do {
        x = rand(50, GAME_WIDTH-50);
        y = rand(50, GAME_HEIGHT-50);
      } while (Math.abs(x - player.x) < 100);
      
      obstacles.push({
        x: x,
        y: y,
        w:40,
        h:40,
        hit:false,
        vx: rand(100,150) * (Math.random()<0.5?-1:1)
      });
    }
    
    // 运气不佳块
    for(let i=0;i<CONFIG.unluckyCount;i++){
      let x, y;
      do {
        x = rand(50, GAME_WIDTH-50);
        y = rand(50, GAME_HEIGHT-50);
      } while (Math.hypot(x - player.x, y - player.y) < 200);
      
      unluckyBlocks.push({
        x: x,
        y: y,
        w: 40,
        h: 40,
        hit: false,
        speed: rand(30, 60)
      });
    }

    totalEl.textContent = CONFIG.bookCount;
    updateHUD();
  }

function updateHUD(){
  timeEl.textContent = "时间: "+timeLeft.toFixed(1);
  scoreEl.textContent = score;
}

function draw() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // 绘制课程
  books.forEach(b => {
    if (b.taken) return;
    const width = 40;
    const height = 32;
    ctx.drawImage(bookImg, b.x - width/2, b.y - height/2, width, height);
  });

  // 绘制网络异常块
  obstacles.forEach(o => {
    if (!o.hit) {
      ctx.drawImage(obstacleImg, o.x, o.y, o.w, o.h);
    }
  });

  // 绘制运气不佳块
  unluckyBlocks.forEach(u => {
    if (!u.hit) {
      ctx.drawImage(unluckyImg, u.x, u.y, u.w, u.h);
    }
  });

  // 绘制玩家
  ctx.drawImage(
    playerImg,
    player.x - player.r,
    player.y - player.r,
    player.r * 2,
    player.r * 2
  );
}

function update(dt){
    if(state!=='playing') return;
  
    // 玩家冻结时间逻辑
    if(freezeTime > 0){
      freezeTime = Math.max(0, freezeTime - dt);
    } else {
      // 玩家移动
      let dx=0, dy=0;
      if(keys['arrowleft']||keys['a']) dx-=1;
      if(keys['arrowright']||keys['d']) dx+=1;
      if(keys['arrowup']||keys['w']) dy-=1;
      if(keys['arrowdown']||keys['s']) dy+=1;

      // 摇杆控制（优先级高于键盘）
      if (keys.joystick) {
        dx = keys.joystick.x;
        dy = keys.joystick.y;
      }

      if(dx || dy){
        const len = Math.hypot(dx, dy) || 1;
        dx = dx/len * CONFIG.playerSpeed * dt;
        dy = dy/len * CONFIG.playerSpeed * dt;
        player.x = Math.max(player.r, Math.min(GAME_WIDTH - player.r, player.x + dx));
        player.y = Math.max(player.r, Math.min(GAME_HEIGHT - player.r, player.y + dy));
      }
    }

    // 运气不佳块移动
    unluckyBlocks.forEach(u => {
      if (!u.hit) {
        const dx = player.x - u.x;
        const dy = player.y - u.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const dirX = dx / distance;
        const dirY = dy / distance;

        u.x += dirX * u.speed * dt;
        u.y += dirY * u.speed * dt;

        u.x = Math.max(0, Math.min(GAME_WIDTH - u.w, u.x));
        u.y = Math.max(0, Math.min(GAME_HEIGHT - u.h, u.y));
      }
    });
  
    timeLeft = Math.max(0, timeLeft - dt);
    if(timeLeft <= 0){ endGame(); return; }
  
    // 抢课逻辑
    books.forEach(b=>{
        if(!b.taken && Math.hypot(player.x-b.x, player.y-b.y) <= player.r+b.r){
          b.taken = true; 
          score += 1;
      
          if(score >= 5){
            winGame();
          }
        }
      });
  
    // 网络异常块碰撞
    obstacles.forEach(o=>{
      if(!o.hit &&
         player.x+player.r>o.x && player.x-player.r<o.x+o.w &&
         player.y+player.r>o.y && player.y-player.r<o.y+o.h){
        freezeTime = 4;
        o.hit = true;
      }
    });
  
    // 运气不佳块碰撞
    unluckyBlocks.forEach(u=>{
      if(!u.hit &&
         player.x+player.r>u.x && player.x-player.r<u.x+u.w &&
         player.y+player.r>u.y && player.y-player.r<u.y+u.h){
        score = Math.floor(score/2);
        u.hit = true;
      }
    });

    // 移动负面块
    obstacles.forEach(o=>{
        o.x += o.vx * dt;
        if(o.x < 0){ o.x = 0; o.vx *= -1; }
        if(o.x+o.w > GAME_WIDTH){ o.x = GAME_WIDTH - o.w; o.vx *= -1; }
    });

    updateHUD();
    }

function loop(ts){
  const dt = lastTime ? (ts-lastTime)/1000 : 0;
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function winGame(){
    state = 'ended';
    overlay.classList.remove('hidden');
    overlay.querySelector('h1').textContent = "胜利！";
    overlay.querySelector('#ov-body').innerHTML = "你抢到了 "+score+" 节课，太棒了！";
    btnStart.textContent = "重新游戏";
    btnExit.style.display = 'inline-block';
    // 通知父窗口（或 opener）游戏结束并返回抢到的课程数
  const msg = { type: 'gameEnd', courses: score, item: '节课', affectionDelta: 0 };
    try {
      if (window.opener && !window.opener.closed) window.opener.postMessage(msg, '*');
      else if (window.parent && window.parent !== window) window.parent.postMessage(msg, '*');
    } catch (e) { console.warn('postMessage 发送失败', e); }
  }

function startGame(){
   overlay.classList.add('hidden'); 
   // 通知父页面：游戏已重新开始，清除之前的返回值/标记
  const restartMsg = { type: 'gameRestart' };
   try {
     if (window.opener && !window.opener.closed) window.opener.postMessage(restartMsg, '*');
     else if (window.parent && window.parent !== window) window.parent.postMessage(restartMsg, '*');
   } catch (e) { console.warn('postMessage restart 发送失败', e); }

   state='playing'; 
   resetGame(); 
   lastTime=0; 
   // 重置摇杆状态
   joystickActive = false;
   if (joystickKnob) {
     joystickKnob.style.transform = 'translate(-50%, -50%)';
   }
   keys.joystick = null;
  }

function endGame(){ 
   state='ended'; 
   overlay.classList.remove('hidden');
   overlay.querySelector('h1').textContent="时间到！"; 
   overlay.querySelector('#ov-body').innerHTML = "你抢到了 "+score+"节课"; 
   btnStart.textContent = "重新游戏";
   btnExit.style.display = 'inline-block';
   // 通知父窗口（或 opener）游戏结束并返回抢到的课程数
  const msg = { type: 'gameEnd', courses: score, item: '节课', affectionDelta: 0 };
   try {
     if (window.opener && !window.opener.closed) window.opener.postMessage(msg, '*');
     else if (window.parent && window.parent !== window) window.parent.postMessage(msg, '*');
   } catch (e) { console.warn('postMessage 发送失败', e); }
  }

// 退出游戏功能
btnExit.onclick = () => {
  if(confirm("确定要退出游戏吗？")){
    // 在退出时也尝试把当前得分发送给父窗口
  const msg = { type: 'gameEnd', courses: score, item: '节课', affectionDelta: 0 };
    try {
      if (window.opener && !window.opener.closed) window.opener.postMessage(msg, '*');
      else if (window.parent && window.parent !== window) window.parent.postMessage(msg, '*');
    } catch (e) { console.warn('postMessage 发送失败', e); }

    // 尝试关闭窗口或回到初始页面
    try { window.close(); } catch (e) {}
    // 备选方案：刷新页面回到初始状态
    // location.reload();
  }
};

addEventListener('keydown', e=>{ keys[e.key.toLowerCase()]=true; });
addEventListener('keyup', e=>{ keys[e.key.toLowerCase()]=false; });

btnStart.onclick=startGame;
requestAnimationFrame(loop);
// 初始化摇杆（添加到现有代码的最后）
initJoystick();
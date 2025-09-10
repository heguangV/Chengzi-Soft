const dialogText = document.getElementById("dialog-text");
const nameBox = document.querySelector(".character-name");
const characterAvatar = document.querySelector("#character-avatar");
const avatarContainer = document.querySelector(".character-avatar");

const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const speedBtn = document.getElementById("speed-btn");
const autoBtn = document.getElementById("auto-btn");
const skipBtn = document.getElementById("skip-btn");

const choiceContainer = document.getElementById("choice-container");
const choiceBtns = document.querySelectorAll(".choice-btn");
const dialogBox = document.querySelector(".dialog-box");

const autoSaveNotice = document.getElementById("auto-save-notice");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebar = document.getElementById("sidebar");
const mainMenuBtn = document.getElementById("main-menu-btn");
const loadBtn = document.getElementById("load-btn");
const saveBtn = document.getElementById("save-btn");
const musicBtn = document.getElementById("music-btn");
const volumeRange = document.getElementById("volume-range");
const bgMusic = document.getElementById("bg-music");

// -------------------- 状态变量 --------------------
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;

let autoPlay = false;
let autoInterval = null;
let isFast = false;
let isChoiceActive = false;
let isPaused = false;
let spaceDown = false; // 防止空格长按重复触发

// -------------------- 剧情对话 --------------------
const dialogues = [
  { name: "旁白", text: "转眼到了选课的日子，你也投入到了紧张刺激的抢课环节。" },
  { name: "旁白", text: "开始游戏", playGame: "jianshu" },
  { name: "你", text: "呼...学校的选课网站什么时候才能正常啊？" },
  { name: "你", text: "最近有些奇怪，好感度总是没有反应" },
  { name: "你", text: "和学姐聊天的时候，也能感觉到她好像有些顾虑" },
  { name: "你", text: "到底是怎么回事呢？" },
  { name: "学姐", text: "我有点想出去逛逛，要跟我一起吗" },//todo:手机振动
  { name: "你", text: "好！这就来！" },
  { name: "学姐", text: "嗯嗯，我在校门口等你哦" },//结束手机
  { name: "旁白", text: "你和学姐在校门口汇合，一起去了天街" },
  { name: "学姐", text: "诶，那里好像有抢冰红茶的活动，去看看吧" },
  { name: "你", text: "好啊，看我的吧！", playGame: "binghongcha" },
  { name: "学姐", text: "有点饿了，你有什想吃的吗" },
  { name: "旁白", text: "你试着指了几个，发现好感度没有任何变化" },
  { name: "你", text: "只能靠自己选了吗...", hasChoice: true }
];


// -------------------- 好感度系统 --------------------

function updateAffection(value) {
  affectionData.fang = Math.max(0, Math.min(100, affectionData.fang + value));
  const bar = document.querySelector('.affection-fill[data-character="fang"]');
  const text = document.querySelector('.affection-text');
  if (bar) bar.style.width = `${affectionData.senpai}%`;
  if (text) text.textContent = `学姐: ${affectionData.senpai}%`;

  
  // 显示好感度变化
  if (value > 0) {
    showNotice(`学姐好感度 +${value}`);
  }
}

function initAffection() {
  const savedData = localStorage.getItem('affectionData');
  if (savedData) affectionData = JSON.parse(savedData);
  updateAffection(0);
}

function showNotice(message) {
  const notice = document.createElement('div');
  notice.className = 'save-notice';
  notice.textContent = message;
  document.body.appendChild(notice);
  
  setTimeout(() => {
    notice.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notice.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notice);
    }, 500);
  }, 2000);
}

// -------------------- 打字机效果 --------------------
function typeText(text, callback) {
  clearInterval(typingInterval);
  charIndex = 0;
  if (dialogText) dialogText.textContent = "";

  typingInterval = setInterval(() => {
    if (dialogText && charIndex < text.length) {
      dialogText.textContent += text[charIndex];
      charIndex++;
    } else {
      clearInterval(typingInterval);
      if (callback) callback();
    }
  }, typingSpeed);
}

function showDialogue(idx) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;

  let currentName = dialogues[index].name;
  if (nameBox) nameBox.textContent = currentName;

  // 根据角色显示不同头像
    if (currentName === "旁白") {
      // 旁白不显示任何立绘
      if (avatarContainer) avatarContainer.style.display = 'none';
      if (characterAvatar) {
        characterAvatar.style.display = 'none';
        // 清除 src 避免残留图片
        characterAvatar.src = '';
      }
    } else if (currentName === "学姐") {
      if (characterAvatar) {
        characterAvatar.src = "../../学姐.png";
        characterAvatar.style.display = 'block';
      }
      if (avatarContainer) avatarContainer.style.display = 'flex';
    } else if (currentName === "你") {
      if (characterAvatar) {
        characterAvatar.src = "../../男主.png";
        characterAvatar.style.display = 'block';
      }
      if (avatarContainer) avatarContainer.style.display = 'flex';
    } else {
      // 未知角色默认不显示立绘，但不报错
      if (avatarContainer) avatarContainer.style.display = 'none';
      if (characterAvatar) {
        characterAvatar.style.display = 'none';
        characterAvatar.src = '';
      }
    }

  const currentDialogue = dialogues[index];
     // 如果到达特定剧情，解锁成就
     if (index === 3) { 
      achievementSystem.unlockAchievement("qiangke");
    }
  

  // 如果是结局台词，直接显示文字并跳转
  if (currentDialogue.ending) {
    if (dialogText) dialogText.textContent = currentDialogue.text;
    charIndex = currentDialogue.text.length;

    setTimeout(() => {
      console.log("当前好感度:", affectionData.fang);
      if (affectionData.fang < 70) {
        window.location.href = "../../与学姐好感度不足分支/merge_story/storypage.html";
      } else {
        window.location.href = "../../与学姐好感度足够分支/storypage2.0 与学姐好感度足够 1/storypage.html";
      }
    }, 2000);

    return; // 不再进入打字机
  }
  // 检查是否需要触发手机震动
  if (dialogues[index].triggerPhone) {
    isPaused = true;
    stopAutoPlay();
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;

    if (window.makePhoneVibrate) {
      window.makePhoneVibrate();
      window.onPhoneVibrationComplete = function() {
        isPaused = false;
        if (index < dialogues.length - 1) {
          showDialogue(index + 1);
        }
      };
    }

    if (!window._phoneOpenListenerAdded) {
      window._phoneOpenListenerAdded = true;
      let lastPhoneOpen = window.phoneOpen;
      setInterval(function() {
        if (lastPhoneOpen && !window.phoneOpen && isPaused) {
          isPaused = false;
          if (index < dialogues.length - 1) {
            showDialogue(index + 1);
          }
        }
        lastPhoneOpen = window.phoneOpen;
      }, 300);
    }
    return;
  }

  typeText(dialogues[index].text, () => {
    if (dialogues[index].hasChoice) {
      forceShowChoices();
    }

    
  });
}

// -------------------- 强制显示选择框 --------------------
function forceShowChoices() {
  isChoiceActive = true;
  if (choiceContainer) choiceContainer.classList.remove("hidden");
  if (dialogBox) dialogBox.style.display = "none";
  
  clearInterval(typingInterval);
  clearInterval(autoInterval);
  stopAutoPlay();
}

// -------------------- 隐藏选择框 --------------------
function hideChoices() {
  isChoiceActive = false;
  if (choiceContainer) choiceContainer.classList.add("hidden");
  if (dialogBox) dialogBox.style.display = "block";
}

// -------------------- 处理选择 --------------------
function handleChoice(choice) {
  hideChoices();
  
  // 根据选择更新剧情
  if (choice === "A") {
    dialogues.push(
      { name: "学姐", text: "啊，正巧我也想吃呢，一起去吧~" },
    );//增加一个判定为true
  } else if (choice === "B") {
    dialogues.push(
      { name: "学姐", text: "嗯...还是吃拉面吧，有点想吃了。" },
      { name: "你", text: "诶...那一起去吧！" },
    );
  } else if (choice === "C") {
    dialogues.push(
      { name: "学姐", text: "嗯...还是吃拉面吧，有点想吃了。" },
      { name: "你", text: "诶...那一起去吧！" },
    );
  }
  
  // 继续剧情
  dialogues.push(
    { name: "旁白", text: "到了拉面店，你们各点了一碗拉面。" },
    { name: "学姐", text: "唔，不知道什么配菜好呢，你有什么推荐的吗" },//todo:添加选择1.叉烧2.关东煮3.饺子 选1将第二个判定设为true
    { name: "学姐", text: "好啊，那就吃这个吧" },
    { name: "旁白", text: "你们一起吃完，坐上了回学校的摆渡车" },
    { name: "旁白", text: "你看着学姐，好感度一直没有变化" },
    { name: "学姐", text: "要不要去操场散散心？" },
    { name: "你", text: "嗯嗯，听你安排" },
    { name: "旁白", text: "你们一起来到了操场" },//切换场景
    { name: "学姐", text: "...其实，我一直有点顾虑" },
    { name: "学姐", text: "你总是能完美的迎合我的想法，仿佛能洞穿我的内心一样" },
    { name: "学姐", text: "这么想的时候，我的身边就发生了怪事" },
    { name: "学姐", text: "我好像能看到我自己类似好感度条的东西..." },
    { name: "学姐", text: "我想着最近和我相处的你，会不会也能看到呢？" },
    { name: "你", text: "...这" },//选择：1.承认 2.隐瞒
    //1.学姐：哈哈，果然是这样吗... 你：但是，无论有没有好感度，我都会喜欢上你的 /如果对你有困扰，我真的很抱歉...
    //2.学姐：你不知道吗 抱歉，当我没说过 你：虽然不知道好感度条是什么，但我真的想要不断了解你，因为我真的很喜欢你
    { name: "旁白", text: "学姐对着笑了笑" },
    { name: "学姐", text: "是这样吗...考虑一下吧" },
    { name: "学姐", text: "寒假之前，我会给你答复的",ending: true },//如三个判定有两个判定都是true，进足够1 1 4，否则进不足
  );

  // 显示下一句对话
  showDialogue(index + 1);
}

// -------------------- 停止自动播放 --------------------
function stopAutoPlay() {
  autoPlay = false;
  clearInterval(autoInterval);
  if (autoBtn) autoBtn.textContent = "自动播放";
}

// -------------------- 开始自动播放 --------------------
function startAutoPlay() {
  clearInterval(autoInterval);
  autoInterval = setInterval(() => {
    if (isChoiceActive || isPaused) {
      stopAutoPlay();
      return;
    }
    
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      if (dialogText) dialogText.textContent = dialogues[index].text;
    } else {
      if (index < dialogues.length - 1) showDialogue(index + 1);
      else stopAutoPlay();
    }
  }, 2000);
}

// -------------------- 侧边栏控制 --------------------

// -------------------- 侧边栏控制 --------------------

const toggleBtn = document.getElementById("sidebar-toggle");

if (toggleBtn && sidebar) {
  toggleBtn.addEventListener("click", () => sidebar.classList.toggle("show"));
}// -------------------- 音乐控制 --------------------
function toggleMusic() {
  if (bgMusic) {
    if (bgMusic.paused) {
      bgMusic.play();
      if (musicBtn) musicBtn.textContent = "音乐暂停";
    } else {
      bgMusic.pause();
      if (musicBtn) musicBtn.textContent = "音乐播放";
    }
  }
}

// 获取 body 背景图片的绝对路径
function getBodyBackgroundAbsoluteUrl() {
  const bg = window.getComputedStyle(document.body).backgroundImage; 
  // bg 可能是 'url("images/bg1.png")' 或者 'none'
  if (!bg || bg === "none") return null;

  // 去掉 url("") 包裹
  let url = bg.slice(4, -1).replace(/["']/g, "");

  // 转成绝对路径
  const absoluteUrl = new URL(url, window.location.href).href;
  return absoluteUrl;
}

const bodyBg = getBodyBackgroundAbsoluteUrl();
// -------------------- 存档系统 --------------------

if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    // 读现有存档数组
    const saves = JSON.parse(localStorage.getItem("storySaves") || "[]");

    // 规范化 scene：优先使用 pathname，但如果是 file:// (本地) 去掉驱动器前缀
    let scene = window.location.pathname.startsWith("/") ? window.location.pathname : "/" + window.location.pathname;

    // 如果是在本地打开（file:），去掉像 "/D:" 的前缀，保留后面的路径
    if (window.location.protocol === "file:") {
      scene = scene.replace(/^\/[A-Za-z]:/, ""); // "/D:/.../coser/index.html" -> "/.../coser/index.html"
      if (!scene.startsWith("/")) scene = "/" + scene;
    }

    // 构建存档对象
    const saveData = {
      scene: scene,
      branch: "common",
      dialogueIndex: index || 0,
      affectionData: { ...affectionData },
      background: bodyBg,  // 🔹 保存背景图
      timestamp: Date.now()
    };
    console.log("存档进度：", saveData);

    saves.push(saveData);
    localStorage.setItem("storySaves", JSON.stringify(saves));

    console.log("存档已写入：", saveData);
    alert("游戏已存档！");

    // 仅在 initSaveUI 存在的情况下调用（避免 ReferenceError）
    if (typeof initSaveUI === "function") {
      initSaveUI();
    }
  });
}



if (loadBtn) {
    loadBtn.addEventListener("click", () => { 
        // 直接跳转到存档界面
        window.location.href = "../../savepage/savepage2.0/save.htm";
    });
}


// -------------------- 事件监听器 --------------------
function bindEventListeners() {
  if (nextBtn) nextBtn.addEventListener("click", () => {
    if (window.phoneOpen) return;
    if (isPaused || isChoiceActive) return;
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      if (dialogText) dialogText.textContent = dialogues[index].text;
      charIndex = dialogues[index].text.length;
    } else {
      if (index < dialogues.length - 1) {
        showDialogue(index + 1);
      }
    }
    stopAutoPlay();
  });

  if (prevBtn) prevBtn.addEventListener("click", () => {
    if (isPaused) return;
    showDialogue(index - 1);
    stopAutoPlay();
  });

  if (speedBtn) speedBtn.addEventListener("click", () => {
    if (isPaused) return;
    isFast = !isFast;
    typingSpeed = isFast ? 10 : 50;
    if (speedBtn) speedBtn.textContent = isFast ? "原速" : "加速";
    showDialogue(index);
  });

  if (autoBtn) autoBtn.addEventListener("click", () => {
    if (isPaused) return;
    if (isChoiceActive) return;
    
    autoPlay = !autoPlay;
    if (autoPlay) {
      if (autoBtn) autoBtn.textContent = "停止自动";
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
  });

  if (skipBtn) skipBtn.addEventListener("click", () => {
    if (isChoiceActive) return;
    
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
  });

  if (choiceBtns && choiceBtns.forEach) {
    choiceBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (!isChoiceActive) return;
        const choice = btn.dataset.choice;
        handleChoice(choice);
      });
    });
  }


  
  mainMenuBtn.addEventListener("click", () => {
    document.body.classList.remove("fade-in");
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "../../index.html";
    }, 500);
  });

  if (musicBtn) musicBtn.addEventListener('click', toggleMusic);
  if (volumeRange && bgMusic) {
    volumeRange.addEventListener('input', () => {
      bgMusic.volume = volumeRange.value / 100;
    });
  }
}
  // 空格键推进剧情（按下只触发一次，长按不会重复触发）
  document.addEventListener('keydown', function(e) {
    // 只处理空格键
    const isSpace = e.code === 'Space' || e.key === ' ' || e.keyCode === 32;
    if (!isSpace) return;
    // 防止长按连续触发
    if (spaceDown) return;
    spaceDown = true;

    if (window.phoneOpen) return;
    if (isPaused) return;
    if (isChoiceActive) return;
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      if (dialogText) dialogText.textContent = dialogues[index].text;
      charIndex = dialogues[index].text.length;
    } else {
      if (index < dialogues.length - 1) {
        showDialogue(index + 1);
      }
    }
    stopAutoPlay();
  });

  // 在空格松开时允许再次触发
  document.addEventListener('keyup', function(e) {
    const isSpace = e.code === 'Space' || e.key === ' ' || e.keyCode === 32;
    if (isSpace) spaceDown = false;
  });


   // 添加鼠标左键点击事件监听器
  document.addEventListener('click', (e) => {
    if (window.phoneOpen) return;
    if (isPaused) return;
    if (e.target.tagName !== 'BUTTON' && 
        e.target.tagName !== 'INPUT' && 
        e.target.tagName !== 'IMG' &&
        e.target.id !== 'sidebar-toggle' &&
        !e.target.closest('button') &&
        !e.target.closest('input') &&
        !e.target.closest('img') &&
        !e.target.closest('#sidebar-toggle')) {
      if (isChoiceActive) return;
      if (charIndex < dialogues[index].text.length) {
        clearInterval(typingInterval);
        if (dialogText) dialogText.textContent = dialogues[index].text;
        charIndex = dialogues[index].text.length;
      } else {
        if (index < dialogues.length - 1) {
          showDialogue(index + 1);
        }
      }
      stopAutoPlay();
    }
  });


// -------------------- 初始化 --------------------
function init() {
  initAffection();
  showDialogue(0);
  bindEventListeners();

  if (window.phoneModule && window.phoneModule.initPhoneElements) {
    window.phoneModule.initPhoneElements();
    window.phoneModule.initPhoneChat();
  }
}

// -------------------- DOMContentLoaded 初始化 --------------------
document.addEventListener('DOMContentLoaded', function() {
  document.body.classList.add("fade-in");
  init();
});

// -------------------- 小游戏覆盖层（iframe）支持 --------------------
// 在剧情中任何对话对象里使用 playGame: "key" 即可打开对应根目录下的小游戏页面
const gameOverlayId = 'game-overlay-iframe';

function createGameOverlay() {
  // 避免重复创建
  if (document.getElementById(gameOverlayId)) return;

  const overlay = document.createElement('div');
  overlay.id = gameOverlayId;
  overlay.style.position = 'fixed';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.85)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';

  const container = document.createElement('div');
  container.style.width = '90%';
  container.style.height = '90%';
  container.style.position = 'relative';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '返回游戏';
  closeBtn.style.position = 'absolute';
  closeBtn.style.right = '8px';
  closeBtn.style.top = '8px';
  closeBtn.style.zIndex = '10001';
  closeBtn.addEventListener('click', () => {
    closeGame();
  });

  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.id = gameOverlayId + '-frame';

  container.appendChild(closeBtn);
  container.appendChild(iframe);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
}

function openGame(key) {
  // key -> 映射到根目录下的两个小游戏文件
  const map = {
    jianshu: '../../jianshu(移动端测试/jianshu.html',
    binghongcha: '../../binghongcha/binghongcha3.html'
  };

  // 兼容没有配置的情况
  if (!key || !map[key]) {
    console.warn('未知的小游戏 key:', key);
    return;
  }

  createGameOverlay();
  const iframe = document.getElementById(gameOverlayId + '-frame');
  const overlay = document.getElementById(gameOverlayId);
  if (!iframe || !overlay) return;

  // 解析目标 URL —— 使用 new URL 可以正确解析相对路径（无论是 file:// 还是 http(s)）
  let resolvedUrl;
  try {
    resolvedUrl = new URL(map[key], window.location.href).href;
  } catch (e) {
    // 如果 map[key] 是完整 URL，会直接使用
    resolvedUrl = map[key];
  }
  console.log('打开小游戏 URL:', resolvedUrl);
  // 标记当前对话对应的小游戏已被播放，防止关闭后再次触发
  try { if (dialogues[index]) dialogues[index]._gamePlayed = true; } catch (e) {}

  // 如果当前页面是通过 file:// 打开，许多浏览器会阻止在 iframe 中加载本地文件。
  // 尝试用新窗口打开并监测窗口关闭以恢复剧情；推荐使用本地 HTTP 服务以获得最佳体验。
  if (window.location.protocol === 'file:') {
    const child = window.open(resolvedUrl, '_blank');
    if (!child) {
      alert('浏览器阻止了弹窗。请关闭弹窗阻止以在 iframe 中嵌入小游戏。');
      return;
    }

    // 暂停剧情
    isPaused = true;
    stopAutoPlay();

    // 轮询子窗口是否已关闭，关闭后恢复剧情（如果游戏没有通过 postMessage 返回结果，会在此处推进）
    const poll = setInterval(() => {
      try {
        if (child.closed) {
          clearInterval(poll);
          // 如果已经通过 postMessage 处理过结束（_gameEndHandled），则不重复推进
          if (dialogues[index] && dialogues[index]._gameEndHandled) {
            isPaused = false;
            return;
          }
          isPaused = false;
          if (index < dialogues.length - 1) showDialogue(index + 1);
        }
      } catch (e) {
        // 访问被拒绝时也尝试恢复
        clearInterval(poll);
        if (dialogues[index] && dialogues[index]._gameEndHandled) {
          isPaused = false;
          return;
        }
        isPaused = false;
        if (index < dialogues.length - 1) showDialogue(index + 1);
      }
    }, 500);

    return;
  }

  iframe.src = resolvedUrl;
  overlay.style.display = 'flex';
  // 暂停剧情的操作
  isPaused = true;
  stopAutoPlay();
}

function closeGame() {
  const overlay = document.getElementById(gameOverlayId);
  if (!overlay) return;
  overlay.style.display = 'none';
  const iframe = document.getElementById(gameOverlayId + '-frame');
  if (iframe) iframe.src = 'about:blank';
  // 恢复剧情
  isPaused = false;
  // 继续下一句对话（防止回到带有 playGame 的同一句而重复触发）
  if (index < dialogues.length - 1) showDialogue(index + 1);
}

// 监听来自 iframe 的 postMessage，小游戏在结束时应发送 { type: 'gameEnd' }
window.addEventListener('message', (ev) => {
  let data = ev.data;
  try {
    // 某些游戏可能会发送 JSON 字符串
    if (typeof data === 'string') data = JSON.parse(data);
  } catch (e) {
    // ignore
  }

  if (!data || typeof data !== 'object') return;

  if (data.type === 'gameEnd') {
    // 标记当前对话已通过消息处理结束，避免轮询重复推进
    if (dialogues[index]) dialogues[index]._gameEndHandled = true;

    // 如果小游戏返回了 courses 字段，按不同 item 分支处理（例如冰红茶需要阈值判断）
    if (typeof data.courses === 'number') {
      const itemLabel = typeof data.item === 'string' ? data.item : '节课';
      if (itemLabel === '瓶冰红茶') {
        // 冰红茶按分数阈值判断成功或失败（>1000 成功）
        const success = data.courses > 1000;
        const msg = success ? `成功抢到冰红茶` : `未抢到冰红茶`;
        showResultPopup(msg, () => {
          closeGame();
          if (typeof data.affectionDelta === 'number') updateAffection(data.affectionDelta);
        });
      } else {
        // 其他物品使用通用弹窗
        showCoursePopup(data.courses, itemLabel, () => {
          closeGame();
          if (typeof data.affectionDelta === 'number') updateAffection(data.affectionDelta);
        });
      }
    } else {
      // 直接关闭并继续
      closeGame();
      if (typeof data.affectionDelta === 'number') updateAffection(data.affectionDelta);
    }
  }
  else if (data.type === 'gameRestart') {
    // 清除当前对话的 game end 标志，以便接收新的返回值
    if (dialogues[index]) dialogues[index]._gameEndHandled = false;
    console.log('收到 gameRestart，已清除 _gameEndHandled');
  }
});

// 显示一个简洁的弹窗，告知玩家抢到了 n 节课，点击确认后回调
function showCoursePopup(n, itemLabel, cb) {
  const id = 'course-popup-notice';
  let box = document.getElementById(id);
  if (!box) {
    box = document.createElement('div');
    box.id = id;
    box.style.position = 'fixed';
    box.style.left = '50%';
    box.style.top = '40%';
    box.style.transform = 'translate(-50%, -50%)';
    box.style.background = 'rgba(0,0,0,0.9)';
    box.style.color = '#fff';
    box.style.padding = '20px';
    box.style.borderRadius = '8px';
    box.style.zIndex = '10002';
    box.style.textAlign = 'center';
    const bodyDiv = document.createElement('div');
    bodyDiv.style.fontSize = '18px';
    bodyDiv.style.marginBottom = '12px';
    bodyDiv.className = 'course-popup-body';
    box.appendChild(bodyDiv);
    const btn = document.createElement('button');
    btn.className = 'course-popup-btn';
    btn.textContent = '确定';
    btn.style.padding = '6px 12px';
    box.appendChild(btn);
    document.body.appendChild(box);
  }

  // 更新内容并重新绑定按钮回调（覆盖旧的回调）
  const bodyDiv = box.querySelector('.course-popup-body');
  const btn = box.querySelector('.course-popup-btn');
  if (bodyDiv) bodyDiv.textContent = `你抢到了 ${n} ${itemLabel}！`;

  // 清除旧的事件监听（简单替换方式）
  const newBtn = btn.cloneNode(true);
  newBtn.addEventListener('click', () => {
    if (box && box.parentNode) box.parentNode.removeChild(box);
    if (cb) cb();
  });
  btn.parentNode.replaceChild(newBtn, btn);
}

// 显示成功/失败的简单结果弹窗（用于冰红茶按阈值判断）
function showResultPopup(message, cb) {
  const id = 'course-popup-notice';
  let box = document.getElementById(id);
  if (!box) {
    box = document.createElement('div');
    box.id = id;
    box.style.position = 'fixed';
    box.style.left = '50%';
    box.style.top = '40%';
    box.style.transform = 'translate(-50%, -50%)';
    box.style.background = 'rgba(0,0,0,0.9)';
    box.style.color = '#fff';
    box.style.padding = '20px';
    box.style.borderRadius = '8px';
    box.style.zIndex = '10002';
    box.style.textAlign = 'center';
    const bodyDiv = document.createElement('div');
    bodyDiv.style.fontSize = '18px';
    bodyDiv.style.marginBottom = '12px';
    bodyDiv.className = 'course-popup-body';
    box.appendChild(bodyDiv);
    const btn = document.createElement('button');
    btn.className = 'course-popup-btn';
    btn.textContent = '确定';
    btn.style.padding = '6px 12px';
    box.appendChild(btn);
    document.body.appendChild(box);
  }

  const bodyDiv = box.querySelector('.course-popup-body');
  const btn = box.querySelector('.course-popup-btn');
  if (bodyDiv) bodyDiv.textContent = message;

  const newBtn = btn.cloneNode(true);
  newBtn.addEventListener('click', () => {
    if (box && box.parentNode) box.parentNode.removeChild(box);
    if (cb) cb();
  });
  btn.parentNode.replaceChild(newBtn, btn);
}

// 扫描对话数组，在显示对话时检查 playGame 字段并触发 openGame
const originalShowDialogue = showDialogue;
function showDialogueWrapper(i) {
  const d = dialogues[i];
  // 如果本句需要触发小游戏且尚未播放，立即暂停剧情，阻止任何推进行为
  if (d && d.playGame && !d._gamePlayed) {
    isPaused = true;
    stopAutoPlay();
    // 先显示当前对话，再在短延迟后打开小游戏
    originalShowDialogue(i);
    setTimeout(() => openGame(d.playGame), 600);
    return;
  }

  originalShowDialogue(i);
}


// 覆盖原函数
showDialogue = showDialogueWrapper;
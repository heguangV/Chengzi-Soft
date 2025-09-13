// -------------------- DOM 元素 --------------------
let dialogText, nameBox, nextBtn, prevBtn, speedBtn, skipBtn, autoBtn;
let choiceContainer, choiceBtns, dialogBox;
let musicBtn, bgMusic, volumeRange;
let sidebar, toggleBtn;
let autoSaveNotice, saveBtn, loadBtn;
// 手机/聊天界面元素
let phoneImage, phoneChatInterface, chatCloseBtn, chatMessages, chatInput, chatSendBtn;
// 头像相关元素
let characterAvatarContainer, characterAvatar;

// -------------------- 状态变量 --------------------
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;

let autoPlay = false;
let autoInterval = null;
let isFast = false;
let isChoiceActive = false; // 新增：标记选择是否激活
let spaceDown = false; // 防止空格长按连续触发
// 手机交互状态
let waitingForPhoneResponse = false;
let phoneNotification = null;
let hasAddedPhoneMessages = false;
let phoneCloseTimeoutId = null;
let phoneContinueDone = false;

// -------------------- 好感度数据 --------------------
let affectionData = {
  fang: 100,
  other: 0
};

// -------------------- 剧情台词 --------------------
// -------------------- 剧情数据 --------------------
const dialogues = [
  { name: "B", text: "最终 学姐答应了我的告白" },//room
  { name: "C", text: "寒假中 你们约定好一同去水族馆 而你起晚了" },
  { name: "B", text: "这不能怪我啊！ 明明订好了闹钟为什么会不响啊！！" }, 
  { name: "C", text: "不管了！ 去水族馆要紧" }, 
  { name: "C", text: "你飞奔下楼 骑上一辆共享单车 天遂人愿 你勉强在约定的时间中赶到了水族馆前" },//street
  { name: "C", text: "她站在水族馆门口 以一副幽怨的眼神注视着你 伸出手指在你的脑袋上敲了一下" },
  { name: "A", text: "“头发都没梳好 还说自己起床了！ 我教你的穿搭技巧倒是有好好在学…”" },
  { name: "A", text: "用手轻轻梳理着你的头发 一边打量着你全身的穿着" },
  { name: "B", text: "这可是我花了一晚上才挑选出来的 要不然怎么会起晚） 想着 你也观察起她的穿着" },
  { name: "C", text: "她身着一件淡蓝色的衬衫 一件短款的夹克 穿着一件高腰牛仔裤 戴着一只米色的棒球帽 " },
  { name: "C", text: "虽然简约 但在她如同明星般的比例与气质的映衬下 还是让人难以移开目光 惹得走过的路人频频注目" },
  { name: "A", text: "怎么样 学姐的专业穿搭” 她的脸上扬起一种自豪感 仿佛在等待你的夸奖" },
  { name: "B", text: "非常漂亮，真是让人移不开眼睛呢" },
  { name: "B", text: "你将内心的想法和盘托出" },
  { name: "C", text: "学姐愣了一下，转身牵起你的手走进了水族馆" },
  { name: "B", text: "你发现，学姐的耳根微微发红" },
  { name: "C", text: "水族馆中的灯光暗淡 只剩下水箱中淡淡的蓝色弥漫在空气之中" },//shuizuguan
  { name: "A", text: "牵着你的手 向着一个方向快速前进着 像是有什么确定的目标 你虽然疑惑 但也毫无抗拒着跟着不断向前" }, 
  { name: "C", text: "在走过一段长廊后 迎面而来的是一个「360 度全透明」的水下世界 水下的各种植物与动物毫无掩饰的展现在眼前 光源也只剩下了水中泛出的微光 世界仿佛都黯淡了下来" },
  { name: "A", text: "「这里是我朋友推荐的哦 怎么样 很有震撼感吧~」" },  
  { name: "C", text: "你确实被这场景震撼到 不由得点了点头" }, 
  { name: "A", text: "「她还说 这里最适合…」 声音在最关键的地方消失" }, 
  { name: "B", text: "「???」 你看着她莫名羞红的脸 忽然仿佛有了答案" },
  { name: "C", text: "在淡蓝色的世界中 你伸出了双手 将学姐拥入怀中" },
  { name: "A", text: "你感受到学姐并没有任何反抗 反而迎合着你 伸手抱住了你" },  
  { name: "C", text: "你看着怀中的学姐 脸颊上的红晕甚至比刚才更加明显 她的嘴唇微微颤动 仿佛有话要说 你便试着将耳朵贴的更近了一点" }, 
  { name: "A", text: "我喜欢你…" }, 
  { name: "B", text: "整个世界好像只剩下了这一句话的声音 你被这突如其来的告白怔在了原地 一时说不出话" },
  { name: "A", text: "“怎么一点反应都没有 你听到了对吧！”" },
  { name: "B", text: "“抱歉 我还是有点蒙 你刚才 对我告白了吗”" },  
  { name: "A", text: "“你果然是听到了 那为什么还不说话！”" }, 
  { name: "B", text: "看着怀里气鼓鼓的学姐 “原来这一切都不是梦境吗”" }, 
  { name: "B", text: "“我当然也喜欢你了 就算你不说 我也会向你表白”" }, 
  { name: "A", text: "“哼 那罚你也要说！”" }, 
  { name: "B", text: "“我喜欢你 请以后一定都要和我在一起”" }, 
  { name: "A", text: "“说好了 可就不能反悔了哦 我们要永远在一起”" }, 
  { name: "C", text: "在这温软的对话之间 周围好像变得越来越亮 我相信 我们的未来也会想这样无比耀眼吧…" }, 
];

// -------------------- 场景背景切换（按注释） --------------------
// 已有资源：room.png, street.png, shizuguan.png（对应“水族馆”）
let currentBgTag = null; // 'room' | 'street' | 'shuizuguan'
const BG_BY_TAG = {
  room: '../../asset/images/room.png',
  street: '../../asset/images/street.png',
  shuizuguan: '../../asset/images/shizuguan.png'
};

// 轻量淡入淡出覆盖层，避免突兀切换
let _bgFadeOverlay = null, _bgFadeBusy = false, _bgFadePending = null;
function getBgFadeOverlay() {
  if (_bgFadeOverlay) return _bgFadeOverlay;
  const ov = document.createElement('div');
  ov.id = 'bg-fade-overlay';
  ov.style.position = 'fixed';
  ov.style.left = '0';
  ov.style.top = '0';
  ov.style.width = '100%';
  ov.style.height = '100%';
  ov.style.background = '#000';
  ov.style.opacity = '0';
  ov.style.transition = 'opacity 220ms linear';
  ov.style.pointerEvents = 'none';
  ov.style.zIndex = '9998';
  document.body.appendChild(ov);
  _bgFadeOverlay = ov;
  return ov;
}

function setSceneBackground(url) {
  if (!url) return;
  try {
    const ov = getBgFadeOverlay();
    const perform = (u) => {
      ov.style.transition = 'opacity 220ms linear';
      ov.style.opacity = '1';
      setTimeout(() => {
        document.body.style.backgroundImage = `url("${u}")`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center center';
        document.body.style.backgroundRepeat = 'no-repeat';
        requestAnimationFrame(() => {
          ov.style.transition = 'opacity 300ms ease';
          ov.style.opacity = '0';
          setTimeout(() => {
            _bgFadeBusy = false;
            if (_bgFadePending) { const p = _bgFadePending; _bgFadePending = null; setSceneBackground(p); }
          }, 310);
        });
      }, 230);
    };
    if (_bgFadeBusy) { _bgFadePending = url; return; }
    _bgFadeBusy = true;
    perform(url);
  } catch (e) { /* noop */ }
}

function maybeUpdateBackgroundByIndex(i) {
  // 0 -> room, 4 -> street, 15 -> shuizuguan
  if (i === 0) {
    if (currentBgTag !== 'room') { currentBgTag = 'room'; setSceneBackground(BG_BY_TAG.room); }
    return;
  }
  if (i === 4) {
    if (currentBgTag !== 'street') { currentBgTag = 'street'; setSceneBackground(BG_BY_TAG.street); }
    return;
  }
  if (i === 15) {
    if (currentBgTag !== 'shuizuguan') { currentBgTag = 'shuizuguan'; setSceneBackground(BG_BY_TAG.shuizuguan); }
    return;
  }
}

// -------------------- DOMContentLoaded 初始化 --------------------
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");

  // 获取所有DOM元素
  dialogText = document.getElementById("dialog-text");
  nameBox = document.querySelector(".character-name");

  nextBtn = document.getElementById("next-btn");
  prevBtn = document.getElementById("prev-btn");
  speedBtn = document.getElementById("speed-btn");
  skipBtn = document.getElementById("skip-btn");
  autoBtn = document.getElementById("auto-btn");

  choiceContainer = document.getElementById("choice-container");
  choiceBtns = document.querySelectorAll(".choice-btn");
  dialogBox = document.querySelector(".dialog-box");

  musicBtn = document.getElementById("music-btn");
  bgMusic = document.getElementById("bg-music");
  volumeRange = document.getElementById("volume-range");

  sidebar = document.getElementById("sidebar");
  toggleBtn = document.getElementById("sidebar-toggle");

  autoSaveNotice = document.getElementById("auto-save-notice");
  saveBtn = document.getElementById("save-btn");
  loadBtn = document.getElementById("load-btn");

  // 头像相关元素
  characterAvatarContainer = document.getElementById('character-avatar-container');
  characterAvatar = document.getElementById('character-avatar');

  // 手机相关DOM
  phoneImage = document.getElementById('phone-image');
  phoneChatInterface = document.getElementById('phone-chat-interface');
  chatCloseBtn = document.getElementById('chat-close-btn');
  chatMessages = document.getElementById('chat-messages');
  chatInput = document.getElementById('chat-input');
  chatSendBtn = document.getElementById('chat-send-btn');

  // 初始化好感度显示
  initAffection();

  // 显示第一句对话
  showDialogue(0);

  // 绑定按钮事件
  bindControlButtons();
  // 初始化手机聊天
  initPhoneChat();
  
  // 修复：直接为侧边栏按钮添加事件监听器
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (sidebar) sidebar.classList.toggle("show");
    });
  }

  // 音乐：初始化与自动播放尝试
  initMusicControls();
  tryAutoPlayMusic();
});

// -------------------- 打字机效果 --------------------
function typeText(text, callback) {
  clearInterval(typingInterval);
  charIndex = 0;
  if (dialogText) dialogText.textContent = "";

  typingInterval = setInterval(() => {
    if (dialogText) dialogText.textContent += text[charIndex];
    charIndex++;
    if (charIndex >= text.length) {
      clearInterval(typingInterval);
      if (callback) callback();
    }
  }, typingSpeed);
}

// -------------------- 手机/聊天界面功能 --------------------
function initPhoneChat() {
  if (phoneImage) {
    phoneImage.addEventListener('click', (e) => {
      e.stopPropagation();
      if (waitingForPhoneResponse) {
        handlePhoneResponse();
        return;
      }
      openChatInterface();
    });
  }

  if (chatCloseBtn) chatCloseBtn.addEventListener('click', closeChatInterface);
  if (chatSendBtn) chatSendBtn.addEventListener('click', sendChatMessage);
  if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMessage(); });

  loadChatMessages();
}

function openChatInterface() {
  if (!phoneChatInterface) return;
  phoneChatInterface.classList.add('show');
  // 确保滚动到底部
  setTimeout(() => { if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight; }, 100);
}

function closeChatInterface() {
  if (!phoneChatInterface) return;
  phoneChatInterface.classList.remove('show');
}

function makePhoneVibrate() {
  if (!phoneImage) return;
  phoneImage.classList.add('phone-vibrating');
  phoneNotification = document.createElement('div');
  phoneNotification.classList.add('phone-notification');
  phoneImage.appendChild(phoneNotification);
  waitingForPhoneResponse = true;
  phoneContinueDone = false;
  stopAutoPlay();

  // 安全超时：如果玩家在较长时间未点击手机，自动触发一次响应（例如 30s）以避免永久阻塞
  if (phoneCloseTimeoutId) clearTimeout(phoneCloseTimeoutId);
  phoneCloseTimeoutId = setTimeout(() => {
    if (waitingForPhoneResponse) handlePhoneResponse();
  }, 30000);
}

function handlePhoneResponse() {
  if (phoneImage) {
    phoneImage.classList.remove('phone-vibrating');
    if (phoneNotification && phoneImage.contains(phoneNotification)) phoneImage.removeChild(phoneNotification);
  }

  // 确保只执行一次继续剧情的操作
  if (phoneCloseTimeoutId) { clearTimeout(phoneCloseTimeoutId); phoneCloseTimeoutId = null; }
  if (phoneContinueDone) return;
  phoneContinueDone = true;

  // 添加学姐发来的两句台词并打开聊天界面
  if (!hasAddedPhoneMessages) addPhoneFinalMessages();
  openChatInterface();
  waitingForPhoneResponse = false;

  // 一定时间后关闭手机并继续剧情（确保只触发一次）
  setTimeout(() => {
    closeChatInterface();
    if (typeof showDialogue === 'function') showDialogue(index + 1);
  }, 2500);
}

// 简单的聊天记录显示与添加
let phoneChatData = [

];

function loadChatMessages() {
  if (!chatMessages) return;
  chatMessages.innerHTML = '';
  phoneChatData.forEach(msg => {
    const el = document.createElement('div');
    el.className = 'message ' + msg.sender;
    const c = document.createElement('div'); c.className = 'message-content'; c.textContent = msg.text;
    const t = document.createElement('div'); t.className = 'message-time'; t.textContent = msg.time;
    el.appendChild(c); el.appendChild(t); chatMessages.appendChild(el);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addPhoneFinalMessages() {
 

  loadChatMessages();
}

function sendChatMessage() {
  if (!chatInput || !chatMessages) return;
  const val = chatInput.value.trim();
  if (!val) return;
  const now = new Date();
  const time = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
  phoneChatData.push({ sender: 'sent', text: val, time });
  chatInput.value = '';
  loadChatMessages();
  // 模拟回复
  setTimeout(simulateReply, 800);
}

function simulateReply() {
  const replies = ['好的，我知道了', '保持联系哦'];
  const rep = replies[Math.floor(Math.random() * replies.length)];
  const now = new Date();
  const time = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
  phoneChatData.push({ sender: 'received', text: rep, time });
  loadChatMessages();
}

// -------------------- 显示某条对话 --------------------
function showDialogue(idx) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length){
    idx = dialogues.length - 1;
    if (window.achievementSystem) {
      achievementSystem.unlockAchievement("happyending");
    }
  }
  index = idx;
  // 播放每句对白开始音效
  (function(){
    try {
      const url = '../../asset/sounds/speak.ogg';
      if (!window.__sfx_speak) {
        window.__sfx_speak = new Audio(url);
        window.__sfx_speak.preload = 'auto';
        window.__sfx_speak.volume = 0.6;
        window.__sfx_last = -1;
      }
      if (window.__sfx_last !== index) {
        window.__sfx_last = index;
        const a = window.__sfx_speak; a.pause(); a.currentTime = 0; a.play().catch(()=>{});
      }
    } catch (e) {}
  })();
  // 根据注释索引切换背景
  maybeUpdateBackgroundByIndex(index);

  // 名称映射逻辑
  let currentName = dialogues[index].name;
  let displayName = currentName;
  
  // 根据name值修改显示名称和头像
  if (nameBox) {
    if (currentName === 'C') {
      // 旁白：隐藏头像
      displayName = '旁白';
      if (characterAvatarContainer) {
        characterAvatarContainer.style.display = 'none';
        characterAvatarContainer.style.visibility = 'hidden';
      }
      if (characterAvatar) {
        characterAvatar.src = '';
        characterAvatar.alt = '';
        characterAvatar.style.display = 'none';
        characterAvatar.style.visibility = 'hidden';
      }
    } else if (currentName === 'B') {
      // 主角：显示男主头像
      displayName = '男主';
      if (characterAvatar) {
        characterAvatar.src = '../../asset/images/男主.png';
        characterAvatar.alt = '主角头像';
        characterAvatar.style.display = 'block';
        characterAvatar.style.visibility = 'visible';
      }
      if (characterAvatarContainer) {
        characterAvatarContainer.style.display = 'block';
        characterAvatarContainer.style.visibility = 'visible';
      }
    } else if (currentName === 'A' || currentName === '学姐') {
      // 学姐：显示学姐头像
      displayName = '学姐';
      if (characterAvatar) {
        characterAvatar.src = '../../asset/images/学姐.png';
        characterAvatar.alt = '学姐头像';
        characterAvatar.style.display = 'block';
        characterAvatar.style.visibility = 'visible';
      }
      if (characterAvatarContainer) {
        characterAvatarContainer.style.display = 'block';
        characterAvatarContainer.style.visibility = 'visible';
      }
    } else {
      // 其他角色：隐藏头像
      if (characterAvatarContainer) {
        characterAvatarContainer.style.display = 'none';
        characterAvatarContainer.style.visibility = 'hidden';
      }
      if (characterAvatar) {
        characterAvatar.src = '';
        characterAvatar.alt = '';
        characterAvatar.style.display = 'none';
        characterAvatar.style.visibility = 'hidden';
      }
    }

    nameBox.textContent = displayName;
  }

  typeText(dialogues[index].text, () => {
    if (index === 999) autoSave();
    if (index === 999) setTimeout(showChoices, 500);
    // TODO位置：学姐车离去后手机振动
    if (index === 999) {
      makePhoneVibrate();
    }

    // 结尾台词触发成就：开创未来
    try {
      const line = dialogues[index] && dialogues[index].text;
      if (typeof line === 'string' && line.indexOf('在这温软的对话之间 周围好像变得越来越亮 我相信 我们的未来也会想这样无比耀眼吧…') !== -1) {
        if (window.achievementSystem) {
          achievementSystem.unlockAchievement('kaichuang_weilai');
        }
      }
    } catch (e) { /* no-op */ }
  });
}

// -------------------- 下一句 --------------------
function handleNext() {
  if (charIndex < (dialogues[index]?.text.length || 0)) {
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = dialogText.textContent.length;
    if (index === 999) setTimeout(showChoices, 500);
  } else {
      if (index < dialogues.length - 1) {
        showDialogue(index + 1);
      } else {
        // 直接跳转到存档界面
        // 在这里添加成就解锁
        if (window.achievementSystem) {
          achievementSystem.unlockAchievement("happyending");
          alert("游戏结束！");
          
        }
        console.log("准备跳转到主页...");
        // 使用短延时并替换历史记录，更可靠地跳转并避免产生新的历史记录记录
        setTimeout(() => {
          window.location.replace("../../index.html");
        }, 120);
      }
    }
  stopAutoPlay();
}

// -------------------- 上一句 --------------------
function handlePrev() {
  showDialogue(index - 1);
  stopAutoPlay();
}

// -------------------- 加速 --------------------
function toggleSpeed() {
  isFast = !isFast;
  typingSpeed = isFast ? 10 : 50;
  if (speedBtn) speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
}

// -------------------- 跳过 --------------------
function handleSkip() {
  clearInterval(typingInterval);
  if (dialogText) dialogText.textContent = dialogues[index].text;
  charIndex = dialogText.textContent.length;
  stopAutoPlay();
}

// -------------------- 自动播放 --------------------
function toggleAutoPlay() {
  autoPlay = !autoPlay;
  if (autoPlay) {
    if (autoBtn) autoBtn.textContent = "停止自动";
    startAutoPlay();
  } else {
    stopAutoPlay();
  }
}

function startAutoPlay() {
  clearInterval(autoInterval);
  autoInterval = setInterval(() => {
  if (waitingForPhoneResponse) return; // 如果手机在振动/等待，暂停自动推进
    if (charIndex < (dialogues[index]?.text.length || 0)) {
      clearInterval(typingInterval);
      if (dialogText) dialogText.textContent = dialogues[index].text;
      charIndex = dialogText.textContent.length;
    } else {
      if (index < dialogues.length - 1) showDialogue(index + 1);
      else {
        // 游戏结束，显示提示而不跳转
        alert("游戏结束！");
        stopAutoPlay();
        console.log("准备跳转到主页...");
        // 使用短延时并替换历史记录，更可靠地跳转并避免产生新的历史记录记录
        setTimeout(() => {
          window.location.replace("../../index.html");
        }, 120);
      }
    }
  }, 2000);
}

function stopAutoPlay() {
  clearInterval(autoInterval);
  autoPlay = false;
  if (autoBtn) autoBtn.textContent = "自动播放";
}

// -------------------- 选择框 --------------------
function showChoices() {
  if (choiceContainer) choiceContainer.classList.remove("hidden");
  if (dialogBox) dialogBox.style.display = "none";
  clearInterval(typingInterval);
  clearInterval(autoInterval);
  isChoiceActive = true;
}

function hideChoices() {
  if (choiceContainer) choiceContainer.classList.add("hidden");
  if (dialogBox) dialogBox.style.display = "block";
  isChoiceActive = false;
}

function handleChoice(event) {
  const choice = event.currentTarget.dataset.choice;
  console.log("玩家选择了:", choice);
  hideChoices();

  if (choice === "A") {
    updateAffection('fang', affectionData.fang + 10);
    showDialogue(index + 1);
  } else if (choice === "B") {
    updateAffection('fang', affectionData.fang - 5);
    showDialogue(index + 2);
  } else {
    updateAffection('other', affectionData.other + 5);
    showDialogue(index + 3);
  }
}

// -------------------- 好感度系统 --------------------

function updateAffection(character, value) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  if (bar) {
    const text = bar.parentElement.querySelector('.affection-text');
    bar.style.width = `${affectionData[character]}%`;
    if (text) text.textContent = `${character === 'fang' ? '学姐' : '其他'}: ${affectionData[character]}%`;
  }
  
}

function initAffection() {
  const savedData = localStorage.getItem('affectionData');
  if (savedData) Object.assign(affectionData, JSON.parse(savedData));
  for (const [character, value] of Object.entries(affectionData)) updateAffection(character, value);
}

// -------------------- 绑定控制按钮 --------------------
function bindControlButtons() {
  // -------------------- 下一句按钮 --------------------
  if (nextBtn) {
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    newNextBtn.addEventListener("click", handleNext);
  }

  // -------------------- 上一句按钮 --------------------
  if (prevBtn) {
    const newPrevBtn = prevBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    newPrevBtn.addEventListener("click", handlePrev);
  }

  // -------------------- 加速按钮 --------------------
  if (speedBtn) {
    const newSpeedBtn = speedBtn.cloneNode(true);
    speedBtn.parentNode.replaceChild(newSpeedBtn, speedBtn);
    newSpeedBtn.addEventListener("click", toggleSpeed);
  }

  // -------------------- 跳过按钮 --------------------
  if (skipBtn) {
    const newSkipBtn = skipBtn.cloneNode(true);
    skipBtn.parentNode.replaceChild(newSkipBtn, skipBtn);
    newSkipBtn.addEventListener("click", handleSkip);
  }

  // -------------------- 自动播放按钮 --------------------
  if (autoBtn) {
    const newAutoBtn = autoBtn.cloneNode(true);
    autoBtn.parentNode.replaceChild(newAutoBtn, autoBtn);
    newAutoBtn.addEventListener("click", toggleAutoPlay);
  }

  // -------------------- 选择按钮 --------------------
  if (choiceBtns) {
    choiceBtns.forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", handleChoice);
    });
  }

  // -------------------- 音乐控制（使用页面上的 #bg-music） --------------------
  // 这里不再创建新的 <audio>，统一控制现有的 bgMusic（已在 DOMContentLoaded 调用初始化）
    
  // -------------------- 存档按钮 --------------------
  if (saveBtn) {
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.addEventListener("click", () => {
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
        background: bodyBg,  // 保存背景图
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

  // -------------------- 读档按钮 --------------------
  if (loadBtn) {
    const newLoadBtn = loadBtn.cloneNode(true);
    loadBtn.parentNode.replaceChild(newLoadBtn, loadBtn);
    newLoadBtn.addEventListener("click", () => window.location.href = "../../savepage/savepage2.0/save.htm");
  }
}

// -------------------- 音乐：初始化控件与联动 --------------------
function initMusicControls() {
  if (!bgMusic) return;

  // 初始音量与滑块同步
  if (volumeRange) {
    if (volumeRange.value == null || volumeRange.value === "") {
      volumeRange.value = Math.round((bgMusic.volume || 0.5) * 100);
    } else {
      // 如果滑块有默认值，用它设置音量
      const v = Math.max(0, Math.min(100, parseInt(volumeRange.value, 10)));
      bgMusic.volume = v / 100;
    }
    volumeRange.addEventListener("input", () => {
      const v = Math.max(0, Math.min(100, parseInt(volumeRange.value || "0", 10)));
      bgMusic.volume = v / 100;
    });
  }

  // 播放/暂停按钮
  if (musicBtn) {
    // 设置初始文案，未播放时显示“音乐播放”
    updateMusicButtonText();
    musicBtn.addEventListener("click", async () => {
      if (!bgMusic) return;
      try {
        if (bgMusic.paused) {
          await bgMusic.play();
        } else {
          bgMusic.pause();
        }
      } catch (_) {
        // 忽略
      } finally {
        updateMusicButtonText();
      }
    });
  }

  // 根据播放状态更新按钮文案
  bgMusic.addEventListener("play", updateMusicButtonText);
  bgMusic.addEventListener("pause", updateMusicButtonText);
}

function updateMusicButtonText() {
  if (!musicBtn || !bgMusic) return;
  musicBtn.textContent = bgMusic.paused ? "音乐播放" : "音乐暂停";
}

// -------------------- 音乐：自动播放 + 用户手势回退 --------------------
function tryAutoPlayMusic() {
  if (!bgMusic) return;
  // 若浏览器支持自动播放，这里会直接播放；否则会抛出或被拒绝
  const attempt = () => bgMusic.play().catch(() => { /* 静默失败，等待手势 */ });
  attempt();

  // 第一次用户交互后再尝试播放一次
  const onFirstGesture = async () => {
    document.removeEventListener("click", onFirstGesture, true);
    document.removeEventListener("keydown", onFirstGesture, true);
    document.removeEventListener("touchstart", onFirstGesture, true);
    try { await bgMusic.play(); } catch (_) { /* 忽略 */ }
  };
  document.addEventListener("click", onFirstGesture, true);
  document.addEventListener("keydown", onFirstGesture, true);
  document.addEventListener("touchstart", onFirstGesture, true);
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

// -------------------- 自动存档 --------------------
function autoSave() {
  const saveIndex = (choiceContainer && !choiceContainer.classList.contains("hidden")) ? 3 : index;
  const saveData = {
    page: "storyPage1",
    dialogueIndex: saveIndex,
    charIndex: charIndex,
    background: bodyBg,
    timestamp: Date.now()
  };
  let saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));

  if (autoSaveNotice) {
    autoSaveNotice.classList.remove("hidden");
    autoSaveNotice.classList.add("show");

    setTimeout(() => {
      autoSaveNotice.classList.remove("show");
      autoSaveNotice.classList.add("hidden");
    }, 1500);
  }
}

// -------------------- 空格和点击触发下一句 --------------------
// 空格键触发下一句
// 防止空格长按连续触发：keydown 只在第一次按下时触发，keyup 重置标志
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !isChoiceActive) {
    e.preventDefault();
    if (spaceDown) return; // 已按下，忽略重复 keydown
    spaceDown = true;
    if (!waitingForPhoneResponse) handleNext();
  }
});

// 松开空格时重置标志，允许下一次触发
window.addEventListener('keyup', (e) => {
  if (e.code === 'Space') spaceDown = false;
});

// 鼠标点击触发下一句
window.addEventListener('click', (e) => {
  // 仅响应左键 (通常是主按钮)，并且在选择框未激活时才处理
  if (e instanceof MouseEvent && e.button !== 0) return;

  // 避免在输入框、按钮、侧边栏或聊天输入处触发
  const target = e.target;
  const interactive = target.closest && (
    target.closest('button') ||
    target.closest('input') ||
    target.closest('a') ||
    target.closest('#sidebar') ||
    target.closest('.chat-input') ||
    target.closest('.choice-btn')
  );

  if (isChoiceActive || interactive) return;
  if (waitingForPhoneResponse) return; // 手机振动/等待时暂停点击推进

  // 如果当前对话还在打字中，则点击只显示完整文本；否则推进下一句
  const curTextLen = dialogues[index]?.text?.length || 0;
  if (charIndex < curTextLen) {
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = curTextLen;
    // 不推进下一句，也不触发自动播放停止（保留原行为）
    return;
  }

  // 对话已显示完整，推进下一句
  handleNext();
});
// 可选：主菜单按钮也加淡出动画
const mainMenuBtn = document.getElementById("main-menu-btn");
mainMenuBtn.addEventListener("click", () => {
  document.body.classList.remove("fade-in");
  document.body.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = "../../index.html";
  }, 500);
});
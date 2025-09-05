// -------------------- DOMContentLoaded 初始化 --------------------

// -------------------- DOM 元素获取函数 --------------------
let dialogText, nameBox, characterAvatar, avatarContainer;
let nextBtn, prevBtn, speedBtn, skipBtn, autoBtn;
let musicBtn, bgMusic, volumeRange;
let sidebar, toggleBtn;
let autoSaveNotice, saveBtn, loadBtn;
let choiceContainer, choiceBtns, dialogBox;

function getDomElements() {
  dialogText = document.getElementById("dialog-text");
  nameBox = document.querySelector(".character-name");
  characterAvatar = document.getElementById("character-avatar");
  avatarContainer = document.querySelector(".character-avatar");
  nextBtn = document.getElementById("next-btn");
  prevBtn = document.getElementById("prev-btn");
  speedBtn = document.getElementById("speed-btn");
  skipBtn = document.getElementById("skip-btn");
  autoBtn = document.getElementById("auto-btn");
  musicBtn = document.getElementById("music-btn");
  bgMusic = document.getElementById("bg-music");
  volumeRange = document.getElementById("volume-range");
  sidebar = document.getElementById("sidebar");
  toggleBtn = document.getElementById("sidebar-toggle");
  autoSaveNotice = document.getElementById("auto-save-notice");
  saveBtn = document.getElementById("save-btn");
  loadBtn = document.getElementById("load-btn");
  choiceContainer = document.getElementById("choice-container");
  choiceBtns = document.querySelectorAll(".choice-btn");
  dialogBox = document.querySelector(".dialog-box");
}

function isPhoneChatOpen() {
  // 兼容 phone.js
  if (window.phoneOpen) return true;
  const phoneChat = document.getElementById('phone-chat-interface');
  if (!phoneChat) return false;
  const style = window.getComputedStyle(phoneChat);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

// -------------------- 状态变量 --------------------
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;

let autoPlay = false;
let autoInterval = null;
let isFast = false;

// 等待物品交互的状态
let waitingForItem = false;
// 游戏是否处于激活状态（可以继续推进）
let isGameActive = true;
// 选择框是否处于激活状态
let isChoiceActive = false;

// -------------------- 剧情台词 --------------------
const dialogues = [
  { name: "A", text: "怔然的看着我 嘴唇颤抖了一下" },
  { name: "A", text: "“不是已经约定好要走了吗 可不能反悔啊 你不是也说好相信我能成功的吗？”" },
  { name: "B", text: "“看着眼前几近落泪的学姐 已经全然没有了平时的学姐架子 柔美的面容在泪水的映衬下更加显得复杂 我鬼使神差般得更加用力地握住了学姐的手”" },
  { name: "A", text: "“为什么 你还是不相信我一个人能取得成绩吗？”她试着抽出自己的手”" },
  { name: "A", text: "你看着学姐在夕阳照射下泛红的双眼 从前的自信是什么时候消失的呢？ 这时候 体育馆中学姐那幅痛苦的脸庞再次在你脑海中浮现" },
  { name: "B", text: "“这可能只是我的私心…我无论如何都想陪在你的身边”" },
  { name: "B", text: "“我不想你再一个人痛苦 就让我来分担吧”" },
  { name: "B", text: "“我会为我的这一份私心奉献我的一切的 就让我陪着你走过这段通往顶峰的道路吧 就在这个最熟悉不过的地方”" },
  { name: "B", text: "“留下来吧…”" },
  { name: "A", text: " 学姐仰起头 注视着你的双眼 如水般温柔的目光中仿佛在寻找着什么" },
  { name: "A", text: "许久 脸上重新浮现出笑容 将手慢慢的抽回 向我挥了挥手" },
  { name: "B", text: "我看着她远去的身影 还想说些什么 或是做些什么 但却又无从开口 只能看着学姐逐渐远去 或许 我还不够成为她留下的理由吧" },
  { name: "C", text: "学姐的车渐渐远去 徒留下你呆站在原地 " }, // TODO: （手机振动）
  { name: "C", text: "此刻 晚霞格外恢弘" },
];

// 确保window.phoneModule存在
window.phoneModule = window.phoneModule || {};

// -------------------- 打字机效果 --------------------
function typeText(text, callback) {
  clearInterval(typingInterval);
  charIndex = 0;
  dialogText.textContent = "";

  typingInterval = setInterval(() => {
    if (dialogText) {
      dialogText.textContent += text[charIndex];
      charIndex++;
      if (charIndex >= text.length) {
        clearInterval(typingInterval);
        if (callback) callback();
      }
    }
  }, typingSpeed);
}

// -------------------- 显示对话 --------------------
function showDialogue(idx) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;

  // 获取当前对话的名称
  let currentName = dialogues[index].name;
  let displayName = currentName;
  
  // 根据name值修改显示名称和头像
  if (currentName === 'C') {
    // 旁白：隐藏头像
    displayName = '旁白';
    if (avatarContainer) avatarContainer.style.display = 'none';
  } else if (currentName === 'B') {
    // 主角：显示男主头像
    displayName = '主角';
    if (characterAvatar) {
      characterAvatar.src = '../../男主.png';
      characterAvatar.alt = '主角头像';
    }
    if (avatarContainer) avatarContainer.style.display = 'block';
  } else if (currentName === 'A' || currentName.includes('学姐')) {
    // 学姐：显示学姐头像
    displayName = '学姐';
    if (characterAvatar) {
      characterAvatar.src = '../../学姐.png';
      characterAvatar.alt = '学姐头像';
    }
    if (avatarContainer) avatarContainer.style.display = 'block';
  } else {
    // 其他角色：隐藏头像
    if (avatarContainer) avatarContainer.style.display = 'none';
  }
  
  // 更新显示名称
  if (nameBox) nameBox.textContent = displayName;

  // 检查是否需要触发手机振动
  if (index === 12) {
    // 设置对话文本
    if (dialogText) {
      dialogText.textContent = '学姐的车渐渐远去 徒留下你呆站在原地';
      charIndex = dialogText.textContent.length;
    }
    
    // 触发手机振动
    if (window.phoneModule && window.phoneModule.makePhoneVibrate) {
      window.phoneModule.makePhoneVibrate();
      waitingForItem = true;
      if (window.phoneModule) {
        window.phoneModule.waitingForPhoneResponse = true;
      }
    }
    
    // 强制停止打字效果
    clearInterval(typingInterval);
    return;
  }

  if (dialogText) {
    typeText(dialogues[index].text, () => {
      // 如果台词有选择框逻辑
      if (index === 999 && choiceContainer) setTimeout(showChoices, 500);
    });
  }
}

// -------------------- 下一句按钮 --------------------
function handleNext() {
  // 检查是否处于等待手机响应状态
  if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) {
    return; // 不执行任何操作，直到用户点击手机
  }
  
  if (charIndex < dialogues[index].text.length) {
    // 打字机未打完，直接显示完整文字
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
  } else {
    if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else {
      // 最后一条台词淡出跳转
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../storypage2.0 与学姐好感度足够  1选择了1 4/storypage.html";
      }, 1000);
    }
  }
  stopAutoPlay();
}

// -------------------- 上一句按钮 --------------------
function handlePrev() {
  showDialogue(index - 1);
  stopAutoPlay();
}

// -------------------- 加速按钮 --------------------
function toggleSpeed() {
  isFast = !isFast;
  typingSpeed = isFast ? 10 : 50;
  if (speedBtn) speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
}

// -------------------- 跳过按钮 --------------------
function handleSkip() {
  clearInterval(typingInterval);
  if (dialogText) dialogText.textContent = dialogues[index].text;
  stopAutoPlay();
}

// -------------------- 自动播放按钮 --------------------
function toggleAutoPlay() {
  // 如果处于等待手机响应状态，不允许开启自动播放
  if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) {
    return;
  }
  
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
    // 检查是否处于等待手机响应状态
    if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) {
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

function stopAutoPlay() {
  clearInterval(autoInterval);
  autoPlay = false;
  if (autoBtn) autoBtn.textContent = "自动播放";
}

// -------------------- 选择框 ------------------------
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

  // 更新好感度
  if (choice === "A") updateAffection('fang', affectionData.fang + 10);
  else if (choice === "B") updateAffection('fang', affectionData.fang - 5);
  else updateAffection('other', affectionData.other + 5);

  // 显示对应对话
  if (choice === "A") showDialogue(index + 1);
  else if (choice === "B") showDialogue(index + 2);
  else showDialogue(index + 3);
}

// -------------------- 好感度系统 --------------------
const affectionData = { fang: 50, other: 30 };

function updateAffection(character, value) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  if (bar) {
    bar.style.width = `${affectionData[character]}%`;
    const text = bar.parentElement.querySelector('.affection-text');
    if (text) text.textContent = `${character === 'fang' ? '芳乃' : '其他'}: ${affectionData[character]}%`;
  }

  localStorage.setItem('affectionData', JSON.stringify(affectionData));
}

function initAffection() {
  const savedData = localStorage.getItem('affectionData');
  if (savedData) Object.assign(affectionData, JSON.parse(savedData));
  for (const [character, value] of Object.entries(affectionData)) updateAffection(character, value);
}

// -------------------- 音乐控制 --------------------
if (volumeRange) {
  volumeRange.addEventListener("input", () => {
    if (bgMusic) bgMusic.volume = volumeRange.value / 100;
  });
}

if (musicBtn) {
  musicBtn.addEventListener("click", () => {
    if (bgMusic) {
      if (bgMusic.paused) {
        bgMusic.play();
        musicBtn.textContent = "音乐暂停";
      } else {
        bgMusic.pause();
        musicBtn.textContent = "音乐播放";
      }
    }
  });
}

// -------------------- 侧边栏控制 --------------------
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    if (sidebar) sidebar.classList.toggle("show");
  });
}

// -------------------- 自动存档 --------------------
function autoSave() {
  const saveIndex = choiceContainer && !choiceContainer.classList.contains("hidden") ? 3 : index;
  const saveData = { page: "storyPage1", dialogueIndex: saveIndex, charIndex, timestamp: Date.now() };
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

// -------------------- 存档 & 读档 --------------------
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    const saveIndex = choiceContainer && !choiceContainer.classList.contains("hidden") ? 3 : index;
    const saveData = { page: "storyPage1", dialogueIndex: saveIndex, charIndex, timestamp: Date.now() };
    let saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
    saves.push(saveData);
    localStorage.setItem("storySaves", JSON.stringify(saves));
    alert("已存档！");
  });
}

if (loadBtn) {
  loadBtn.addEventListener("click", () => window.location.href = "load.html");
}

// -------------------- 绑定按钮 --------------------
function bindControlButtons() {
  if (nextBtn) nextBtn.addEventListener("click", function() { if (!window.phoneOpen) handleNext(); });
  if (prevBtn) prevBtn.addEventListener("click", function() { if (!window.phoneOpen) handlePrev(); });
  if (speedBtn) speedBtn.addEventListener("click", function() { if (!window.phoneOpen) toggleSpeed(); });
  if (skipBtn) skipBtn.addEventListener("click", function() { if (!window.phoneOpen) handleSkip(); });
  if (autoBtn) autoBtn.addEventListener("click", function() { if (!window.phoneOpen) toggleAutoPlay(); });
  if (choiceBtns && choiceBtns.forEach) choiceBtns.forEach(btn => btn.addEventListener("click", function(e) { if (!window.phoneOpen) handleChoice(e); }));
}

function bindScreenClick() {
  document.body.addEventListener('click', function(event) {
    if (window.phoneOpen) return;
    if (!event.target.closest('.choice-btn') && 
        !event.target.closest('.control-images') &&
        !event.target.closest('#sidebar') &&
        !event.target.closest('#sidebar-toggle')) {
      handleNext();
    }
  });
  // 空格键推进剧情
  document.addEventListener('keydown', function(e) {
    if (window.phoneOpen) return;
    if (e.code === 'Space' && !e.repeat) {
      handleNext();
    }
  });
}

// -------------------- 空格和点击触发下一句 --------------------
// 空格键触发下一句
window.addEventListener('keydown', (e) => {
  // 只有在空格键被按下且选择框未激活且未打开phone界面时才触发
  if (e.code === 'Space' && !isChoiceActive && isGameActive && !(window.phoneModule && window.phoneModule.waitingForPhoneResponse) && !isPhoneChatOpen()) {
    e.preventDefault(); // 阻止默认行为，避免页面滚动
    if (typeof handleNext === 'function') {
      handleNext();
    } else if (nextBtn) {
      nextBtn.click();
    }
  }
});

// 鼠标点击触发下一句
window.addEventListener('click', (e) => {
  // 只有在选择框未激活且未打开phone界面且点击的不是按钮等交互元素时才触发
  if (!isChoiceActive && 
      !e.target.closest('button') && 
      !e.target.closest('input') && 
      !e.target.closest('#sidebar') && 
      !e.target.closest('#chat-input') && 
      isGameActive && !(window.phoneModule && window.phoneModule.waitingForPhoneResponse) && !isPhoneChatOpen()) {
    if (typeof handleNext === 'function') {
      handleNext();
    } else if (nextBtn) {
      nextBtn.click();
    }
  }
});

// -------------------- 手机响应处理 --------------------
// 添加最后的消息到聊天记录并继续游戏
window.phoneModule.addFinalMessageToChat = function() {
  if (!window.phoneModule.hasReceivedFinalMessage) {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      // 第一条消息 - 学姐发送
      const message1 = document.createElement('div');
      message1.classList.add('chat-message', 'received');
      message1.innerHTML = `<div class="message-bubble">毕竟是工作上的大事 不能很快的做决定 等我的好消息哦（颜文字：开心）</div>`;
      chatMessages.appendChild(message1);
      
      // 第二条消息 - 学姐发送
      const message2 = document.createElement('div');
      message2.classList.add('chat-message', 'received');
      message2.innerHTML = `<div class="message-bubble">我会一直相信你的 可不能反悔哦</div>`;
      chatMessages.appendChild(message2);
      
      // 滚动到底部
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      window.phoneModule.hasReceivedFinalMessage = true;
      
      // 3秒后关闭聊天界面并继续剧情
      setTimeout(() => {
        if (window.phoneModule.closeChatInterface) {
          window.phoneModule.closeChatInterface();
        }
        
        // 继续剧情
        if (typeof showDialogue === 'function') {
          showDialogue(index + 1);
        }
        
        // 重置状态
        waitingForItem = false;
        isGameActive = true;
        
      }, 3000);
    }
  }
};

// 处理手机响应（如果需要覆盖默认实现）
window.phoneModule.handlePhoneResponse = function() {
  const { phoneImage, phoneNotification } = window.phoneModule;
  
  // 移除震动效果和通知
  if (phoneImage) {
    phoneImage.classList.remove('phone-vibrating');
    if (phoneNotification && phoneImage.contains(phoneNotification)) {
      phoneImage.removeChild(phoneNotification);
    }
  }
  
  // 添加最后的消息到聊天记录
  window.phoneModule.addFinalMessageToChat();
  
  // 自动打开聊天界面
  if (window.phoneModule.openChatInterface) {
    window.phoneModule.openChatInterface();
  }
  
  // 重置等待手机响应的状态
  window.phoneModule.waitingForPhoneResponse = false;
};

// -------------------- DOMContentLoaded 初始化（结构优化，自动显示剧情） --------------------
document.addEventListener("DOMContentLoaded", function() {
  function allDomReady() {
    getDomElements();
    return dialogText && nameBox && characterAvatar && avatarContainer && nextBtn && prevBtn && speedBtn && skipBtn && autoBtn;
  }
  function safeInit() {
    if (!allDomReady()) {
      setTimeout(safeInit, 30);
      return;
    }
    document.body.classList.add("fade-in");
    if (typeof initAffection === 'function') initAffection();
    if (window.phoneModule && typeof window.phoneModule.initPhoneElements === 'function') window.phoneModule.initPhoneElements();
    if (window.phoneModule && typeof window.phoneModule.initPhoneChat === 'function') window.phoneModule.initPhoneChat();
    showDialogue(0); // 页面加载后立即显示剧情
    bindControlButtons();
    bindScreenClick();
  }
  safeInit();
});
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
  
  // 初始化头像显示
  if (avatarContainer && characterAvatar) {
    // 初始隐藏头像，等待剧情显示时设置
    avatarContainer.style.display = 'none';
    
    // 预加载头像图片
    const preloadImages = () => {
      const images = [
        '../../学姐.png',
        '../../男主.png'
      ];
      
      images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };
    
    preloadImages();
  }
});

// -------------------- 剧情控制 --------------------
const dialogues = [
  { name: "C", text: "将自己真实的感受和盘托出 毫不吝啬的夸奖着学姐" },
  { name: "C", text: "“好了好了 我知道了！！不要再说啦！！！” 学姐脸上泛起了抹抹红晕 好像被你夸奖的娇羞不已 学姐的架子荡然无存" },
  { name: "A", text: "你露出一种阴谋得逞的微笑 注视着面前娇羞的学姐" },
  { name: "A", text: "“你是个坏人！！” 说着 跑进了水族馆" },
  { name: "B", text: "你赶忙追上去 一同进入了水族馆" }
];

// -------------------- DOM --------------------
const dialogText = document.getElementById("dialog-text");
const nameBox = document.querySelector(".character-name");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const speedBtn = document.getElementById("speed-btn");
const skipBtn = document.getElementById("skip-btn");
const autoBtn = document.getElementById("auto-btn");
const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");
const musicBtn = document.getElementById("music-btn");
const bgMusic = document.getElementById("bg-music");
const volumeRange = document.getElementById("volume-range");
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");
const autoSaveNotice = document.getElementById("auto-save-notice");
const choiceContainer = document.getElementById("choice-container");
const choiceBtns = document.querySelectorAll(".choice-btn");
const dialogBox = document.querySelector(".dialog-box");
const avatarContainer = document.querySelector(".character-avatar-container");
const characterAvatar = document.querySelector(".character-avatar");

// -------------------- 状态 --------------------
let index = 0, charIndex = 0, typingSpeed = 50, typingInterval = null;
let autoPlay = false, autoInterval = null, isFast = false;
let isChoiceActive = false; // 标记选择是否激活
let waitingForItem = false; // 等待物品交互的状态
let isGameActive = true; // 游戏是否处于激活状态（可以继续推进）

const affectionData = { fang: 50, other: 30 };

// -------------------- 打字机效果 --------------------
function typeText(text, callback) {
  clearInterval(typingInterval);
  charIndex = 0;
  dialogText.textContent = "";
  typingInterval = setInterval(() => {
    dialogText.textContent += text[charIndex++];
    if (charIndex >= text.length) {
      clearInterval(typingInterval);
      if (callback) callback();
    }
  }, typingSpeed);
}

// -------------------- 剧情显示 --------------------
function showDialogue(idx) {
  // 检查是否处于等待手机响应状态
  if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) {
    return; // 不执行任何操作，直到用户点击手机
  }
  
  index = Math.max(0, Math.min(idx, dialogues.length - 1));
  
  // 根据name值修改显示名称和头像
  let currentName = dialogues[index].name;
  let displayName = currentName;
  
  // 根据name值修改显示名称和头像
  if (currentName === 'C') {
    // 旁白：隐藏头像
    displayName = '旁白';
    avatarContainer.style.display = 'none';
  } else if (currentName === 'B') {
    // 主角：显示男主头像
    displayName = '主角';
    characterAvatar.src = '../../男主.png';
    characterAvatar.alt = '主角头像';
    avatarContainer.style.display = 'block';
  } else if (currentName === 'A' || currentName.includes('学姐')) {
    // 学姐：显示学姐头像
    displayName = '学姐';
    characterAvatar.src = '../../学姐.png';
    characterAvatar.alt = '学姐头像';
    avatarContainer.style.display = 'block';
  } else {
    // 其他角色：隐藏头像
    avatarContainer.style.display = 'none';
  }
  
  // 更新显示名称
  nameBox.textContent = displayName;

  typeText(dialogues[index].text, () => {
    if (index === 999) autoSave(); // 特殊台词触发存档/选择框
  });
}

// -------------------- 按钮事件 --------------------
function handleNext() {
  // 检查是否处于等待手机响应状态
  if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) {
    return; // 不执行任何操作，直到用户点击手机
  }
  
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
  } else if (index < dialogues.length - 1) {
    showDialogue(index + 1);
  } else {
    document.body.classList.add("fade-out");
    setTimeout(() => window.location.href = "../storypage2.0 与学姐好感度足够  2选择了2 2/storypage.html", 1000);
  }
  stopAutoPlay();
}

nextBtn.addEventListener("click", handleNext);

prevBtn.addEventListener("click", () => { showDialogue(index - 1); stopAutoPlay(); });
speedBtn.addEventListener("click", () => { isFast = !isFast; typingSpeed = isFast ? 10 : 50; speedBtn.textContent = isFast ? "原速" : "加速"; showDialogue(index); });
skipBtn.addEventListener("click", () => { clearInterval(typingInterval); dialogText.textContent = dialogues[index].text; stopAutoPlay(); });
autoBtn.addEventListener("click", () => { autoPlay = !autoPlay; autoPlay ? (autoBtn.textContent = "停止自动", startAutoPlay()) : stopAutoPlay(); });

// -------------------- 自动播放 --------------------
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
      dialogText.textContent = dialogues[index].text;
      charIndex = dialogues[index].text.length;
    } else if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else stopAutoPlay();
  }, 2000);
}
function stopAutoPlay() { clearInterval(autoInterval); autoPlay = false; autoBtn.textContent = "自动播放"; }

// -------------------- 音乐 --------------------
volumeRange.addEventListener("input", () => bgMusic.volume = volumeRange.value / 100);
musicBtn.addEventListener("click", () => {
  if (bgMusic.paused) { bgMusic.play(); musicBtn.textContent = "音乐暂停"; } 
  else { bgMusic.pause(); musicBtn.textContent = "音乐播放"; }
});

// -------------------- 侧边栏 --------------------
toggleBtn.addEventListener("click", () => sidebar.classList.toggle("show"));

// -------------------- 存档 --------------------
function saveGame() {
  const saveIndex = choiceContainer.classList.contains("hidden") ? index : 3;
  const saveData = { page: "storyPage1", dialogueIndex: saveIndex, charIndex, timestamp: Date.now() };
  const saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));
  autoSaveNotice && (autoSaveNotice.classList.add("show"), setTimeout(() => autoSaveNotice.classList.remove("show"), 1500));
}

saveBtn.addEventListener("click", () => { saveGame(); alert("已存档！"); });
loadBtn.addEventListener("click", () => window.location.href = "load.html");

// -------------------- 选择框 --------------------
function showChoices() { choiceContainer.classList.remove("hidden"); dialogBox.style.display = "none"; clearInterval(typingInterval); clearInterval(autoInterval); isChoiceActive = true; }
function hideChoices() { choiceContainer.classList.add("hidden"); dialogBox.style.display = "block"; isChoiceActive = false; }

choiceBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const choice = btn.dataset.choice;
    console.log("玩家选择了:", choice);
    hideChoices();

    // 好感度变化
    if (choice === "A") updateAffection('fang', affectionData.fang + 10, index + 1);
    else if (choice === "B") updateAffection('fang', affectionData.fang - 5, index + 2);
    else updateAffection('other', affectionData.other + 5, index + 3);
  });
});

// -------------------- 好感度 --------------------
function updateAffection(character, value, nextIdx) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  const text = bar.parentElement.querySelector('.affection-text');
  bar.style.width = `${affectionData[character]}%`;
  text.textContent = `${character === 'fang' ? '芳乃' : '其他'}: ${affectionData[character]}%`;
  localStorage.setItem('affectionData', JSON.stringify(affectionData));
  showDialogue(nextIdx);
}

function initAffection() {
  const saved = localStorage.getItem('affectionData');
  if (saved) Object.assign(affectionData, JSON.parse(saved));
  Object.entries(affectionData).forEach(([character, val]) => updateAffection(character, val, index));
}

// -------------------- 空格和点击触发下一句 --------------------
// 空格键触发下一句
window.addEventListener('keydown', (e) => {
  // 只有在空格键被按下且选择框未激活时才触发
  if (e.code === 'Space' && !isChoiceActive && isGameActive) {
    e.preventDefault(); // 阻止默认行为，避免页面滚动
    // 检查是否处于等待手机响应状态
    if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) {
      return; // 不执行任何操作，直到用户点击手机
    }
    // 模拟下一句按钮点击
    if (typeof handleNext === 'function') {
      handleNext();
    } else {
      nextBtn.click();
    }
  }
});

// 鼠标点击触发下一句
window.addEventListener('click', (e) => {
  // 只有在选择框未激活且点击的不是按钮等交互元素时才触发
  if (!isChoiceActive && 
      !e.target.closest('button') && 
      !e.target.closest('input') && 
      !e.target.closest('#sidebar') && 
      !e.target.closest('#chat-input') && 
      isGameActive) {
    // 检查是否处于等待手机响应状态
    if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) {
      return; // 不执行任何操作，直到用户点击手机
    }
    // 模拟下一句按钮点击
    if (typeof handleNext === 'function') {
      handleNext();
    } else {
      nextBtn.click();
    }
  }
});

// -------------------- 初始化 --------------------
// 初始化手机模块（如果存在）
if (window.phoneModule && typeof window.phoneModule.initPhoneElements === 'function') {
  window.phoneModule.initPhoneElements();
}

// 确保window.phoneModule存在
window.phoneModule = window.phoneModule || {};

initAffection();
showDialogue(0);

// -------------------- 手机响应处理 --------------------
// 添加最后的消息到聊天记录并继续游戏
window.phoneModule.addFinalMessageToChat = function() {
  if (!window.phoneModule.hasReceivedFinalMessage) {
    // 添加两条特定消息
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
        if (window.showDialogue) {
          window.showDialogue(index + 1);
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
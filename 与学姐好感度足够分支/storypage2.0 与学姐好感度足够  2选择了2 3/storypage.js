// -------------------- DOM 元素 --------------------
const dialogText = document.getElementById("dialog-text");
const nameBox = document.querySelector(".character-name");
const avatarContainer = document.querySelector(".character-avatar-container");
const characterAvatar = document.querySelector(".character-avatar");

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

// -------------------- 状态变量 --------------------
let index = 0, charIndex = 0, typingSpeed = 50, typingInterval = null;
let autoPlay = false, autoInterval = null, isFast = false;
let isChoiceActive = false;
let waitingForItem = false;
let isGameActive = true;

const affectionData = { fang: 50, other: 30 };

// -------------------- 剧情台词 --------------------
const dialogues = [
  { name: "A", text: "“sakana~”她向前伸出双手 单脚站在地上 像是在模仿水箱中游荡的鱼儿" },
  { name: "B", text: "在你不知所措时 却看到她注视着你 似乎想让你也加入其中" },
];

// -------------------- 打字机效果 --------------------
function typeText(text, callback) {
  clearInterval(typingInterval);
  charIndex = 0;
  if (dialogText) dialogText.textContent = "";
  
  typingInterval = setInterval(() => {
    if (dialogText && charIndex < text.length) {
      dialogText.textContent += text[charIndex++];
      if (charIndex >= text.length) {
        clearInterval(typingInterval);
        if (callback) callback();
      }
    }
  }, typingSpeed);
}

// -------------------- 显示某条对话 --------------------
function showDialogue(idx) {
  // 检查是否处于等待手机响应状态
  if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) {
    return;
  }
  
  index = Math.max(0, Math.min(idx, dialogues.length - 1));
  
  // 根据name值修改显示名称和头像
  let currentName = dialogues[index].name;
  let displayName = currentName;
  
  if (currentName === 'C') {
    displayName = '旁白';
    if (avatarContainer) avatarContainer.style.display = 'none';
  } else if (currentName === 'B') {
    displayName = '主角';
    if (characterAvatar) {
      characterAvatar.src = '../../男主.png';
      characterAvatar.alt = '主角头像';
    }
    if (avatarContainer) avatarContainer.style.display = 'block';
  } else if (currentName === 'A' || currentName.includes('学姐')) {
    displayName = '学姐';
    if (characterAvatar) {
      characterAvatar.src = '../../学姐.png';
      characterAvatar.alt = '学姐头像';
    }
    if (avatarContainer) avatarContainer.style.display = 'block';
  } else {
    if (avatarContainer) avatarContainer.style.display = 'none';
  }
  
  if (nameBox) nameBox.textContent = displayName;

  typeText(dialogues[index].text, () => {
    if (index === 1) {
      updateAffection('fang', affectionData.fang + 10);
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../storypage2.0 与学姐好感度足够  3选择了1 1/storypage.html";
      }, 1000);
    }
  });
}

// -------------------- 下一句/上一句/加速/跳过/自动播放 --------------------
function handleNext() {
  if ((window.phoneModule && window.phoneModule.waitingForPhoneResponse) || window.phoneOpen) {
    return;
  }
  
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
  } else if (index < dialogues.length - 1) {
    showDialogue(index + 1);
  } else {
    updateAffection('fang', affectionData.fang + 10);
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "../storypage2.0 与学姐好感度足够  3选择了1 1/storypage.html";
    }, 1000);
  }
  stopAutoPlay();
}

function handlePrev() {
  showDialogue(index - 1);
  stopAutoPlay();
}

function toggleSpeed() {
  isFast = !isFast;
  typingSpeed = isFast ? 10 : 50;
  if (speedBtn) speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
}

function handleSkip() {
  clearInterval(typingInterval);
  if (dialogText) dialogText.textContent = dialogues[index].text;
  stopAutoPlay();
}

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
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      if (dialogText) dialogText.textContent = dialogues[index].text;
      charIndex = dialogues[index].text.length;
    } else if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else stopAutoPlay();
  }, 2000);
}

function stopAutoPlay() {
  clearInterval(autoInterval);
  autoPlay = false;
  if (autoBtn) autoBtn.textContent = "自动播放";
}

// -------------------- 音乐 --------------------
if (volumeRange && bgMusic) {
  volumeRange.addEventListener("input", () => {
    if (bgMusic) bgMusic.volume = volumeRange.value / 100;
  });
}

if (musicBtn && bgMusic) {
  musicBtn.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play();
      if (musicBtn) musicBtn.textContent = "音乐暂停";
    } else {
      bgMusic.pause();
      if (musicBtn) musicBtn.textContent = "音乐播放";
    }
  });
}

// -------------------- 侧边栏 --------------------
if (toggleBtn && sidebar) {
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });
}

// -------------------- 存档/读档 --------------------
function saveGame() {
  const saveIndex = choiceContainer && !choiceContainer.classList.contains("hidden") ? 3 : index;
  const saveData = { page: "storyPage1", dialogueIndex: saveIndex, charIndex, timestamp: Date.now() };
  const saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));
  
  if (autoSaveNotice) {
    autoSaveNotice.classList.add("show");
    setTimeout(() => autoSaveNotice.classList.remove("show"), 1500);
  }
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
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "../storypage2.0 与学姐好感度足够  3选择了1 1/storypage.html";
    }, 1000);
  } else if (choice === "B") updateAffection('fang', affectionData.fang - 5, index + 2);
  else updateAffection('other', affectionData.other + 5, index + 3);
}

if (choiceBtns && choiceBtns.forEach) {
  choiceBtns.forEach(btn => btn.addEventListener("click", handleChoice));
}

// -------------------- 好感度 --------------------
function updateAffection(character, value, nextIdx) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  if (bar) {
    bar.style.width = `${affectionData[character]}%`;
    const text = bar.parentElement.querySelector('.affection-text');
    if (text) text.textContent = `${character === 'fang' ? '芳乃' : '其他'}: ${affectionData[character]}%`;
  }
  localStorage.setItem('affectionData', JSON.stringify(affectionData));
  if (nextIdx !== undefined) showDialogue(nextIdx);
}

function initAffection() {
  const saved = localStorage.getItem('affectionData');
  if (saved) Object.assign(affectionData, JSON.parse(saved));
  Object.entries(affectionData).forEach(([char, val]) => updateAffection(char, val));
}

// -------------------- 绑定控制按钮 --------------------
function bindControlButtons() {
  if (nextBtn) nextBtn.addEventListener("click", function() { 
    if (!window.phoneOpen) handleNext(); 
  });
  
  if (prevBtn) prevBtn.addEventListener("click", function() { 
    if (!window.phoneOpen) handlePrev(); 
  });
  
  if (speedBtn) speedBtn.addEventListener("click", function() { 
    if (!window.phoneOpen) toggleSpeed(); 
  });
  
  if (skipBtn) skipBtn.addEventListener("click", function() { 
    if (!window.phoneOpen) handleSkip(); 
  });
  
  if (autoBtn) autoBtn.addEventListener("click", function() { 
    if (!window.phoneOpen) toggleAutoPlay(); 
  });
  
  // 空格键触发下一句
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isChoiceActive && isGameActive && !window.phoneOpen) {
      e.preventDefault();
      if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) {
        return;
      }
      handleNext();
    }
  });
  
  // 鼠标点击触发下一句
  window.addEventListener('click', (e) => {
    if (!isChoiceActive && 
        !e.target.closest('button') && 
        !e.target.closest('input') && 
        !e.target.closest('#sidebar') && 
        !e.target.closest('#chat-input') && 
        isGameActive && !window.phoneOpen) {
      if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) {
        return;
      }
      handleNext();
    }
  });
}

// -------------------- 手机响应处理 --------------------
window.phoneModule = window.phoneModule || {};

window.phoneModule.addFinalMessageToChat = function() {
  if (!window.phoneModule.hasReceivedFinalMessage) {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      const message1 = document.createElement('div');
      message1.classList.add('chat-message', 'received');
      message1.innerHTML = `<div class="message-bubble">毕竟是工作上的大事 不能很快的做决定 等我的好消息哦（颜文字：开心）</div>`;
      chatMessages.appendChild(message1);
      
      const message2 = document.createElement('div');
      message2.classList.add('chat-message', 'received');
      message2.innerHTML = `<div class="message-bubble">我会一直相信你的 可不能反悔哦</div>`;
      chatMessages.appendChild(message2);
      
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      window.phoneModule.hasReceivedFinalMessage = true;
      
      setTimeout(() => {
        if (window.phoneModule.closeChatInterface) {
          window.phoneModule.closeChatInterface();
        }
        
        if (window.showDialogue) {
          window.showDialogue(index + 1);
        }
        
        waitingForItem = false;
        isGameActive = true;
      }, 3000);
    }
  }
};

window.phoneModule.handlePhoneResponse = function() {
  const { phoneImage, phoneNotification } = window.phoneModule;
  
  if (phoneImage) {
    phoneImage.classList.remove('phone-vibrating');
    if (phoneNotification && phoneImage.contains(phoneNotification)) {
      phoneImage.removeChild(phoneNotification);
    }
  }
  
  window.phoneModule.addFinalMessageToChat();
  
  if (window.phoneModule.openChatInterface) {
    window.phoneModule.openChatInterface();
  }
  
  window.phoneModule.waitingForPhoneResponse = false;
};

// -------------------- DOMContentLoaded 初始化 --------------------
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");

  // 初始化头像显示
  if (avatarContainer && characterAvatar) {
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

  // 初始化好感度显示
  initAffection();

  // 显示第一句对话
  showDialogue(0);

  // 绑定按钮事件
  bindControlButtons();

  // 确保window.phoneModule存在
  window.phoneModule = window.phoneModule || {};
});
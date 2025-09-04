// -------------------- DOMContentLoaded 初始化 --------------------
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");

  // 初始化好感度显示
  initAffection();

  // 初始化手机模块
  if (window.phoneModule && window.phoneModule.initPhoneElements) {
    window.phoneModule.initPhoneElements();
    if (window.phoneModule.initPhoneChat) {
      window.phoneModule.initPhoneChat();
    }
  }

  // 显示第一句对话
  showDialogue(0);

  // 绑定按钮事件
  bindControlButtons();
});

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

// -------------------- DOM 元素 --------------------
const dialogText = document.getElementById("dialog-text");
const nameBox = document.querySelector(".character-name");
const characterAvatar = document.getElementById("character-avatar");
const avatarContainer = document.querySelector(".character-avatar");

const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const speedBtn = document.getElementById("speed-btn");
const skipBtn = document.getElementById("skip-btn");
const autoBtn = document.getElementById("auto-btn");

const musicBtn = document.getElementById("music-btn");
const bgMusic = document.getElementById("bg-music");
const volumeRange = document.getElementById("volume-range");

const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");

const autoSaveNotice = document.getElementById("auto-save-notice");
const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");

const choiceContainer = document.getElementById("choice-container");
const choiceBtns = document.querySelectorAll(".choice-btn");
const dialogBox = document.querySelector(".dialog-box");

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

// -------------------- 打字机效果 --------------------
function typeText(text, callback) {
  clearInterval(typingInterval);
  charIndex = 0;
  dialogText.textContent = "";

  typingInterval = setInterval(() => {
    dialogText.textContent += text[charIndex];
    charIndex++;
    if (charIndex >= text.length) {
      clearInterval(typingInterval);
      if (callback) callback();
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

  // 检查是否需要触发手机振动
  if (index === 12 ) {
  // 设置对话文本
 dialogText.textContent = '学姐的车渐渐远去 徒留下你呆站在原地';
  charIndex = dialogText.textContent.length;
  
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

// 添加处理手机响应的函数
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

// 添加最后的消息到聊天记录并继续游戏
window.phoneModule.addFinalMessageToChat = function() {
  if (!window.phoneModule.hasReceivedFinalMessage) {
    const { chatMessages, chatData } = window.phoneModule;
    
    if (!chatMessages) return;
    
    window.phoneModule.hasReceivedFinalMessage = true;
    
    // 第一条消息 - 学姐发送
    chatData.push({
      sender: "received", 
      text: "毕竟是工作上的大事 不能很快的做决定 等我的好消息哦（颜文字：开心）", 
      time: "12:30"
    });
    
    // 重新加载聊天记录
    window.phoneModule.loadChatMessages();
    
    // 1.5秒后发送第二条消息
    setTimeout(() => {
      // 第二条消息 - 学姐发送
      chatData.push({
        sender: "received", 
        text: "我会一直相信你的 可不能反悔哦", 
        time: "12:31"
      });
      
      // 重新加载聊天记录
      window.phoneModule.loadChatMessages();
      
      // 再等1.5秒后关闭聊天界面并继续剧情
      setTimeout(() => {
        if (window.phoneModule.closeChatInterface) {
          window.phoneModule.closeChatInterface();
        }
        
        // 继续剧情
        if (window.showDialogue && window.index !== undefined) {
          window.showDialogue(window.index + 1);
        }
        
        // 重置状态
        waitingForItem = false;
        isGameActive = true;
        
      }, 1500);
    }, 1500);
  }
};

  typeText(dialogues[index].text, () => {
    // 如果台词有选择框逻辑
    if (index === 999) setTimeout(showChoices, 500);
  });
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
    dialogText.textContent = dialogues[index].text;
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
  speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
}

// -------------------- 跳过按钮 --------------------
function handleSkip() {
  clearInterval(typingInterval);
  dialogText.textContent = dialogues[index].text;
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
    autoBtn.textContent = "停止自动";
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
      dialogText.textContent = dialogues[index].text;
    } else {
      if (index < dialogues.length - 1) showDialogue(index + 1);
      else stopAutoPlay();
    }
  }, 2000);
}

function stopAutoPlay() {
  clearInterval(autoInterval);
  autoPlay = false;
  autoBtn.textContent = "自动播放";
}

// -------------------- 选择框 ------------------------
function showChoices() {
  choiceContainer.classList.remove("hidden");
  dialogBox.style.display = "none";
  clearInterval(typingInterval);
  clearInterval(autoInterval);
  isChoiceActive = true;
}

function hideChoices() {
  choiceContainer.classList.add("hidden");
  dialogBox.style.display = "block";
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
  const text = bar.parentElement.querySelector('.affection-text');
  bar.style.width = `${affectionData[character]}%`;
  text.textContent = `${character === 'fang' ? '芳乃' : '其他'}: ${affectionData[character]}%`;

  localStorage.setItem('affectionData', JSON.stringify(affectionData));
}

function initAffection() {
  const savedData = localStorage.getItem('affectionData');
  if (savedData) Object.assign(affectionData, JSON.parse(savedData));
  for (const [character, value] of Object.entries(affectionData)) updateAffection(character, value);
}

// -------------------- 音乐控制 --------------------
volumeRange.addEventListener("input", () => bgMusic.volume = volumeRange.value / 100);
musicBtn.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicBtn.textContent = "音乐暂停";
  } else {
    bgMusic.pause();
    musicBtn.textContent = "音乐播放";
  }
});

// -------------------- 侧边栏控制 --------------------
toggleBtn.addEventListener("click", () => sidebar.classList.toggle("show"));

// -------------------- 自动存档 --------------------
function autoSave() {
  const saveIndex = !choiceContainer.classList.contains("hidden") ? 3 : index;
  const saveData = { page: "storyPage1", dialogueIndex: saveIndex, charIndex, timestamp: Date.now() };
  let saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));

  autoSaveNotice.classList.remove("hidden");
  autoSaveNotice.classList.add("show");
  setTimeout(() => { autoSaveNotice.classList.remove("show"); autoSaveNotice.classList.add("hidden"); }, 1500);
}

// -------------------- 存档 & 读档 --------------------
saveBtn.addEventListener("click", () => {
  const saveIndex = !choiceContainer.classList.contains("hidden") ? 3 : index;
  const saveData = { page: "storyPage1", dialogueIndex: saveIndex, charIndex, timestamp: Date.now() };
  let saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));
  alert("已存档！");
});

loadBtn.addEventListener("click", () => window.location.href = "load.html");

// -------------------- 绑定按钮 --------------------
function bindControlButtons() {
  nextBtn.addEventListener("click", handleNext);
  prevBtn.addEventListener("click", handlePrev);
  speedBtn.addEventListener("click", toggleSpeed);
  skipBtn.addEventListener("click", handleSkip);
  autoBtn.addEventListener("click", toggleAutoPlay);
  choiceBtns.forEach(btn => btn.addEventListener("click", handleChoice));
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

// -------------------- 手机响应处理 --------------------
// 确保window.phoneModule存在
window.phoneModule = window.phoneModule || {};

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

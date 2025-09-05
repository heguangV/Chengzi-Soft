// -------------------- DOM 元素 --------------------
const dialogText = document.getElementById("dialog-text");
const nameBox = document.querySelector(".character-name");
const avatarContainer = document.querySelector(".character-avatar");
const characterAvatar = document.getElementById("character-avatar");

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
let waitingForItem = false;
let isChoiceActive = false;

// 初始化phoneModule命名空间
window.phoneModule = window.phoneModule || {};
// 初始化手机相关状态
window.phoneModule.waitingForPhoneResponse = false;
window.phoneModule.phoneNotification = null;
window.phoneModule.hasReceivedFinalMessage = false;
window.phoneModule.phoneVibrationTriggered = false;

// -------------------- 剧情数据 --------------------
const dialogues = [
  { name: "B", text: "时光飞逝 下半学期已过去大半 ..." },
  { name: "C", text: "今天 是你们约定好去水族馆的日子 而你起晚了" },
  { name: "B", text: "这不能怪我啊！ 明明订好了闹钟为什么会不响啊！！" }, 
  { name: "舍友", text: "明明是你自己说要再睡一会就拍掉了…" }, 
  { name: "C", text: "不管了！ 去水族馆要紧" }, 
  { name: "C", text: "你飞奔下楼 骑上一辆共享单车 （希望不会是坏掉的） 天遂人愿 你勉强在约定的时间中赶到了学校的水族馆前" },
  { name: "C", text: "她站在水族馆门口 以一副幽怨的眼神注视着你 伸出手指在你的脑袋上敲了一下" },
  { name: "A", text: "“头发都没梳好 还说自己起床了！ 我教你的穿搭技巧倒是有好好在学…”" },
  { name: "A", text: "用手轻轻梳理着你的头发 一边打量着你全身的穿着" },
  { name: "B", text: "这可是我花了一晚上才挑选出来的 要不然怎么会起晚） 想着 你也观察起她的穿着" },
  { name: "C", text: "她身着一件淡蓝色的衬衫 外面是一件短款的夹克 下身穿着一件高腰牛仔裤 头上戴着一只米色的棒球帽 虽然简约 但在她如同明星般的比例与气质的映衬下 还是让人难以移开目光 惹得走过的路人频频注目" },
  { name: "A", text: "怎么样 学姐的专业穿搭” 她的脸上扬起一种自豪感 仿佛在等待你的夸奖" },
];

// -------------------- 判断是否触发手机振动 --------------------
function shouldTriggerPhoneVibration(idx) {
  // 在第0句触发手机振动
  return idx === 0;
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
      if (charIndex >= text.length) {
        clearInterval(typingInterval);
        if (callback) callback();
      }
    }
  }, typingSpeed);
}

// -------------------- 显示某条对话 --------------------
function showDialogue(idx) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;

  const currentName = dialogues[index].name;
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
    // 其他角色：显示名称，隐藏头像
    displayName = currentName;
    if (avatarContainer) avatarContainer.style.display = 'none';
  }
  
  if (nameBox) nameBox.textContent = displayName;

  // 判断是否触发手机振动（使用phone.js中的振动逻辑）
  if (shouldTriggerPhoneVibration(index) && !window.phoneModule.phoneVibrationTriggered) {
    // 使用phone.js中的振动函数
    if (window.makePhoneVibrate) {
      window.makePhoneVibrate();
    }
    waitingForItem = true;
    window.phoneModule.waitingForPhoneResponse = true;
    window.phoneModule.phoneVibrationTriggered = true;
    charIndex = 0;
    if (dialogText) dialogText.textContent = dialogues[index].text;
    
    // 强制停止任何正在进行的打字效果
    clearInterval(typingInterval);
    
    return;
  }

  waitingForItem = false;
  charIndex = 0;
  if (dialogText) dialogText.textContent = "";
  typeText(dialogues[index].text);
}

// -------------------- 处理手机响应 --------------------
function handlePhoneResponse() {
  // 使用phone.js中的函数打开聊天界面
  if (window.openChatInterface) {
    window.openChatInterface();
  }
  
  // 清空聊天记录
  const chatMessages = document.getElementById("chat-messages");
  if (chatMessages) {
    chatMessages.innerHTML = "";
  }
  
  // 临时禁用phone.js的随机回复功能
  const originalSimulateReply = window.phoneModule.simulateReply;
  window.phoneModule.simulateReply = function() {
    // 空函数，禁用随机回复
  };
  
  // 添加学姐的消息
  addMessageToChat("received", "说好了今天要去水族馆的 该不会还没起床吧（颜文字：生气）");
  
  // 预设男主的回复
  setTimeout(() => {
    addMessageToChat("sent", "(糟糕)怎么会 我这就来！！！");
    
    // 2秒后自动关闭聊天界面并继续剧情
    setTimeout(() => {
      // 恢复原来的simulateReply函数
      window.phoneModule.simulateReply = originalSimulateReply;
      
      // 使用phone.js中的函数关闭聊天界面
      if (window.closeChatInterface) {
        window.closeChatInterface();
      }
      window.phoneModule.waitingForPhoneResponse = false;
      showDialogue(index + 1);
    }, 2000);
  }, 1500);
}

// -------------------- 添加消息到聊天记录 --------------------
function addMessageToChat(sender, text) {
  const chatMessages = document.getElementById("chat-messages");
  if (!chatMessages) {
    console.error('Chat messages element not found!');
    return;
  }
  
  const now = new Date();
  const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const messageEl = document.createElement("div");
  messageEl.classList.add("message", sender);
  
  const contentEl = document.createElement("div");
  contentEl.classList.add("message-content");
  contentEl.textContent = text;
  
  const timeEl = document.createElement("div");
  timeEl.classList.add("message-time");
  timeEl.textContent = time;
  
  messageEl.appendChild(contentEl);
  messageEl.appendChild(timeEl);
  chatMessages.appendChild(messageEl);
  
  // 滚动到底部
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// -------------------- 下一句 --------------------
function handleNext() {
  if (waitingForItem || window.phoneModule.waitingForPhoneResponse || window.phoneOpen) return;

  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
  } else {
    if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else {
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../storypage2.0 与学姐好感度足够  2选择了2 1/storypage.html";
      }, 1000);
    }
  }
  stopAutoPlay();
}

// -------------------- 上一句 --------------------
function handlePrev() {
  if (waitingForItem || window.phoneModule.waitingForPhoneResponse || window.phoneOpen) return;
  showDialogue(index - 1);
  stopAutoPlay();
}

// -------------------- 加速按钮 --------------------
function toggleSpeed() {
  if (window.phoneOpen) return;
  isFast = !isFast;
  typingSpeed = isFast ? 10 : 50;
  if (speedBtn) speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
}

// -------------------- 跳过 --------------------
function handleSkip() {
  if (waitingForItem || window.phoneModule.waitingForPhoneResponse || window.phoneOpen) return;
  clearInterval(typingInterval);
  if (dialogText) dialogText.textContent = dialogues[index].text;
  stopAutoPlay();
}

// -------------------- 自动播放 --------------------
function toggleAutoPlay() {
  if (window.phoneOpen) return;
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
    if (waitingForItem || window.phoneModule.waitingForPhoneResponse || window.phoneOpen) return;
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      if (dialogText) dialogText.textContent = dialogues[index].text;
      charIndex = dialogues[index].text.length;
    } else {
      if (index < dialogues.length - 1) {
        showDialogue(index + 1);
      } else stopAutoPlay();
    }
  }, 2000);
}

function stopAutoPlay() {
  clearInterval(autoInterval);
  autoPlay = false;
  if (autoBtn) autoBtn.textContent = "自动播放";
}

// -------------------- 音乐控制 --------------------
if (volumeRange && bgMusic) {
  volumeRange.addEventListener("input", () => {
    bgMusic.volume = volumeRange.value / 100;
  });
}

if (musicBtn && bgMusic) {
  musicBtn.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicBtn.textContent = "音乐暂停";
    } else {
      bgMusic.pause();
      musicBtn.textContent = "音乐播放";
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
  loadBtn.addEventListener("click", () => {
    window.location.href = "load.html";
  });
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

if (choiceBtns && choiceBtns.forEach) {
  choiceBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const choice = btn.dataset.choice;
      hideChoices();
      if (choice === "A") showDialogue(index + 1);
      else if (choice === "B") showDialogue(index + 2);
      else showDialogue(index + 3);
    });
  });
}

// -------------------- 好感度系统 --------------------
const affectionData = { fang: 50, other: 30 };

function updateAffection(character, value) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  if (bar) {
    bar.style.width = `${affectionData[character]}%`;
    const text = bar.parentElement.querySelector(".affection-text");
    if (text) text.textContent = `${character === "fang" ? "芳乃" : "其他"}: ${affectionData[character]}%`;
  }
  localStorage.setItem("affectionData", JSON.stringify(affectionData));
}

function initAffection() {
  const savedData = localStorage.getItem("affectionData");
  if (savedData) Object.assign(affectionData, JSON.parse(savedData));
  for (const [character, value] of Object.entries(affectionData)) {
    updateAffection(character, value);
  }
}

if (choiceBtns && choiceBtns.forEach) {
  choiceBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const choice = btn.dataset.choice;
      hideChoices();
      if (choice === "A") {
        updateAffection("fang", affectionData.fang + 10);
        showDialogue(index + 1);
      } else if (choice === "B") {
        updateAffection("fang", affectionData.fang - 5);
        showDialogue(index + 2);
      } else {
        updateAffection("other", affectionData.other + 5);
        showDialogue(index + 3);
      }
    });
  });
}

// -------------------- 空格和点击触发下一句 --------------------
// 空格键触发下一句
window.addEventListener('keydown', (e) => {
  // 只有在空格键被按下且选择框未激活时才触发
  if (e.code === 'Space' && !isChoiceActive && !window.phoneModule.waitingForPhoneResponse && !window.phoneOpen) {
    e.preventDefault();
    handleNext();
  }
});

// 鼠标点击触发下一句
window.addEventListener('click', (e) => {
  // 只有在选择框未激活且点击的不是按钮等交互元素时才触发
  if (!isChoiceActive && 
      !window.phoneModule.waitingForPhoneResponse &&
      !window.phoneOpen &&
      !e.target.closest('button') && 
      !e.target.closest('input') && 
      !e.target.closest('#sidebar') && 
      !e.target.closest('#chat-input')) {
    handleNext();
  }
});

// -------------------- 手机点击事件处理 --------------------
document.addEventListener('DOMContentLoaded', function() {
  // 等待phone.js初始化完成
  setTimeout(function() {
    const phoneImage = document.getElementById("phone-image");
    if (phoneImage) {
      // 移除phone.js可能绑定的事件，重新绑定我们的事件
      phoneImage.onclick = null;
      phoneImage.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // 如果是等待手机响应的状态，处理手机响应
        if (window.phoneModule.waitingForPhoneResponse) {
          handlePhoneResponse();
          return;
        }
        
        // 否则使用phone.js的普通打开功能
        if (window.openChatInterface) {
          window.openChatInterface();
        }
      });
    }
  }, 1000);
});

// -------------------- 页面载入和初始化流程优化 --------------------
document.addEventListener("DOMContentLoaded", function() {
  document.body.classList.add("fade-in");

  // 初始化按钮事件
  if (nextBtn) nextBtn.addEventListener("click", handleNext);
  if (prevBtn) prevBtn.addEventListener("click", handlePrev);
  if (speedBtn) speedBtn.addEventListener("click", toggleSpeed);
  if (skipBtn) skipBtn.addEventListener("click", handleSkip);
  if (autoBtn) autoBtn.addEventListener("click", toggleAutoPlay);

  // 初始化其他功能
  initAffection();

  // 页面加载后立即显示剧情
  setTimeout(() => {
    showDialogue(0);
  }, 100);
});

// 再次确保 phone.js 加载后彻底覆盖 simulateReply和addFinalMessageToChat，防止被 phone.js 恢复
window.addEventListener('load', function() {
  if (window.phoneModule) {
    window.phoneModule.simulateReply = function() {};
    // 覆盖addFinalMessageToChat，改为自定义剧情内容
    window.phoneModule.addFinalMessageToChat = function() {
      if (window.phoneModule.hasReceivedFinalMessage) return;
      window.phoneModule.hasReceivedFinalMessage = true;
      // 这里写你想要的自定义剧情内容
      const finalMessages = [
        { sender: "received", text: "你怎么还没来？不会还没起床吧！", time: "7:50" },
        { sender: "sent", text: "马上到！别生气别生气！", time: "7:51" },
      ];
      window.phoneModule.chatData.push(...finalMessages);
      window.phoneModule.loadChatMessages();
      // 聊天消息加载后，推进剧情并自动关闭手机
      setTimeout(() => {
        // 关闭手机聊天界面
        if (window.phoneModule.closeChatInterface) {
          window.phoneModule.closeChatInterface();
        }
        // 推进剧情
        if (typeof showDialogue === 'function') showDialogue(index + 1);
      }, 2000);
    };
  }
});
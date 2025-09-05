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

  // 初始化 index
  index = 0;
  charIndex = 0;

  // 直接显示第一条台词
  const firstDialogue = dialogues[0];
  setCharacterDisplay(firstDialogue.name);
  typeText(firstDialogue.text);

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
  { name: "C", text: "学姐的车渐渐远去 徒留下你呆站在原地 " }, // 手机触发
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

let waitingForItem = false; // 等待物品/手机交互
let isGameActive = true;   // 游戏是否处于可推进状态
let isChoiceActive = false; // 选择框是否激活

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

// -------------------- 设置角色显示 --------------------
function setCharacterDisplay(name) {
  if (name === 'C') {
    nameBox.textContent = '旁白';
    avatarContainer.style.display = 'none';
  } else if (name === 'B') {
    nameBox.textContent = '主角';
    characterAvatar.src = '../../男主.png';
    characterAvatar.alt = '主角头像';
    avatarContainer.style.display = 'block';
  } else if (name === 'A' || name.includes('学姐')) {
    nameBox.textContent = '学姐';
    characterAvatar.src = '../../学姐.png';
    characterAvatar.alt = '学姐头像';
    avatarContainer.style.display = 'block';
  } else {
    avatarContainer.style.display = 'none';
    nameBox.textContent = name;
  }
}

// -------------------- 显示对话 --------------------
function showDialogue(idx, instant = false) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;

  const dialogue = dialogues[index];
  setCharacterDisplay(dialogue.name);

  // 特殊台词触发手机
  if (index === 12) {
    dialogText.textContent = dialogue.text;
    charIndex = dialogue.text.length; // 添加这行
    if (window.phoneModule && window.phoneModule.makePhoneVibrate) {
      window.phoneModule.makePhoneVibrate();
      waitingForItem = true;
      window.phoneModule.waitingForPhoneResponse = true;
    }
    clearInterval(typingInterval);
    return;
  }

  // 如果 instant 为 true，直接显示完整文本
  if (instant) {
    clearInterval(typingInterval);
    dialogText.textContent = dialogue.text;
    charIndex = dialogue.text.length; // 确保这行存在
  } else {
    typeText(dialogue.text, () => {
      if (index === 999) setTimeout(showChoices, 500);
    });
  }
}

// -------------------- 按钮事件处理 --------------------
function handleNext() {
  if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) return;

  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogText.textContent.length;
  } else {
    if (index < dialogues.length - 1) showDialogue(index + 1);
    else {
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../storypage2.0 与学姐好感度足够  1选择了1 4/storypage.html";
      }, 1000);
    }
  }
  stopAutoPlay();
}
function handlePrev() {
  if (index > 0) {
    stopAutoPlay();
    showDialogue(index - 1, true); // 保留 instant 参数但修复 showDialogue 函数
  }
}

function toggleSpeed() {
  isFast = !isFast;
  typingSpeed = isFast ? 10 : 50;
  speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index, true); // 切换速度时立即显示当前文本
}

function handleSkip() {
  clearInterval(typingInterval);
  dialogText.textContent = dialogues[index].text;
  charIndex = dialogText.textContent.length;
  stopAutoPlay();
}

function toggleAutoPlay() {
  if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) return;
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
    if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) {
      stopAutoPlay();
      return;
    }
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      dialogText.textContent = dialogues[index].text;
      charIndex = dialogText.textContent.length;
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
  hideChoices();

  if (choice === "A") updateAffection('fang', affectionData.fang + 10);
  else if (choice === "B") updateAffection('fang', affectionData.fang - 5);
  else updateAffection('other', affectionData.other + 5);

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
// -------------------- 存档读档 --------------------

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
  loadBtn.addEventListener("click", () => window.location.href = "../../savepage/savepage2.0/save.htm");
}
// -------------------- 绑定按钮 --------------------
function bindControlButtons() {
  if (nextBtn) nextBtn.addEventListener("click", handleNext);
  if (prevBtn) prevBtn.addEventListener("click", handlePrev);
  if (speedBtn) speedBtn.addEventListener("click", toggleSpeed);
  if (skipBtn) skipBtn.addEventListener("click", handleSkip);
  if (autoBtn) autoBtn.addEventListener("click", toggleAutoPlay);

  choiceBtns.forEach(btn => btn.addEventListener("click", handleChoice));
}

// -------------------- 空格和点击触发下一句 --------------------
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !isChoiceActive && isGameActive) {
    e.preventDefault();
    if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) return;
    handleNext();
  }
});

window.addEventListener('click', (e) => {
  if (!isChoiceActive && !e.target.closest('button') && !e.target.closest('input') && !e.target.closest('#sidebar') && isGameActive) {
    if (window.phoneModule && window.phoneModule.waitingForPhoneResponse) return;
    handleNext();
  }
});

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
        if (window.phoneModule.closeChatInterface) window.phoneModule.closeChatInterface();
        showDialogue(index + 1);
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
    if (phoneNotification && phoneImage.contains(phoneNotification)) phoneImage.removeChild(phoneNotification);
  }
  window.phoneModule.addFinalMessageToChat();
  if (window.phoneModule.openChatInterface) window.phoneModule.openChatInterface();
  window.phoneModule.waitingForPhoneResponse = false;
};

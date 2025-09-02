window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});

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

const choiceContainer = document.getElementById("choice-container");
const choiceBtns = document.querySelectorAll(".choice-btn");
const dialogBox = document.querySelector(".dialog-box");

const musicBtn = document.getElementById("music-btn");
const bgMusic = document.getElementById("bg-music");
const volumeRange = document.getElementById("volume-range");

const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");

const autoSaveNotice = document.getElementById("auto-save-notice");
const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");

// -------------------- 状态变量 --------------------
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;

let autoPlay = false;
let autoInterval = null;
let isFast = false;

// -------------------- 剧情控制 --------------------
const dialogues = [
  { name: "B", text: "忽然 你只感觉一阵柔和的风从身后吹过 你身上的痛苦好像在风的吹拂中烟消云散 你不由得加快了脚步 终于看到了在门口等候的学姐" },
  { name: "C", text: "你来到了学姐身边 但即将离开的学姐脸上却是一幅复杂的申请 一时间 你们两个人竟都想不出来如何开口 空气仿佛都已经凝固在了这一刻" },
  { name: "A", text: "看着你被汗水打湿的 亦或是被风吹乱的刘海 自然地伸出手 帮你梳理整齐" },
  { name: "B", text: "你看着学姐的手 心里闪回着与学姐间的点点滴滴 虽然时间不长 但这一份回忆已经要比天边的那一抹骄阳还要炽热 看着眼前这幅即将离自己远去的脸 不由得心头一紧" },
  { name: "B", text: "选择： 1.抓住学姐的手 2. 默默看着学姐" }, // todo
];

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

// -------------------- 显示某条对话 --------------------
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
    characterAvatar.src = '../../学姐.jpeg';
    characterAvatar.alt = '学姐头像';
    avatarContainer.style.display = 'block';
  } else {
    // 其他角色：隐藏头像
    avatarContainer.style.display = 'none';
  }
  
  // 更新显示名称
  nameBox.textContent = displayName;

  typeText(dialogues[index].text, () => {
    if (index === 999) autoSave();
    if (index === 3) setTimeout(showChoices, 500);
  });
}

// -------------------- 对话控制按钮 --------------------
nextBtn.addEventListener("click", () => {
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
    if (index === 3) setTimeout(showChoices, 500);
  } else {
    if (index < dialogues.length - 1) showDialogue(index + 1);
    else {
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "";
      }, 1000);
    }
  }
  stopAutoPlay();
});

prevBtn.addEventListener("click", () => {
  showDialogue(index - 1);
  stopAutoPlay();
});

speedBtn.addEventListener("click", () => {
  isFast = !isFast;
  typingSpeed = isFast ? 10 : 50;
  speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
});

skipBtn.addEventListener("click", () => {
  clearInterval(typingInterval);
  dialogText.textContent = dialogues[index].text;
  stopAutoPlay();
});

autoBtn.addEventListener("click", () => {
  autoPlay = !autoPlay;
  autoPlay ? (autoBtn.textContent = "停止自动", startAutoPlay()) : stopAutoPlay();
});

function startAutoPlay() {
  clearInterval(autoInterval);
  autoInterval = setInterval(() => {
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

// -------------------- 选择框 --------------------
function showChoices() {
  choiceContainer.classList.remove("hidden");
  dialogBox.style.display = "none";
  clearInterval(typingInterval);
  clearInterval(autoInterval);
}

function hideChoices() {
  choiceContainer.classList.add("hidden");
  dialogBox.style.display = "block";
}

// 选择按钮统一处理
choiceBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const choice = btn.dataset.choice;
    console.log("玩家选择了:", choice);
    hideChoices();

    // 更新好感度（后面模块）
    if (choice === "A"){
      document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "../storypage2.0 与学姐好感度足够  1选择了1 1/storypage.html";
    }, 1000);}
    else if (choice === "B") {document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../storypage2.0 与学姐好感度足够  1选择了2 1/storypage.html";
      }, 1000);}
    else showDialogue(index + 3);
  });
});

// -------------------- 音乐控制 --------------------
volumeRange.addEventListener("input", () => bgMusic.volume = volumeRange.value / 100);

musicBtn.addEventListener("click", () => {
  if (bgMusic.paused) bgMusic.play(), musicBtn.textContent = "音乐暂停";
  else bgMusic.pause(), musicBtn.textContent = "音乐播放";
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
  setTimeout(() => autoSaveNotice.classList.remove("show"), 1500);
}

// -------------------- 存档/读档 --------------------
saveBtn.addEventListener("click", () => {
  const saveIndex = !choiceContainer.classList.contains("hidden") ? 3 : index;
  const saveData = { page: "storyPage1", dialogueIndex: saveIndex, charIndex, timestamp: Date.now() };
  let saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));
  alert("已存档！");
});

loadBtn.addEventListener("click", () => window.location.href = "load.html");

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

// -------------------- 初始化 --------------------
initAffection();
showDialogue(0);
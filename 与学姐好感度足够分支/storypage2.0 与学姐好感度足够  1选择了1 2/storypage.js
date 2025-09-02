// -------------------- 页面载入效果 --------------------
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});

// -------------------- 剧情控制 --------------------
const dialogues = [
  { name: "A", text: "你看着学姐在夕阳照射下泛红的双眼 从前的自信是什么时候消失的呢？ 这时候 体育馆中学姐那幅痛苦的脸庞再次在你脑海中浮现" },
  { name: "B", text: "“这可能只是我的私心…我无论如何都想陪在你的身边”" },
  { name: "B", text: "“我不想你再一个人痛苦 就让我来分担吧”" },
  { name: "B", text: "“我会为我的这一份私心奉献我的一切的 就让我陪着你走过这段通往顶峰的道路吧 就在这个最熟悉不过的地方”" },
  { name: "B", text: "“留下来吧…”" }
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

const musicBtn       = document.getElementById("music-btn");
const bgMusic        = document.getElementById("bg-music");
const volumeRange    = document.getElementById("volume-range");

const sidebar        = document.getElementById("sidebar");
const toggleBtn      = document.getElementById("sidebar-toggle");

const saveBtn        = document.getElementById("save-btn");
const loadBtn        = document.getElementById("load-btn");
const autoSaveNotice = document.getElementById("auto-save-notice");

const choiceContainer = document.getElementById("choice-container");
const choiceBtns      = document.querySelectorAll(".choice-btn");
const dialogBox       = document.querySelector(".dialog-box");

// -------------------- 状态变量 --------------------
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;

let autoPlay = false;
let autoInterval = null;
let isFast = false;

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
    if (index === 999) {
      autoSave();
      setTimeout(showChoices, 500);
    }
  });
}

// -------------------- 下一句按钮 --------------------
nextBtn.addEventListener("click", () => {
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;

    if (index === 999) setTimeout(showChoices, 500);
  } else {
    if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else {
      // 最后一条 → 淡出并跳转
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../storypage2.0 与学姐好感度足够  1选择了1 3/storypage.html";
      }, 1000);
    }
  }
  stopAutoPlay();
});

// -------------------- 上一句按钮 --------------------
prevBtn.addEventListener("click", () => {
  showDialogue(index - 1);
  stopAutoPlay();
});

// -------------------- 加速按钮 --------------------
speedBtn.addEventListener("click", () => {
  isFast = !isFast;
  typingSpeed = isFast ? 10 : 50;
  speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
});

// -------------------- 跳过按钮 --------------------
skipBtn.addEventListener("click", () => {
  clearInterval(typingInterval);
  dialogText.textContent = dialogues[index].text;
  stopAutoPlay();
});

// -------------------- 自动播放 --------------------
autoBtn.addEventListener("click", () => {
  autoPlay = !autoPlay;
  autoPlay ? (autoBtn.textContent = "停止自动", startAutoPlay())
           : stopAutoPlay();
});

function startAutoPlay() {
  clearInterval(autoInterval);
  autoInterval = setInterval(() => {
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      dialogText.textContent = dialogues[index].text;
    } else if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else {
      stopAutoPlay();
    }
  }, 2000);
}

function stopAutoPlay() {
  clearInterval(autoInterval);
  autoPlay = false;
  autoBtn.textContent = "自动播放";
}

// -------------------- 音乐控制 --------------------
volumeRange.addEventListener("input", () => {
  bgMusic.volume = volumeRange.value / 100;
});

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
toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

// -------------------- 自动存档 --------------------
function autoSave() {
  const saveIndex = !choiceContainer.classList.contains("hidden") ? 3 : index;
  const saveData = { page: "storyPage1", dialogueIndex: saveIndex, charIndex, timestamp: Date.now() };

  let saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));

  autoSaveNotice.classList.remove("hidden");
  autoSaveNotice.classList.add("show");

  setTimeout(() => {
    autoSaveNotice.classList.remove("show");
    autoSaveNotice.classList.add("hidden");
  }, 1500);
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

loadBtn.addEventListener("click", () => {
  window.location.href = "load.html";
});

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

choiceBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const choice = btn.dataset.choice;
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
  });
});

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

  for (const [character, value] of Object.entries(affectionData)) {
    updateAffection(character, value);
  }
}

// -------------------- 初始化 --------------------
initAffection();
showDialogue(0);
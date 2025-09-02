// -------------------- 页面载入效果 --------------------
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});

// -------------------- DOM 元素 --------------------
const dialogText = document.getElementById("dialog-text");
const nameBox = document.querySelector(".character-name");

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

const specialItem = document.getElementById("special-item");

// -------------------- 状态变量 --------------------
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;

let autoPlay = false;
let autoInterval = null;
let isFast = false;
let waitingForItem = false;

// -------------------- 剧情数据 --------------------
const dialogues = [
  { name: "A", text: "说好了今天要去水族馆的 该不会还没起床吧（颜文字：生气）" },
  { name: "A", text: "(糟糕)怎么会 我这就来！！！" },
  { name: "B", text: "时光飞逝 下半学期已过去大半 ..." },
  { name: "C", text: "今天 是你们约定好去水族馆的日子 而你起晚了" },
  { name: "B", text: "这不能怪我啊！ 明明订好了闹钟为什么会不响啊！！" }, 
  { name: "舍友", text: "明明是你自己说要再睡一会就拍掉了…" }, 
  { name: "C", text: "不管了！ 去水族馆要紧" }, 
];

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
// -------------------- 打字机效果 --------------------
function typeText(text, callback) {
  clearInterval(typingInterval);
  typingInterval = setInterval(() => {
    dialogText.textContent += text[charIndex];
    charIndex++;
    if (charIndex >= text.length) {
      clearInterval(typingInterval);
      if (callback) callback();
    }
  }, typingSpeed);
}

// -------------------- 判断是否显示特殊物品 --------------------
function shouldShowSpecialItem(idx) {
  // 这里示例：第一句显示物品，你可以改成任意条件
  return idx === 0;
}

// -------------------- 显示某条对话 --------------------
function showDialogue(idx) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;

  nameBox.textContent = dialogues[index].name;

  // 判断是否出现特殊物品
  if (shouldShowSpecialItem(index) && !specialItem.dataset.clicked) {
    specialItem.style.top = `${Math.random() * 60 + 20}%`;
    specialItem.style.left = `${Math.random() * 60 + 20}%`;
    specialItem.classList.remove("hidden");
    waitingForItem = true;
    charIndex = 0;
    dialogText.textContent = "";
    return;
  }

  waitingForItem = false;
  charIndex = 0;
  dialogText.textContent = "";
  typeText(dialogues[index].text);
}

// -------------------- 点击特殊物品 --------------------
specialItem.addEventListener("click", () => {
  specialItem.classList.add("hidden");
  specialItem.dataset.clicked = true;
  waitingForItem = false;

  // 继续当前句台词
  typeText(dialogues[index].text);
});

// -------------------- 下一句 --------------------
nextBtn.addEventListener("click", () => {
  if (waitingForItem) return;

  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
  } else {
    if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else {
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../storypage2.0 与学姐好感度足够  1选择了1 5/storypage.html";
      }, 1000);
    }
  }
  stopAutoPlay();
});

// -------------------- 上一句 --------------------
prevBtn.addEventListener("click", () => {
  if (waitingForItem) return;
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

// -------------------- 跳过 --------------------
skipBtn.addEventListener("click", () => {
  if (waitingForItem) return;
  clearInterval(typingInterval);
  dialogText.textContent = dialogues[index].text;
  stopAutoPlay();
});

// -------------------- 自动播放 --------------------
autoBtn.addEventListener("click", () => {
  autoPlay = !autoPlay;
  if (autoPlay) {
    autoBtn.textContent = "停止自动";
    startAutoPlay();
  } else stopAutoPlay();
});

function startAutoPlay() {
  clearInterval(autoInterval);
  autoInterval = setInterval(() => {
    if (waitingForItem) return;
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      dialogText.textContent = dialogues[index].text;
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

// -------------------- 侧边栏 --------------------
toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

// -------------------- 存档/读档 --------------------
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
    if (choice === "A") showDialogue(index + 1);
    else if (choice === "B") showDialogue(index + 2);
    else showDialogue(index + 3);
  });
});

// -------------------- 好感度系统 --------------------
const affectionData = { fang: 50, other: 30 };

function updateAffection(character, value) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  const text = bar.parentElement.querySelector(".affection-text");
  bar.style.width = `${affectionData[character]}%`;
  text.textContent = `${character === "fang" ? "芳乃" : "其他"}: ${affectionData[character]}%`;
  localStorage.setItem("affectionData", JSON.stringify(affectionData));
}
function initAffection() {
  const savedData = localStorage.getItem("affectionData");
  if (savedData) Object.assign(affectionData, JSON.parse(savedData));
  for (const [character, value] of Object.entries(affectionData)) {
    updateAffection(character, value);
  }
}
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

// -------------------- 初始化 --------------------
initAffection();
showDialogue(0);
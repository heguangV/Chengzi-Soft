// -------------------- 页面载入效果 --------------------
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
  
  // 添加空格键和鼠标点击实现下一句的功能
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault(); // 阻止空格键的默认行为（如页面滚动）
      triggerNextDialogue();
    }
  });
  
  // 点击文档空白处也可以触发下一句
  document.addEventListener("click", (e) => {
    // 避免点击到其他按钮时也触发下一句
    if (!e.target.closest("button") && !e.target.closest(".control-img") && 
        !e.target.closest("#sidebar") && !e.target.closest("#sidebar-toggle")) {
      triggerNextDialogue();
    }
  });
});

// 触发下一句的统一函数
function triggerNextDialogue() {
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
    if (index === 999) {
      setTimeout(showChoices, 500);
    }
  } else {
    if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else {
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../storypage2.0 与学姐好感度不足4/storypage.html";
      }, 1000);
    }
  }
  stopAutoPlay();
}

// -------------------- DOM 元素 --------------------
const musicBtn = document.getElementById("music-btn");
const bgMusic = document.getElementById("bg-music");
const volumeRange = document.getElementById("volume-range");

const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");

const autoSaveNotice = document.getElementById("auto-save-notice");
const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");

const dialogText = document.getElementById("dialog-text");
const nameBox = document.querySelector(".character-name");
const avatarContainer = document.querySelector(".character-avatar");
const avatarImg = document.getElementById("character-avatar");

const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const speedBtn = document.getElementById("speed-btn");
const skipBtn = document.getElementById("skip-btn");
const autoBtn = document.getElementById("auto-btn");

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

// -------------------- 对话数据 --------------------
const dialogues = [
  { name: "C", text: "想到这些，你的心里已经开始打退堂鼓。" },
  { name: "C", text: "思绪乱成一锅粥，矛盾与犹豫交织在脑海里。" },
  { name: "C", text: "最终你想到一个办法：还是看学姐的反应。" },
  { name: "B", text: "如果她来向我表白了，那我当然接受。" },
  { name: "B", text: "但是如果她没向我表白，那也就说明她对我并不是那么不舍了吧。" },
  { name: "B", text: "那我也就不必去表白了。" },
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

  // 修改角色名称和头像显示
  let displayName = dialogues[index].name;
  if (displayName === 'C') {
    displayName = '旁白';
    avatarContainer.style.display = 'none'; // 旁白不显示头像
  } else if (displayName === 'B') {
    displayName = '主角';
    avatarImg.src = '../../男主.png';
    avatarContainer.style.display = 'block'; // 显示男主头像
  } else if (displayName.includes('学姐')) {
    avatarImg.src = '../../学姐.jpeg';
    avatarContainer.style.display = 'block'; // 显示学姐头像
  } else {
    avatarContainer.style.display = 'none'; // 其他角色不显示头像
  }

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
  triggerNextDialogue();
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

// -------------------- 自动播放按钮 --------------------
autoBtn.addEventListener("click", () => {
  autoPlay = !autoPlay;
  if (autoPlay) {
    autoBtn.textContent = "停止自动";
    startAutoPlay();
  } else {
    stopAutoPlay();
  }
});

function startAutoPlay() {
  clearInterval(autoInterval);
  autoInterval = setInterval(() => {
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      dialogText.textContent = dialogues[index].text;
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

// -------------------- 侧边栏控制 --------------------
toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

// -------------------- 自动存档 --------------------
function autoSave() {
  const saveIndex = !choiceContainer.classList.contains("hidden") ? 3 : index;
  const saveData = {
    page: "storyPage1",
    dialogueIndex: saveIndex,
    charIndex: charIndex,
    timestamp: Date.now()
  };
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

// -------------------- 存档 --------------------
saveBtn.addEventListener("click", () => {
  const saveIndex = !choiceContainer.classList.contains("hidden") ? 3 : index;
  const saveData = {
    page: "storyPage1",
    dialogueIndex: saveIndex,
    charIndex: charIndex,
    timestamp: Date.now()
  };
  let saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));
  alert("已存档！");
});

// -------------------- 读档 --------------------
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
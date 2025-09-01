

// -------------------- 页面载入效果 --------------------
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});

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

const dialogues = [
  { name: "旁白", text: "一学期的大学生活，如同被风吹散的云烟，在不知不觉中走到了学姐约定的分别时刻" },
  { name: "旁白", text: "你的手机屏幕映出一片淡淡的白光，反射在天花板上，与傍晚的晚霞交织在一起。" },
  { name: "旁白", text: "你就这样看着天花板发呆，思绪纷飞。" },
  { name: "旁白", text: "你一个学期就这样过去了。很忙，却又说不上忙了些什么。" },
  { name: "旁白", text: "你努力回想，这一学期究竟有什么值得留恋的瞬间。" },
  { name: "旁白", text: "除了和青梅的时光，似乎就只有学姐的存在让你记得。" },
  { name: "旁白", text: "你就这样看着天花板发呆，思绪纷飞。" },
  { name: "旁白", text: "你有些惆怅。" }
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

  nameBox.textContent = dialogues[index].name;

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
    if (index === 999) {
      setTimeout(showChoices, 500);
    }
  } else {
    if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else {
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../storypage2.0 与学姐好感度不足2/storypage.html";
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
      } else {
        stopAutoPlay();
      }
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
    console.log("玩家选择了:", choice);
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

choiceBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const choice = btn.dataset.choice;
    console.log("玩家选择了:", choice);
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

// -------------------- 初始化 --------------------
initAffection();
showDialogue(0);
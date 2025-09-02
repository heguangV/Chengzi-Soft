// ================== 页面载入效果 ==================
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});

// ================== 剧情数据 ==================
const dialogues = [
  { name: "A", text: " 学姐仰起头 注视着你的双眼 如水般温柔的目光中仿佛在寻找着什么" },
  { name: "A", text: "许久 脸上重新浮现出笑容 将手慢慢的抽回 向我挥了挥手" },
  { name: "B", text: "我看着她远去的身影 还想说些什么 或是做些什么 但却又无从开口 只能看着学姐逐渐远去 或许 我还不够成为她留下的理由吧" },
  { name: "C", text: "学姐的车渐渐远去 徒留下你呆站在原地 " }, // TODO: （手机振动）
  { name: "A", text: "毕竟是工作上的大事 不能很快的做决定 等我的好消息哦（颜文字：开心）" },
  { name: "A", text: "我会一直相信你的 可不能反悔哦" },
  { name: "C", text: "此刻 晚霞格外恢弘" },
];

// ================== DOM 元素 ==================
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

// ================== 状态变量 ==================
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;

let autoPlay = false;
let autoInterval = null;
let isFast = false;
let waitingForItem = false;

// ================== 打字机效果 ==================
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

// ================== 显示对话 ==================
function showDialogue(idx, skipSpecialItem = false) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;

  nameBox.textContent = dialogues[index].name;

  // 只有当 index===3 且还没点击物品时才显示特殊物品
  if (index === 3 && !skipSpecialItem) {
    specialItem.classList.remove("hidden");
    waitingForItem = true;
    return; // 停止，不继续台词
  }

  typeText(dialogues[index].text, () => {
    if (index === 999) {
      autoSave();
      setTimeout(showChoices, 500);
    }
  });
}

// ================== 点击物品继续台词 ==================
specialItem.addEventListener("click", () => {
  specialItem.classList.add("hidden");
  waitingForItem = false;
  showDialogue(index, true); // 跳过物品判断，继续打字
});

// ================== 下一句按钮 ==================
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
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../storypage2.0 与学姐好感度足够  1选择了1 4/storypage.html";
      }, 1000);
    }
  }
  stopAutoPlay();
});
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

// ================== 上一句按钮 ==================
prevBtn.addEventListener("click", () => {
  showDialogue(index - 1);
  stopAutoPlay();
});

// ================== 加速按钮 ==================
speedBtn.addEventListener("click", () => {
  isFast = !isFast;
  typingSpeed = isFast ? 10 : 50;
  speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
});

// ================== 跳过按钮 ==================
skipBtn.addEventListener("click", () => {
  clearInterval(typingInterval);
  dialogText.textContent = dialogues[index].text;
  stopAutoPlay();
});

// ================== 自动播放 ==================
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

// ================== 音乐控制 ==================
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

// ================== 侧边栏控制 ==================
toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

// ================== 自动存档 ==================
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

// ================== 存档 / 读档 ==================
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

loadBtn.addEventListener("click", () => {
  window.location.href = "load.html";
});

// ================== 选择框 ==================
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

// ================== 好感度系统 ==================
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

// ================== 初始化 ==================
initAffection();
showDialogue(0);
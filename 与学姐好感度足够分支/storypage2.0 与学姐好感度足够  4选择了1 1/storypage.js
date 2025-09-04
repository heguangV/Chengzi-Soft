window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});

// -------------------- 剧情台词 --------------------
const dialogues = [
  { name: "C", text: "在淡蓝色的世界中 你伸出了双手 将学姐拥入怀中" },
  { name: "A", text: "你感受到学姐并没有任何反抗 反而迎合着你 伸手抱住了你" },  
  { name: "C", text: "你看着怀中的学姐 脸颊上的红晕甚至比刚才更加明显 她的嘴唇微微颤动 仿佛有话要说 你便试着将耳朵贴的更近了一点" }, 
  { name: "A", text: "我喜欢你…" }, 
  { name: "B", text: "整个世界好像只剩下了这一句话的声音 你被这突如其来的告白怔在了原地 一时说不出话" }, 
];

// -------------------- DOM 元素 --------------------
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
const characterAvatarContainer = document.getElementById('character-avatar-container');
const characterAvatar = document.getElementById('character-avatar');

// -------------------- 状态变量 --------------------
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;

let autoPlay = false;
let autoInterval = null;
let isFast = false;

// -------------------- 下一句按钮 --------------------
nextBtn.addEventListener("click", () => {
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
    if (index === 999) setTimeout(showChoices, 500);
    return;
  }

  if (index < dialogues.length - 1) {
    showDialogue(index + 1);
  } else {
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "../storypage2.0 与学姐好感度足够  4选择了1 2/storypage.html";
    }, 1000);
  }
  stopAutoPlay();
});

// -------------------- 显示某条对话 --------------------
function showDialogue(idx) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;

  // 名称映射逻辑
  let displayName = dialogues[index].name;
  
  // 根据名称映射设置显示名称和头像
  if (dialogues[index].name === 'C') {
    displayName = '旁白';
    characterAvatarContainer.style.display = 'none'; // 隐藏头像
  } else if (dialogues[index].name === 'B') {
    displayName = '男主';
    characterAvatar.src = '../../男主.png';
    characterAvatarContainer.style.display = 'block'; // 显示头像
  } else if (dialogues[index].name === 'A' || dialogues[index].name === '芳乃') {
    displayName = '学姐';
    characterAvatar.src = '../../学姐.png';
    characterAvatarContainer.style.display = 'block'; // 显示头像
  } else {
    characterAvatarContainer.style.display = 'none'; // 默认隐藏头像
  }

  nameBox.textContent = displayName;

  typeText(dialogues[index].text, () => {
    if (index === 999) autoSave();
    if (index === 999) setTimeout(showChoices, 500);
  });
}

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

// -------------------- 音乐控制 --------------------
const musicBtn = document.getElementById("music-btn");
const bgMusic = document.getElementById("bg-music");
const volumeRange = document.getElementById("volume-range");

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
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

// -------------------- 自动存档 --------------------
const autoSaveNotice = document.getElementById("auto-save-notice");

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

// -------------------- 存档 / 读档 --------------------
const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");

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

// 在对话选择时更新好感度
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

// -------------------- 初始化 --------------------
initAffection();
showDialogue(0);
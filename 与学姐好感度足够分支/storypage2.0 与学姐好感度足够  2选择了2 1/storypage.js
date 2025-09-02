window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});

// -------------------- 剧情控制 --------------------
const dialogues = [
  { name: "C", text: "将自己真实的感受和盘托出 毫不吝啬的夸奖着学姐" },
  { name: "C", text: "“好了好了 我知道了！！不要再说啦！！！” 学姐脸上泛起了抹抹红晕 好像被你夸奖的娇羞不已 学姐的架子荡然无存" },
  { name: "A", text: "你露出一种阴谋得逞的微笑 注视着面前娇羞的学姐" },
  { name: "A", text: "“你是个坏人！！” 说着 跑进了水族馆" },
  { name: "B", text: "你赶忙追上去 一同进入了水族馆" }
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

// -------------------- DOM --------------------
const dialogText = document.getElementById("dialog-text");
const nameBox = document.querySelector(".character-name");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const speedBtn = document.getElementById("speed-btn");
const skipBtn = document.getElementById("skip-btn");
const autoBtn = document.getElementById("auto-btn");
const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");
const musicBtn = document.getElementById("music-btn");
const bgMusic = document.getElementById("bg-music");
const volumeRange = document.getElementById("volume-range");
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");
const autoSaveNotice = document.getElementById("auto-save-notice");
const choiceContainer = document.getElementById("choice-container");
const choiceBtns = document.querySelectorAll(".choice-btn");
const dialogBox = document.querySelector(".dialog-box");

// -------------------- 状态 --------------------
let index = 0, charIndex = 0, typingSpeed = 50, typingInterval = null;
let autoPlay = false, autoInterval = null, isFast = false;

const affectionData = { fang: 50, other: 30 };

// -------------------- 打字机效果 --------------------
function typeText(text, callback) {
  clearInterval(typingInterval);
  charIndex = 0;
  dialogText.textContent = "";
  typingInterval = setInterval(() => {
    dialogText.textContent += text[charIndex++];
    if (charIndex >= text.length) {
      clearInterval(typingInterval);
      if (callback) callback();
    }
  }, typingSpeed);
}

// -------------------- 剧情显示 --------------------
function showDialogue(idx) {
  index = Math.max(0, Math.min(idx, dialogues.length - 1));
  nameBox.textContent = dialogues[index].name;

  typeText(dialogues[index].text, () => {
    if (index === 999) autoSave(); // 特殊台词触发存档/选择框
  });
}

// -------------------- 按钮事件 --------------------
nextBtn.addEventListener("click", () => {
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
  } else if (index < dialogues.length - 1) {
    showDialogue(index + 1);
  } else {
    document.body.classList.add("fade-out");
    setTimeout(() => window.location.href = "../storypage2.0 与学姐好感度足够  2选择了2 2/storypage.html", 1000);
  }
  stopAutoPlay();
});

prevBtn.addEventListener("click", () => { showDialogue(index - 1); stopAutoPlay(); });
speedBtn.addEventListener("click", () => { isFast = !isFast; typingSpeed = isFast ? 10 : 50; speedBtn.textContent = isFast ? "原速" : "加速"; showDialogue(index); });
skipBtn.addEventListener("click", () => { clearInterval(typingInterval); dialogText.textContent = dialogues[index].text; stopAutoPlay(); });
autoBtn.addEventListener("click", () => { autoPlay = !autoPlay; autoPlay ? (autoBtn.textContent = "停止自动", startAutoPlay()) : stopAutoPlay(); });

// -------------------- 自动播放 --------------------
function startAutoPlay() {
  clearInterval(autoInterval);
  autoInterval = setInterval(() => {
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      dialogText.textContent = dialogues[index].text;
      charIndex = dialogues[index].text.length;
    } else if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else stopAutoPlay();
  }, 2000);
}
function stopAutoPlay() { clearInterval(autoInterval); autoPlay = false; autoBtn.textContent = "自动播放"; }

// -------------------- 音乐 --------------------
volumeRange.addEventListener("input", () => bgMusic.volume = volumeRange.value / 100);
musicBtn.addEventListener("click", () => {
  if (bgMusic.paused) { bgMusic.play(); musicBtn.textContent = "音乐暂停"; } 
  else { bgMusic.pause(); musicBtn.textContent = "音乐播放"; }
});

// -------------------- 侧边栏 --------------------
toggleBtn.addEventListener("click", () => sidebar.classList.toggle("show"));

// -------------------- 存档 --------------------
function saveGame() {
  const saveIndex = choiceContainer.classList.contains("hidden") ? index : 3;
  const saveData = { page: "storyPage1", dialogueIndex: saveIndex, charIndex, timestamp: Date.now() };
  const saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));
  autoSaveNotice && (autoSaveNotice.classList.add("show"), setTimeout(() => autoSaveNotice.classList.remove("show"), 1500));
}

saveBtn.addEventListener("click", () => { saveGame(); alert("已存档！"); });
loadBtn.addEventListener("click", () => window.location.href = "load.html");

// -------------------- 选择框 --------------------
function showChoices() { choiceContainer.classList.remove("hidden"); dialogBox.style.display = "none"; clearInterval(typingInterval); clearInterval(autoInterval); }
function hideChoices() { choiceContainer.classList.add("hidden"); dialogBox.style.display = "block"; }

choiceBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const choice = btn.dataset.choice;
    console.log("玩家选择了:", choice);
    hideChoices();

    // 好感度变化
    if (choice === "A") updateAffection('fang', affectionData.fang + 10, index + 1);
    else if (choice === "B") updateAffection('fang', affectionData.fang - 5, index + 2);
    else updateAffection('other', affectionData.other + 5, index + 3);
  });
});

// -------------------- 好感度 --------------------
function updateAffection(character, value, nextIdx) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  const text = bar.parentElement.querySelector('.affection-text');
  bar.style.width = `${affectionData[character]}%`;
  text.textContent = `${character === 'fang' ? '芳乃' : '其他'}: ${affectionData[character]}%`;
  localStorage.setItem('affectionData', JSON.stringify(affectionData));
  showDialogue(nextIdx);
}

function initAffection() {
  const saved = localStorage.getItem('affectionData');
  if (saved) Object.assign(affectionData, JSON.parse(saved));
  Object.entries(affectionData).forEach(([character, val]) => updateAffection(character, val, index));
}

// -------------------- 初始化 --------------------
initAffection();
showDialogue(0);
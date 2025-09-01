// -------------------- DOMContentLoaded 初始化 --------------------
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");

  // 初始化好感度显示
  initAffection();

  // 显示第一句对话
  showDialogue(0);

  // 绑定按钮事件
  bindControlButtons();
});

// -------------------- 剧情台词 --------------------
const dialogues = [
  { name: "A", text: "怔然的看着我 嘴唇颤抖了一下" },
  { name: "A", text: "“不是已经约定好要走了吗 可不能反悔啊 你不是也说好相信我能成功的吗？”" },
  { name: "B", text: "“看着眼前几近落泪的学姐 已经全然没有了平时的学姐架子 柔美的面容在泪水的映衬下更加显得复杂 我鬼使神差般得更加用力地握住了学姐的手”" },
  { name: "A", text: "“为什么 你还是不相信我一个人能取得成绩吗？”她试着抽出自己的手”" },
];

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

// -------------------- 显示对话 --------------------
function showDialogue(idx) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;

  nameBox.textContent = dialogues[index].name;

  typeText(dialogues[index].text, () => {
    // 如果台词有选择框逻辑
    if (index === 999) setTimeout(showChoices, 500);
  });
}

// -------------------- 下一句按钮 --------------------
function handleNext() {
  if (charIndex < dialogues[index].text.length) {
    // 打字机未打完，直接显示完整文字
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
  } else {
    if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else {
      // 最后一条台词淡出跳转
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../storypage2.0 与学姐好感度足够  1选择了1 2/storypage.html";
      }, 1000);
    }
  }
  stopAutoPlay();
}

// -------------------- 上一句按钮 --------------------
function handlePrev() {
  showDialogue(index - 1);
  stopAutoPlay();
}

// -------------------- 加速按钮 --------------------
function toggleSpeed() {
  isFast = !isFast;
  typingSpeed = isFast ? 10 : 50;
  speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
}

// -------------------- 跳过按钮 --------------------
function handleSkip() {
  clearInterval(typingInterval);
  dialogText.textContent = dialogues[index].text;
  stopAutoPlay();
}

// -------------------- 自动播放按钮 --------------------
function toggleAutoPlay() {
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

function handleChoice(event) {
  const choice = event.currentTarget.dataset.choice;
  console.log("玩家选择了:", choice);
  hideChoices();

  // 更新好感度
  if (choice === "A") updateAffection('fang', affectionData.fang + 10);
  else if (choice === "B") updateAffection('fang', affectionData.fang - 5);
  else updateAffection('other', affectionData.other + 5);

  // 显示对应对话
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

// -------------------- 存档 & 读档 --------------------
saveBtn.addEventListener("click", () => {
  const saveIndex = !choiceContainer.classList.contains("hidden") ? 3 : index;
  const saveData = { page: "storyPage1", dialogueIndex: saveIndex, charIndex, timestamp: Date.now() };
  let saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));
  alert("已存档！");
});

loadBtn.addEventListener("click", () => window.location.href = "load.html");

// -------------------- 绑定按钮 --------------------
function bindControlButtons() {
  nextBtn.addEventListener("click", handleNext);
  prevBtn.addEventListener("click", handlePrev);
  speedBtn.addEventListener("click", toggleSpeed);
  skipBtn.addEventListener("click", handleSkip);
  autoBtn.addEventListener("click", toggleAutoPlay);
  choiceBtns.forEach(btn => btn.addEventListener("click", handleChoice));
}
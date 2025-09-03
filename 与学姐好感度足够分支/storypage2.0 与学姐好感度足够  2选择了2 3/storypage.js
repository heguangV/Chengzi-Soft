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
  { name: "A", text: "“sakana~”她向前伸出双手 单脚站在地上 像是在模仿水箱中游荡的鱼儿" },
  { name: "B", text: "在你不知所措时 却看到她注视着你 似乎想让你也加入其中" },
];

// -------------------- DOM 元素 --------------------
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

// -------------------- 状态变量 --------------------
let index = 0, charIndex = 0, typingSpeed = 50, typingInterval = null;
let autoPlay = false, autoInterval = null, isFast = false;
let isChoiceActive = false; // 新增：标记选择是否激活

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

// -------------------- 显示某条对话 --------------------
function showDialogue(idx) {
  index = Math.max(0, Math.min(idx, dialogues.length - 1));
  nameBox.textContent = dialogues[index].name;

  typeText(dialogues[index].text, () => {
    // 如果到特殊台词需要显示选择框或自动存档，可在这里扩展
    if (index === 1)  {
      updateAffection('fang', affectionData.fang + 10);
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../storypage2.0 与学姐好感度足够  3选择了1 1/storypage.html";
      }, 1000);
    }
  });
}

// -------------------- 下一句/上一句/加速/跳过/自动播放 --------------------
function handleNext() {
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
  } else if (index < dialogues.length - 1) {
    showDialogue(index + 1);
  } else {
      setTimeout(showChoices, 500);

  }
  stopAutoPlay();
}

function handlePrev() {
  showDialogue(index - 1);
  stopAutoPlay();
}

function toggleSpeed() {
  isFast = !isFast;
  typingSpeed = isFast ? 10 : 50;
  speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
}

function handleSkip() {
  clearInterval(typingInterval);
  dialogText.textContent = dialogues[index].text;
  stopAutoPlay();
}

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
      charIndex = dialogues[index].text.length;
    } else if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else stopAutoPlay();
  }, 2000);
}

function stopAutoPlay() {
  clearInterval(autoInterval);
  autoPlay = false;
  autoBtn.textContent = "自动播放";
}

// -------------------- 音乐 --------------------
volumeRange.addEventListener("input", () => bgMusic.volume = volumeRange.value / 100);
musicBtn.addEventListener("click", () => {
  if (bgMusic.paused) { bgMusic.play(); musicBtn.textContent = "音乐暂停"; }
  else { bgMusic.pause(); musicBtn.textContent = "音乐播放"; }
});

// -------------------- 侧边栏 --------------------
toggleBtn.addEventListener("click", () => sidebar.classList.toggle("show"));

// -------------------- 存档/读档 --------------------
function saveGame() {
  const saveIndex = choiceContainer.classList.contains("hidden") ? index : 3;
  const saveData = { page: "storyPage1", dialogueIndex: saveIndex, charIndex, timestamp: Date.now() };
  const saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));
  if (autoSaveNotice) {
    autoSaveNotice.classList.add("show");
    setTimeout(() => autoSaveNotice.classList.remove("show"), 1500);
  }
}
saveBtn.addEventListener("click", () => { saveGame(); alert("已存档！"); });
loadBtn.addEventListener("click", () => window.location.href = "load.html");

// -------------------- 选择框 --------------------
function showChoices() { choiceContainer.classList.remove("hidden"); dialogBox.style.display = "none"; clearInterval(typingInterval); clearInterval(autoInterval); }
function hideChoices() { choiceContainer.classList.add("hidden"); dialogBox.style.display = "block"; }

function handleChoice(event) {
  const choice = event.currentTarget.dataset.choice;
  console.log("玩家选择了:", choice);
  hideChoices();

  if (choice === "A") {
    updateAffection('fang', affectionData.fang + 10);
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "../storypage2.0 与学姐好感度足够  3选择了1 1/storypage.html";
    }, 1000);
  } else if (choice === "B") updateAffection('fang', affectionData.fang - 5, index + 2);
  else updateAffection('other', affectionData.other + 5, index + 3);
}
choiceBtns.forEach(btn => btn.addEventListener("click", handleChoice));

// -------------------- 好感度 --------------------
function updateAffection(character, value, nextIdx) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  const text = bar.parentElement.querySelector('.affection-text');
  bar.style.width = `${affectionData[character]}%`;
  text.textContent = `${character === 'fang' ? '芳乃' : '其他'}: ${affectionData[character]}%`;
  localStorage.setItem('affectionData', JSON.stringify(affectionData));
  if (nextIdx !== undefined) showDialogue(nextIdx);
}

function initAffection() {
  const saved = localStorage.getItem('affectionData');
  if (saved) Object.assign(affectionData, JSON.parse(saved));
  Object.entries(affectionData).forEach(([char, val]) => updateAffection(char, val));
}

// -------------------- 绑定控制按钮 --------------------
function bindControlButtons() {
  nextBtn.addEventListener("click", handleNext);
  prevBtn.addEventListener("click", handlePrev);
  speedBtn.addEventListener("click", toggleSpeed);
  skipBtn.addEventListener("click", handleSkip);
  autoBtn.addEventListener("click", toggleAutoPlay);
}

// -------------------- 空格和点击触发下一句 --------------------
// 空格键触发下一句
window.addEventListener('keydown', (e) => {
  // 只有在空格键被按下且选择框未激活时才触发
  if (e.code === 'Space' && !isChoiceActive) {
    e.preventDefault(); // 阻止默认行为，避免页面滚动
    // 模拟下一句按钮点击
    nextBtn.click();
  }
});

// 鼠标点击触发下一句
window.addEventListener('click', (e) => {
  // 只有在选择框未激活且点击的不是按钮等交互元素时才触发
  if (!isChoiceActive && 
      !e.target.closest('button') && 
      !e.target.closest('input') && 
      !e.target.closest('#sidebar') && 
      !e.target.closest('#chat-input')) {
    // 模拟下一句按钮点击
    nextBtn.click();
  }
});
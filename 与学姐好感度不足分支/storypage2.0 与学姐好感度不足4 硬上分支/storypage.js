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
      window.location.href = "../storypage2.0 与学姐好感度不足3/storypage.html";
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
  { name: "B", text: "可……这样我真的不会后悔吗？" },
  { name: "B", text: "人怎么会这么矛盾呢……" },
  { name: "C", text: "忽然，手机轻轻振动了一下。" },
  { name: "C", text: "你拿起手机，屏幕上是一条简短的消息：" },
  { name: "A", text: "“再见啦，学弟君~ 我已经在去机场的车上咯~ 以后有时间可以来看我的演出哦，我会为你留特等席的 (＾▽＾) ”" },
  { name: "C", text: "你盯着屏幕，回忆着一个学期中与学姐共同度过的点滴时光。" },
  { name: "C", text: "虽然琐碎，却也温暖而美好。" },
  { name: "C", text: "你想到这些，迅速的打出了一句：学姐我还有很多话想和你说"},
  { name: "C", text: "可你又想到了被拒绝之后的种种可能，又或是异地恋的各种可能，慢慢地将那句未发的消息删去了"},
];

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

  // 修改角色名称和头像显示
  let displayName = dialogues[index].name;
  if (displayName === 'C') {
    displayName = '旁白';
    avatarContainer.style.display = 'none'; // 旁白不显示头像
  } else if (displayName === 'B') {
    displayName = '主角';
    avatarImg.src = '../../男主.png';
    avatarContainer.style.display = 'block'; // 显示男主头像
  } else if (displayName === 'A' || displayName.includes('学姐')) {
    displayName = '学姐';
    avatarImg.src = '../../学姐.jpeg';
    avatarContainer.style.display = 'block'; // 显示学姐头像
  } else {
    avatarContainer.style.display = 'none'; // 其他角色不显示头像
  }

  nameBox.textContent = displayName;
  typeText(dialogues[index].text);
}

// -------------------- 音乐控制 --------------------
volumeRange.addEventListener("input", () => { bgMusic.volume = volumeRange.value / 100; });
musicBtn.addEventListener("click", () => {
  if (bgMusic.paused) { bgMusic.play(); musicBtn.textContent = "音乐暂停"; }
  else { bgMusic.pause(); musicBtn.textContent = "音乐播放"; }
});

// -------------------- 侧边栏控制 --------------------
toggleBtn.addEventListener("click", () => sidebar.classList.toggle("show"));

// -------------------- 存档系统 --------------------
function saveGame() {
  const saveIndex = !choiceContainer.classList.contains("hidden") ? 3 : index;
  const saveData = { page: "storyPage1", dialogueIndex: saveIndex, charIndex, timestamp: Date.now() };
  let saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));
  alert("已存档！");
}
saveBtn.addEventListener("click", saveGame);
loadBtn.addEventListener("click", () => window.location.href = "load.html");

function autoSave() {
  saveGame();
  autoSaveNotice.classList.remove("hidden");
  autoSaveNotice.classList.add("show");
  setTimeout(() => {
    autoSaveNotice.classList.remove("show");
    autoSaveNotice.classList.add("hidden");
  }, 1500);
}

// -------------------- 对话控制按钮 --------------------
nextBtn.addEventListener("click", () => {
  triggerNextDialogue();
});
prevBtn.addEventListener("click", () => { showDialogue(index - 1); stopAutoPlay(); });
speedBtn.addEventListener("click", () => { isFast = !isFast; typingSpeed = isFast ? 10 : 50; speedBtn.textContent = isFast ? "原速" : "加速"; showDialogue(index); });
skipBtn.addEventListener("click", () => { clearInterval(typingInterval); dialogText.textContent = dialogues[index].text; charIndex = dialogues[index].text.length; stopAutoPlay(); });
autoBtn.addEventListener("click", () => { autoPlay = !autoPlay; autoPlay ? (autoBtn.textContent = "停止自动", startAutoPlay()) : stopAutoPlay(); });

function startAutoPlay() {
  clearInterval(autoInterval);
  autoInterval = setInterval(() => {
    if (charIndex < dialogues[index].text.length) { clearInterval(typingInterval); dialogText.textContent = dialogues[index].text; charIndex = dialogues[index].text.length; }
    else if (index < dialogues.length - 1) showDialogue(index + 1);
    else stopAutoPlay();
  }, 2000);
}
function stopAutoPlay() { clearInterval(autoInterval); autoPlay = false; autoBtn.textContent = "自动播放"; }

// -------------------- 选择框 --------------------
function showChoices() { choiceContainer.classList.remove("hidden"); dialogBox.style.display = "none"; clearInterval(typingInterval); stopAutoPlay(); }
function hideChoices() { choiceContainer.classList.add("hidden"); dialogBox.style.display = "block"; }
choiceBtns.forEach(btn => btn.addEventListener("click", () => {
  const choice = btn.dataset.choice; hideChoices();
  if (choice === "A") updateAffection('fang', affectionData.fang + 10), showDialogue(index + 1);
  else if (choice === "B") updateAffection('fang', affectionData.fang - 5), showDialogue(index + 2);
  else updateAffection('other', affectionData.other + 5), showDialogue(index + 3);
}));

// -------------------- 初始化 --------------------
initAffection();
showDialogue(0);
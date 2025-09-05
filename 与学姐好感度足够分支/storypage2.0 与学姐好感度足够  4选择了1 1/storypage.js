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
const musicBtn = document.getElementById("music-btn");
const bgMusic = document.getElementById("bg-music");
const volumeRange = document.getElementById("volume-range");
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");
const autoSaveNotice = document.getElementById("auto-save-notice");
const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");

// -------------------- 状态变量 --------------------
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;
let autoPlay = false;
let autoInterval = null;
let isFast = false;

// -------------------- 剧情台词 --------------------
const dialogues = [
  { name: "C", text: "在淡蓝色的世界中 你伸出了双手 将学姐拥入怀中" },
  { name: "A", text: "你感受到学姐并没有任何反抗 反而迎合着你 伸手抱住了你" },  
  { name: "C", text: "你看着怀中的学姐 脸颊上的红晕甚至比刚才更加明显 她的嘴唇微微颤动 仿佛有话要说 你便试着将耳朵贴的更近了一点" }, 
  { name: "A", text: "我喜欢你…" }, 
  { name: "B", text: "整个世界好像只剩下了这一句话的声音 你被这突如其来的告白怔在了原地 一时说不出话" },
  { name: "A", text: "“怎么一点反应都没有 你听到了对吧！”" },
  { name: "B", text: "“抱歉 我还是有点蒙 你刚才 对我告白了吗”" },  
  { name: "A", text: "“你果然是听到了 那为什么还不说话！”" }, 
  { name: "B", text: "看着怀里气鼓鼓的学姐 “原来这一切都不是梦境吗”" }, 
  { name: "B", text: "“我当然也喜欢你了 就算你不说 我也会向你表白”" }, 
  { name: "A", text: "“哼 那罚你也要说！”" }, 
  { name: "B", text: "“我喜欢你 请以后一定都要和我在一起”" }, 
  { name: "A", text: "“说好了 可就不能反悔了哦 我们要永远在一起”" }, 
  { name: "C", text: "在这温软的对话之间 周围好像变得越来越亮 我相信 我们的未来也会想这样无比耀眼吧…" }, 
]; 


// -------------------- 好感度系统 --------------------
const affectionData = { fang: 50, other: 30 };

// -------------------- 打字机效果 --------------------
function typeText(text, callback) {
  clearInterval(typingInterval);
  charIndex = 0;
  if (dialogText) dialogText.textContent = "";

  typingInterval = setInterval(() => {
    if (dialogText && charIndex < text.length) {
      dialogText.textContent += text[charIndex];
      charIndex++;
      if (charIndex >= text.length) {
        clearInterval(typingInterval);
        if (callback) callback();
      }
    }
  }, typingSpeed);
}

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
    if (characterAvatarContainer) characterAvatarContainer.style.display = 'none';
  } else if (dialogues[index].name === 'B') {
    displayName = '男主';
    if (characterAvatar) characterAvatar.src = '../../男主.png';
    if (characterAvatarContainer) characterAvatarContainer.style.display = 'block';
  } else if (dialogues[index].name === 'A' || dialogues[index].name === '芳乃') {
    displayName = '学姐';
    if (characterAvatar) characterAvatar.src = '../../学姐.png';
    if (characterAvatarContainer) characterAvatarContainer.style.display = 'block';
  } else {
    if (characterAvatarContainer) characterAvatarContainer.style.display = 'none';
  }

  if (nameBox) nameBox.textContent = displayName;

  typeText(dialogues[index].text, () => {
    if (index === 999) autoSave();
    if (index === 999) setTimeout(showChoices, 500);
  });
}

// -------------------- 下一句按钮 --------------------
function handleNext() {
  if (window.phoneOpen) return;
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
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
  if (speedBtn) speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
}

// -------------------- 跳过按钮 --------------------
function handleSkip() {
  clearInterval(typingInterval);
  if (dialogText) dialogText.textContent = dialogues[index].text;
  stopAutoPlay();
}

// -------------------- 自动播放按钮 --------------------
function toggleAutoPlay() {
  autoPlay = !autoPlay;
  if (autoPlay) {
    if (autoBtn) autoBtn.textContent = "停止自动";
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
      if (dialogText) dialogText.textContent = dialogues[index].text;
    } else {
      if (index < dialogues.length - 1) showDialogue(index + 1);
      else stopAutoPlay();
    }
  }, 2000);
}

function stopAutoPlay() {
  clearInterval(autoInterval);
  autoPlay = false;
  if (autoBtn) autoBtn.textContent = "自动播放";
}

// -------------------- 选择框 ------------------------
function showChoices() {
  if (choiceContainer) choiceContainer.classList.remove("hidden");
  if (dialogBox) dialogBox.style.display = "none";
  clearInterval(typingInterval);
  clearInterval(autoInterval);
}

function hideChoices() {
  if (choiceContainer) choiceContainer.classList.add("hidden");
  if (dialogBox) dialogBox.style.display = "block";
}

function handleChoice(event) {
  const choice = event.currentTarget.dataset.choice;
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
}

// -------------------- 音乐控制 --------------------
function setupMusicControls() {
  if (volumeRange && bgMusic) {
    volumeRange.addEventListener("input", () => {
      bgMusic.volume = volumeRange.value / 100;
    });
  }

  if (musicBtn && bgMusic) {
    musicBtn.addEventListener("click", () => {
      if (bgMusic.paused) {
        bgMusic.play();
        if (musicBtn) musicBtn.textContent = "音乐暂停";
      } else {
        bgMusic.pause();
        if (musicBtn) musicBtn.textContent = "音乐播放";
      }
    });
  }
}

// -------------------- 侧边栏控制 --------------------
function setupSidebar() {
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("show");
    });
  }
}

// -------------------- 自动存档 --------------------
function autoSave() {
  const saveIndex = choiceContainer && !choiceContainer.classList.contains("hidden") ? 3 : index;
  const saveData = {
    page: "storyPage1",
    dialogueIndex: saveIndex,
    charIndex: charIndex,
    timestamp: Date.now()
  };
  let saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));

  if (autoSaveNotice) {
    autoSaveNotice.classList.remove("hidden");
    autoSaveNotice.classList.add("show");
    setTimeout(() => {
      autoSaveNotice.classList.remove("show");
      autoSaveNotice.classList.add("hidden");
    }, 1500);
  }
}

// -------------------- 存档 / 读档 --------------------
function setupSaveLoad() {
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const saveIndex = choiceContainer && !choiceContainer.classList.contains("hidden") ? 3 : index;
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
  }

  if (loadBtn) {
    loadBtn.addEventListener("click", () => {
      window.location.href = "load.html";
    });
  }
}

// -------------------- 好感度系统 --------------------
function updateAffection(character, value) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  if (bar) {
    bar.style.width = `${affectionData[character]}%`;
    const text = bar.parentElement.querySelector('.affection-text');
    if (text) text.textContent = `${character === 'fang' ? '芳乃' : '其他'}: ${affectionData[character]}%`;
  }
  localStorage.setItem('affectionData', JSON.stringify(affectionData));
}

function initAffection() {
  const savedData = localStorage.getItem('affectionData');
  if (savedData) Object.assign(affectionData, JSON.parse(savedData));
  for (const [character, value] of Object.entries(affectionData)) {
    updateAffection(character, value);
  }
}

// -------------------- 绑定事件 --------------------
function bindEvents() {
  if (nextBtn) nextBtn.addEventListener("click", handleNext);
  if (prevBtn) prevBtn.addEventListener("click", handlePrev);
  if (speedBtn) speedBtn.addEventListener("click", toggleSpeed);
  if (skipBtn) skipBtn.addEventListener("click", handleSkip);
  if (autoBtn) autoBtn.addEventListener("click", toggleAutoPlay);
  
  if (choiceBtns && choiceBtns.forEach) {
    choiceBtns.forEach(btn => {
      btn.addEventListener("click", handleChoice);
    });
  }
}

// -------------------- 初始化 --------------------
function init() {
  initAffection();
  showDialogue(0);
  bindEvents();
  setupMusicControls();
  setupSidebar();
  setupSaveLoad();
}

// -------------------- DOMContentLoaded 初始化 --------------------
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
  init();
});
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
const avatarContainer = document.getElementById("character-avatar-container");
const characterAvatar = document.getElementById("character-avatar");
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
  { name: "C", text: "你高举着双手 加入了其中 引得旁边的同学驻足" },
  { name: "C", text: "你们毫不在意 相视一笑后 向前方继续走着 不同的是 你们的十指紧紧扣在了一起" },  
  { name: "A", text: "牵着你的手 向着一个方向快速前进着 像是有什么确定的目标 你虽然疑惑 但也毫无抗拒着跟着不断向前" }, 
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

// -------------------- 显示对话 --------------------
function showDialogue(idx) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;

  let currentName = dialogues[index].name;
  let displayName = currentName;
  
  // 根据name值修改显示名称和头像
  if (currentName === 'C') {
    displayName = '旁白';
    if (avatarContainer) avatarContainer.style.display = 'none';
  } else if (currentName === 'B') {
    displayName = '主角';
    if (characterAvatar) {
      characterAvatar.src = '../../男主.png';
      characterAvatar.alt = '主角头像';
    }
    if (avatarContainer) avatarContainer.style.display = 'block';
  } else if (currentName === 'A' || currentName.includes('学姐')) {
    displayName = '学姐';
    if (characterAvatar) {
      characterAvatar.src = '../../学姐.png';
      characterAvatar.alt = '学姐头像';
    }
    if (avatarContainer) avatarContainer.style.display = 'block';
  } else {
    if (avatarContainer) avatarContainer.style.display = 'none';
  }
  
  // 更新显示名称
  if (nameBox) nameBox.textContent = displayName;
  
  typeText(dialogues[index].text, () => {
    // 如果是特定台词可自动存档或显示选择框
    if (index === 999) {
      autoSave();
      setTimeout(showChoices, 500);
    }
  });
}

// -------------------- 下一句按钮 --------------------
function handleNext() {
  if (window.phoneOpen) return;
  
  // 当前台词未完成 → 显示完整文字
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
    return;
  }
  
  // 当前台词完成 → 跳到下一句或最后一句处理
  if (index < dialogues.length - 1) {
    showDialogue(index + 1);
  } else {
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "../storypage2.0 与学姐好感度足够  3选择了1 2/storypage.html";
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
  if (autoBtn) autoBtn.textContent = "自动播放";
}

// -------------------- 选择按钮 ------------------------
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
  console.log("玩家选择了:", choice);
  hideChoices();

  if (choice === "A") showDialogue(index + 1);
  else if (choice === "B") showDialogue(index + 2);
  else showDialogue(index + 3);
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
  
  // 空格键触发下一句
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && choiceContainer && choiceContainer.classList.contains("hidden") && !window.phoneOpen) {
      e.preventDefault();
      handleNext();
    }
  });

  // 鼠标左键点击触发下一句
  document.addEventListener("click", (e) => {
    if (choiceContainer && choiceContainer.classList.contains("hidden") && 
        !e.target.closest("#next-btn") && 
        !e.target.closest("#prev-btn") && 
        !e.target.closest("#speed-btn") && 
        !e.target.closest("#skip-btn") && 
        !e.target.closest("#auto-btn") && 
        !e.target.closest("#sidebar") && 
        !e.target.closest("#sidebar-toggle") &&
        !e.target.closest("#save-btn") &&
        !e.target.closest("#load-btn") &&
        !e.target.closest("#music-btn") &&
        !e.target.closest(".volume-control") &&
        !window.phoneOpen) {
      handleNext();
    }
  });
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
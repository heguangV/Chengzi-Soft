// -------------------- DOM 元素 --------------------
const dialogText = document.getElementById("dialog-text");
const nameBox = document.querySelector(".character-name");
const avatarContainer = document.querySelector(".character-avatar");
const characterAvatar = document.getElementById("character-avatar");

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
let isChoiceActive = false;

// -------------------- 对话数据 --------------------
const dialogues = [
  { name: "B", text: "你的头发早已整齐 但是学姐的手却迟迟游移着不肯离去 你看出了她的不舍 于是向前一步 将学姐抱入了怀中" },
  { name: "B", text: "在那边也要继续加油哦 我会一直在心里为你加油的 你的演出可要记得为我留下一个视野最好的座位哦！”说罢 嘴角挤出一抹逞强的笑容" },
  { name: "A", text: "看着你的笑脸 不由得湿了眼眶 用略显吃力的声音回答 “我一定会努力的 毕竟我可是你的最厉害的学姐呢！”" },
  { name: "C", text: "在浅尝辄止的拥抱过后 她抽回了双手 向你摆出了一个再见的手势后 转身踏上了车" },
  { name: "B", text: "你看着车门被轻轻关上 摇下的车窗露出了她的笑容" },
  { name: "B", text: "“原来我的笑 也是这么地难堪吗" },
  { name: "C", text: "看着车渐渐远去 你的思绪仿佛也逐渐飘远 随着车消失在远处的一片苍白之中" },
  { name: "C", text: "两厢情愿" },
];

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

  // 获取当前对话的名称
  let currentName = dialogues[index].name;
  let displayName = currentName;
  
  // 根据name值修改显示名称和头像
  if (currentName === 'C') {
    // 旁白：隐藏头像
    displayName = '旁白';
    if (avatarContainer) avatarContainer.style.display = 'none';
  } else if (currentName === 'B') {
    // 主角：显示男主头像
    displayName = '主角';
    if (characterAvatar) {
      characterAvatar.src = '../../男主.png';
      characterAvatar.alt = '主角头像';
    }
    if (avatarContainer) avatarContainer.style.display = 'block';
  } else if (currentName === 'A' || currentName.includes('学姐')) {
    // 学姐：显示学姐头像
    displayName = '学姐';
    if (characterAvatar) {
      characterAvatar.src = '../../学姐.png';
      characterAvatar.alt = '学姐头像';
    }
    if (avatarContainer) avatarContainer.style.display = 'block';
  } else {
    // 其他角色：隐藏头像
    if (avatarContainer) avatarContainer.style.display = 'none';
  }
  
  // 更新显示名称
  if (nameBox) nameBox.textContent = displayName;

  typeText(dialogues[index].text, () => {
    if (index === 999) { // 特殊句子触发存档或选择框
      autoSave();
      setTimeout(showChoices, 500);
    }
  });
}

// -------------------- 下一句按钮 --------------------
function handleNext() {
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
    if (index === 999) setTimeout(showChoices, 500);
  } else {
    if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else {
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../storypage2.0 与学姐好感度足够  1选择了2 2/storypage.html";
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
  if (speedBtn) speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
}

// -------------------- 跳过按钮 --------------------
function handleSkip() {
  clearInterval(typingInterval);
  if (dialogText) dialogText.textContent = dialogues[index].text;
  charIndex = dialogues[index].text.length;
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
      charIndex = dialogues[index].text.length;
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

// -------------------- 选择框 --------------------
function showChoices() {
  if (choiceContainer) choiceContainer.classList.remove("hidden");
  if (dialogBox) dialogBox.style.display = "none";
  clearInterval(typingInterval);
  stopAutoPlay();
  isChoiceActive = true;
}

function hideChoices() {
  if (choiceContainer) choiceContainer.classList.add("hidden");
  if (dialogBox) dialogBox.style.display = "block";
  isChoiceActive = false;
}

// -------------------- 好感度系统 --------------------
const affectionData = { fang: 50, other: 30 };

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

// -------------------- 音乐控制 --------------------
if (volumeRange && bgMusic) {
  volumeRange.addEventListener("input", () => {
    bgMusic.volume = volumeRange.value / 100;
  });
}

if (musicBtn && bgMusic) {
  musicBtn.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicBtn.textContent = "音乐暂停";
    } else {
      bgMusic.pause();
      musicBtn.textContent = "音乐播放";
    }
  });
}

// -------------------- 侧边栏控制 --------------------
if (toggleBtn && sidebar) {
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });
}

// -------------------- 空格和点击触发下一句 --------------------
// 空格键触发下一句
window.addEventListener('keydown', (e) => {
  // 只有在空格键被按下且选择框未激活时才触发
  if (e.code === 'Space' && !isChoiceActive && !window.phoneOpen) {
    e.preventDefault(); // 阻止默认行为，避免页面滚动
    handleNext();
  }
});

// 鼠标点击触发下一句
window.addEventListener('click', (e) => {
  // 只有在选择框未激活且点击的不是按钮等交互元素时才触发
  if (!isChoiceActive && 
      !e.target.closest('button') && 
      !e.target.closest('input') && 
      !e.target.closest('#sidebar') && 
      !e.target.closest('#chat-input') &&
      !window.phoneOpen) {
    handleNext();
  }
});

// -------------------- 绑定控制按钮 --------------------
function bindControlButtons() {
  if (nextBtn) nextBtn.addEventListener("click", () => {
    if (window.phoneOpen) return;
    handleNext();
  });
  
  if (prevBtn) prevBtn.addEventListener("click", () => {
    if (window.phoneOpen) return;
    handlePrev();
  });
  
  if (speedBtn) speedBtn.addEventListener("click", () => {
    if (window.phoneOpen) return;
    toggleSpeed();
  });
  
  if (skipBtn) skipBtn.addEventListener("click", () => {
    if (window.phoneOpen) return;
    handleSkip();
  });
  
  if (autoBtn) autoBtn.addEventListener("click", () => {
    if (window.phoneOpen) return;
    toggleAutoPlay();
  });
  
  if (saveBtn) saveBtn.addEventListener("click", () => {
    autoSave();
    alert("已存档！");
  });
  
  if (loadBtn) loadBtn.addEventListener("click", () => {
    window.location.href = "load.html";
  });
  
  // 选择按钮
  if (choiceBtns && choiceBtns.forEach) {
    choiceBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const choice = btn.dataset.choice;
        hideChoices();
        
        if (choice === "A") updateAffection('fang', affectionData.fang + 10);
        else if (choice === "B") updateAffection('fang', affectionData.fang - 5);
        else updateAffection('other', affectionData.other + 5);
        
        if (choice === "A") showDialogue(index + 1);
        else if (choice === "B") showDialogue(index + 2);
        else showDialogue(index + 3);
      });
    });
  }
}

// -------------------- 页面加载后自动初始化 --------------------
window.addEventListener("DOMContentLoaded", function() {
  document.body.classList.add("fade-in");
  // 检查关键DOM元素
  if (!dialogText || !nameBox || !nextBtn || !prevBtn || !speedBtn || !skipBtn || !autoBtn || !choiceContainer || !dialogBox) {
    console.error("部分关键DOM元素未找到，初始化中止。");
    return;
  }
  // 手机相关初始化
  if (window.phoneModule && typeof window.phoneModule.initPhoneElements === 'function') {
    window.phoneModule.initPhoneElements();
  }
  if (window.phoneModule && typeof window.phoneModule.initPhoneChat === 'function') {
    window.phoneModule.initPhoneChat();
  }
  initAffection();
  showDialogue(0);
  bindControlButtons();
});
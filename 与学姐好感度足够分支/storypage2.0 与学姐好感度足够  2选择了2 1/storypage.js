// -------------------- DOM 元素 --------------------
let dialogText, nameBox, nextBtn, prevBtn, speedBtn, skipBtn, autoBtn;
let choiceContainer, choiceBtns, dialogBox;
let musicBtn, bgMusic, volumeRange;
let sidebar, toggleBtn;
let autoSaveNotice, saveBtn, loadBtn;
// 头像相关元素
let characterAvatarContainer, characterAvatar;

// -------------------- 状态变量 --------------------
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;

let autoPlay = false;
let autoInterval = null;
let isFast = false;
let isChoiceActive = false; // 新增：标记选择是否激活

// -------------------- 剧情控制 --------------------
const dialogues = [
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

// -------------------- DOMContentLoaded 初始化 --------------------
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");

  // 获取所有DOM元素
  dialogText = document.getElementById("dialog-text");
  nameBox = document.querySelector(".character-name");

  nextBtn = document.getElementById("next-btn");
  prevBtn = document.getElementById("prev-btn");
  speedBtn = document.getElementById("speed-btn");
  skipBtn = document.getElementById("skip-btn");
  autoBtn = document.getElementById("auto-btn");

  choiceContainer = document.getElementById("choice-container");
  choiceBtns = document.querySelectorAll(".choice-btn");
  dialogBox = document.querySelector(".dialog-box");

  musicBtn = document.getElementById("music-btn");
  bgMusic = document.getElementById("bg-music");
  volumeRange = document.getElementById("volume-range");

  sidebar = document.getElementById("sidebar");
  toggleBtn = document.getElementById("sidebar-toggle");

  autoSaveNotice = document.getElementById("auto-save-notice");
  saveBtn = document.getElementById("save-btn");
  loadBtn = document.getElementById("load-btn");

  // 头像相关元素
  characterAvatarContainer = document.getElementById('character-avatar-container');
  characterAvatar = document.getElementById('character-avatar');

  // 初始化好感度显示
  initAffection();

  // 显示第一句对话
  showDialogue(0);

  // 绑定按钮事件
  bindControlButtons();
});

// -------------------- 打字机效果 --------------------
function typeText(text, callback) {
  clearInterval(typingInterval);
  charIndex = 0;
  if (dialogText) dialogText.textContent = "";

  typingInterval = setInterval(() => {
    if (dialogText) dialogText.textContent += text[charIndex];
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

  // 名称映射逻辑
  let currentName = dialogues[index].name;
  let displayName = currentName;
  
  // 根据name值修改显示名称和头像
  if (nameBox) {
    if (currentName === 'C') {
      // 旁白：隐藏头像
      displayName = '旁白';
      if (characterAvatarContainer) characterAvatarContainer.style.display = 'none';
    } else if (currentName === 'B') {
      // 主角：显示男主头像
      displayName = '男主';
      if (characterAvatar) {
        characterAvatar.src = '../../男主.png';
        characterAvatar.alt = '主角头像';
      }
      if (characterAvatarContainer) characterAvatarContainer.style.display = 'block';
    } else if (currentName === 'A' || currentName === '芳乃') {
      // 学姐：显示学姐头像
      displayName = '学姐';
      if (characterAvatar) {
        characterAvatar.src = '../../学姐.png';
        characterAvatar.alt = '学姐头像';
      }
      if (characterAvatarContainer) characterAvatarContainer.style.display = 'block';
    } else {
      // 其他角色：隐藏头像
      if (characterAvatarContainer) characterAvatarContainer.style.display = 'none';
    }

    nameBox.textContent = displayName;
  }

  typeText(dialogues[index].text, () => {
    if (index === 999) autoSave();
    if (index === 999) setTimeout(showChoices, 500);
  });
}

// -------------------- 下一句 --------------------
function handleNext() {
  if (charIndex < (dialogues[index]?.text.length || 0)) {
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = dialogText.textContent.length;
    if (index === 999) setTimeout(showChoices, 500);
  } else {
      if (index < dialogues.length - 1) {
        showDialogue(index + 1);
      } else {
        // 游戏结束，显示提示而不跳转
        document.body.classList.add("fade-out");
        setTimeout(() => {
          window.location.href = "../storypage2.0 与学姐好感度足够  2选择了2 1/storypage.html";
        }, 1000);
      }
    }
  stopAutoPlay();
}

// -------------------- 上一句 --------------------
function handlePrev() {
  showDialogue(index - 1);
  stopAutoPlay();
}

// -------------------- 加速 --------------------
function toggleSpeed() {
  isFast = !isFast;
  typingSpeed = isFast ? 10 : 50;
  if (speedBtn) speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
}

// -------------------- 跳过 --------------------
function handleSkip() {
  clearInterval(typingInterval);
  if (dialogText) dialogText.textContent = dialogues[index].text;
  charIndex = dialogText.textContent.length;
  stopAutoPlay();
}

// -------------------- 自动播放 --------------------
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
    if (charIndex < (dialogues[index]?.text.length || 0)) {
      clearInterval(typingInterval);
      if (dialogText) dialogText.textContent = dialogues[index].text;
      charIndex = dialogText.textContent.length;
    } else {
      if (index < dialogues.length - 1) showDialogue(index + 1);
      else {
        // 游戏结束，显示提示而不跳转
        document.body.classList.add("fade-out");
        setTimeout(() => {
          window.location.href = "../storypage2.0 与学姐好感度足够  2选择了2 1/storypage.html";
        }, 1000);
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

// -------------------- 选择框 --------------------
function showChoices() {
  if (choiceContainer) choiceContainer.classList.remove("hidden");
  if (dialogBox) dialogBox.style.display = "none";
  clearInterval(typingInterval);
  clearInterval(autoInterval);
  isChoiceActive = true;
}

function hideChoices() {
  if (choiceContainer) choiceContainer.classList.add("hidden");
  if (dialogBox) dialogBox.style.display = "block";
  isChoiceActive = false;
}

function handleChoice(event) {
  const choice = event.currentTarget.dataset.choice;
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
}

// -------------------- 好感度系统 --------------------
const affectionData = { fang: 50, other: 30 };

function updateAffection(character, value) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  if (bar) {
    const text = bar.parentElement.querySelector('.affection-text');
    bar.style.width = `${affectionData[character]}%`;
    if (text) text.textContent = `${character === 'fang' ? '芳乃' : '其他'}: ${affectionData[character]}%`;
  }
  localStorage.setItem('affectionData', JSON.stringify(affectionData));
}

function initAffection() {
  const savedData = localStorage.getItem('affectionData');
  if (savedData) Object.assign(affectionData, JSON.parse(savedData));
  for (const [character, value] of Object.entries(affectionData)) updateAffection(character, value);
}

// -------------------- 绑定控制按钮 --------------------
function bindControlButtons() {
  // -------------------- 下一句按钮 --------------------
  if (nextBtn) {
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    newNextBtn.addEventListener("click", handleNext);
  }

  // -------------------- 上一句按钮 --------------------
  if (prevBtn) {
    const newPrevBtn = prevBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    newPrevBtn.addEventListener("click", handlePrev);
  }

  // -------------------- 加速按钮 --------------------
  if (speedBtn) {
    const newSpeedBtn = speedBtn.cloneNode(true);
    speedBtn.parentNode.replaceChild(newSpeedBtn, speedBtn);
    newSpeedBtn.addEventListener("click", toggleSpeed);
  }

  // -------------------- 跳过按钮 --------------------
  if (skipBtn) {
    const newSkipBtn = skipBtn.cloneNode(true);
    skipBtn.parentNode.replaceChild(newSkipBtn, skipBtn);
    newSkipBtn.addEventListener("click", handleSkip);
  }

  // -------------------- 自动播放按钮 --------------------
  if (autoBtn) {
    const newAutoBtn = autoBtn.cloneNode(true);
    autoBtn.parentNode.replaceChild(newAutoBtn, autoBtn);
    newAutoBtn.addEventListener("click", toggleAutoPlay);
  }

  // -------------------- 选择按钮 --------------------
  if (choiceBtns) {
    choiceBtns.forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", handleChoice);
    });
  }

  // -------------------- 音乐控制 --------------------
    // 创建音频元素并自动播放Spring.mp3
    const bgAudio = document.createElement("audio");
    bgAudio.src = "../../audio/Spring.mp3";
    bgAudio.loop = true;
    bgAudio.autoplay = true;
    bgAudio.volume = volumeRange ? (volumeRange.value / 100) : 0.5;
    bgAudio.style.display = "none";
    document.body.appendChild(bgAudio);
    if (volumeRange) {
      // 初始化滑块为音量值
      volumeRange.value = Math.round(bgAudio.volume * 100);
      volumeRange.addEventListener("input", () => {
        bgAudio.volume = volumeRange.value / 100;
      });
    }

    if (musicBtn) {
      musicBtn.addEventListener("click", () => {
        if (bgAudio.paused) {
          bgAudio.play();
          musicBtn.textContent = "音乐暂停";
        } else {
          bgAudio.pause();
          musicBtn.textContent = "音乐播放";
        }
      });
    }
  // -------------------- 侧边栏 --------------------
  if (toggleBtn) {
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
    newToggleBtn.addEventListener("click", () => {
      if (sidebar) sidebar.classList.toggle("show");
    });
  }

  // -------------------- 存档按钮 --------------------
  if (saveBtn) {
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.addEventListener("click", saveGame);
  }

  // -------------------- 读档按钮 --------------------
  if (loadBtn) {
    const newLoadBtn = loadBtn.cloneNode(true);
    loadBtn.parentNode.replaceChild(newLoadBtn, loadBtn);
    newLoadBtn.addEventListener("click", () => window.location.href = "../../savepage/savepage2.0/save.htm");
  }
}

// 获取 body 背景图片的绝对路径
function getBodyBackgroundAbsoluteUrl() {
  const bg = window.getComputedStyle(document.body).backgroundImage; 
  // bg 可能是 'url("images/bg1.png")' 或者 'none'
  if (!bg || bg === "none") return null;

  // 去掉 url("") 包裹
  let url = bg.slice(4, -1).replace(/["']/g, "");

  // 转成绝对路径
  const absoluteUrl = new URL(url, window.location.href).href;
  return absoluteUrl;
}

const bodyBg = getBodyBackgroundAbsoluteUrl();

// -------------------- 存档 --------------------
function saveGame() {
  // 读现有存档数组
  const saves = JSON.parse(localStorage.getItem("storySaves") || "[]");

  // 规范化 scene：优先使用 pathname，但如果是 file:// (本地) 去掉驱动器前缀
  let scene = window.location.pathname.startsWith("/") ? window.location.pathname : "/" + window.location.pathname;

  // 如果是在本地打开（file:），去掉像 "/D:" 的前缀，保留后面的路径
  if (window.location.protocol === "file:") {
    scene = scene.replace(/^\/[A-Za-z]:/, ""); // "/D:/.../coser/index.html" -> "/.../coser/index.html"
    if (!scene.startsWith("/")) scene = "/" + scene;
  }

  // 构建存档对象
  const saveData = {
    scene: scene,
    branch: "common",
    dialogueIndex: index || 0,
    affectionData: { ...affectionData },
    background: bodyBg,  // 保存背景图
    timestamp: Date.now()
  };
  console.log("存档进度：", saveData);

  saves.push(saveData);
  localStorage.setItem("storySaves", JSON.stringify(saves));

  console.log("存档已写入：", saveData);
  alert("游戏已存档！");

  // 显示存档提示
  if (autoSaveNotice) {
    autoSaveNotice.classList.remove("hidden");
    autoSaveNotice.classList.add("show");
    setTimeout(() => {
      autoSaveNotice.classList.remove("show");
      autoSaveNotice.classList.add("hidden");
    }, 1500);
  }

  // 仅在 initSaveUI 存在的情况下调用（避免 ReferenceError）
  if (typeof initSaveUI === "function") {
    initSaveUI();
  }
}

// -------------------- 自动存档 --------------------
function autoSave() {
  const saveIndex = (choiceContainer && !choiceContainer.classList.contains("hidden")) ? 3 : index;
  const saveData = {
    page: "storyPage1",
    dialogueIndex: saveIndex,
    charIndex: charIndex,
    background: bodyBg,
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

// -------------------- 空格和点击触发下一句 --------------------
// 空格键触发下一句
window.addEventListener('keydown', (e) => {
  // 只有在空格键被按下且选择框未激活时才触发
  if (e.code === 'Space' && !isChoiceActive) {
    e.preventDefault(); // 阻止默认行为，避免页面滚动
    // 调用处理函数
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
      !e.target.closest('#chat-input')) {
    // 调用处理函数
    handleNext();
  }
});
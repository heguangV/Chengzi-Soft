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

// -------------------- 自动存档 ----------
const autoSaveNotice = document.getElementById("auto-save-notice");

// 自动存档函数
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

  // 显示右上角提示
  autoSaveNotice.classList.remove("hidden");
  autoSaveNotice.classList.add("show");

  setTimeout(() => {
    autoSaveNotice.classList.remove("show");
    autoSaveNotice.classList.add("hidden");
  }, 1500);
}


// -------------------- 存档 --------------------
const saveBtn = document.getElementById("save-btn"); // HTML 已有
const loadBtn = document.getElementById("load-btn"); // HTML 已有

saveBtn.addEventListener("click", () => {
  const saveIndex = !choiceContainer.classList.contains("hidden") ? 3 : index;//如果是在选项框存档，存到引发选项框的那个台词
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

// -------------------- 读档 --------------------
loadBtn.addEventListener("click", () => {
  // 跳转到已有存档页面
  window.location.href = "load.html";
});


// -------------------- 剧情控制 --------------------
const dialogues = [
  { name: "学姐", text: "欢迎来到穗织镇，春天的阳光真好。" },
  { name: "学姐", text: "我是学姐，这里是我成长的地方。" },
  { name: "学姐", text: "今天，你将开始一段难忘的冒险。" },
  { name: "学姐", text: "你准备好了吗？" }
];

const dialogText = document.getElementById("dialog-text");
const nameBox = document.querySelector(".character-name");

const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const speedBtn = document.getElementById("speed-btn");
const skipBtn = document.getElementById("skip-btn");
const autoBtn = document.getElementById("auto-btn");

// 状态变量
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;

let autoPlay = false;
let autoInterval = null;

// -------------------- 打字机效果 --------------------
function typeText(text, callback) { // ✅ 修改：增加 callback
  clearInterval(typingInterval);
  charIndex = 0;
  dialogText.textContent = "";

  typingInterval = setInterval(() => {
    dialogText.textContent += text[charIndex];
    charIndex++;
    if (charIndex >= text.length) {
      clearInterval(typingInterval);
      if (callback) callback(); // ✅ 修改：文字打完后调用回调
    }
  }, typingSpeed);
}

// -------------------- 显示某条对话 --------------------
function showDialogue(idx) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;

  nameBox.textContent = dialogues[index].name;

  typeText(dialogues[index].text, () => { // ✅ 修改：传入回调
    
    if (index === 1) { // 当走到第二句台词自动存档
      autoSave();
    }
    // ✅ 修改：文字打完后再判断是否显示选择框
    if (index === 3) { 
      setTimeout(showChoices, 500);
    }
  });
}

// -------------------- 下一句按钮 --------------------
nextBtn.addEventListener("click", () => {
  if (charIndex < dialogues[index].text.length) {
    // 打字机没打完，直接显示完整文字
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length; // ✅ 标记已经完成
    // 如果这一句有选择框逻辑
    if (index === 3) { 
      setTimeout(showChoices, 500);
    }
  } else {
    // 下一句
    if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    }
  }
  stopAutoPlay();
});

// -------------------- 点击屏幕任意位置执行下一句 --------------------
document.body.addEventListener("click", (e) => {
  // 排除点击对话框按钮、侧边栏和选择框等区域
  const target = e.target;
  if (
    target.closest(".dialog-controls") || // 对话控制按钮
    target.closest("#sidebar") ||        // 侧边栏
    target.closest("#choice-container")  // 选择框
  ) {
    return; // 点击这些元素时不触发下一句
  }

  // 直接触发“下一句”按钮的点击逻辑
  nextBtn.click();
});

// -------------------- 上一句按钮 --------------------
prevBtn.addEventListener("click", () => {
  showDialogue(index - 1);
  stopAutoPlay();
});

// -------------------- 加速按钮 --------------------
let isFast = false;

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

// -------------------- 选择框 ------------------------
const choiceContainer = document.getElementById("choice-container");
const choiceBtns = document.querySelectorAll(".choice-btn");
const dialogBox = document.querySelector(".dialog-box"); // 获取对话框

function showChoices() {
  choiceContainer.classList.remove("hidden");
  dialogBox.style.display = "none"; // ✅ 隐藏对话框
  clearInterval(typingInterval);
  clearInterval(autoInterval);
}

function hideChoices() {
  choiceContainer.classList.add("hidden");
  dialogBox.style.display = "block"; // ✅ 显示对话框
}
// 页面加载完成后淡入
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});

// 修改选择按钮点击逻辑，加动画跳转
choiceBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const choice = btn.dataset.choice;
    hideChoices();

    if (choice === "A") {
      // 淡出动画后跳转
      document.body.classList.remove("fade-in");
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "../galStorypage2/storypage.html";
      }, 500); // 与 CSS 动画时长一致
    } else if (choice === "B") {
      showDialogue(index + 2);
    } else {
      showDialogue(index + 3);
    }
  });
});

// 可选：主菜单按钮也加淡出动画
const mainMenuBtn = document.getElementById("main-menu-btn");
mainMenuBtn.addEventListener("click", () => {
  document.body.classList.remove("fade-in");
  document.body.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 500);
});

// -------------------- 初始化 --------------------
showDialogue(0);

// 添加键盘事件监听器，支持空格键下一句
document.addEventListener('keydown', (event) => {
  // 检查是否按下了空格键
  if (event.code === 'Space') {
    // 阻止默认的空格键行为（页面滚动）
    event.preventDefault();
    
    // 如果打字机效果还在进行中，直接显示完整文本
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      dialogText.textContent = dialogues[index].text;
      charIndex = dialogues[index].text.length;
    } else {
      // 否则进入下一句
      if (index < dialogues.length - 1) {
        showDialogue(index + 1);
      }
    }
  }
  
  // 可选：添加其他快捷键支持
  // 左箭头键：上一句
  if (event.code === 'ArrowLeft') {
    event.preventDefault();
    if (index > 0) {
      showDialogue(index - 1);
    }
  }
  
  // 右箭头键：下一句
  if (event.code === 'ArrowRight') {
    event.preventDefault();
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      dialogText.textContent = dialogues[index].text;
      charIndex = dialogues[index].text.length;
    } else {
      if (index < dialogues.length - 1) {
        showDialogue(index + 1);
      }
    }
  }
});
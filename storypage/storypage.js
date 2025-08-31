// 音乐控制
const musicBtn = document.getElementById("music-btn");
const bgMusic = document.getElementById("bg-music");

const volumeRange = document.getElementById("volume-range");

volumeRange.addEventListener("input", () => {
  bgMusic.volume = volumeRange.value / 100; // 将 0-100 转换成 0-1
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

// 侧边栏控制
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

// 剧情内容
const dialogues = [
  { name: "芳乃", text: "欢迎来到穗织镇，春天的阳光真好。" },
  { name: "芳乃", text: "我是芳乃，这里是我成长的地方。" },
  { name: "芳乃", text: "今天，你将开始一段难忘的冒险。" },
  { name: "芳乃", text: "你准备好了吗？" }
];

const dialogText = document.getElementById("dialog-text");
const nameBox = document.querySelector(".character-name");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const speedBtn = document.getElementById("speed-btn");
const skipBtn = document.getElementById("skip-btn");

let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;

// 打字机效果
function typeText(text) {
  clearInterval(typingInterval);
  charIndex = 0;
  dialogText.textContent = "";
  typingInterval = setInterval(() => {
    dialogText.textContent += text[charIndex];
    charIndex++;
    if (charIndex >= text.length) {
      clearInterval(typingInterval);
    }
  }, typingSpeed);
}

// 显示对话
function showDialogue(idx) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;
  nameBox.textContent = dialogues[index].name;
  typeText(dialogues[index].text);
}

// 下一句
nextBtn.addEventListener("click", () => {
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
  } else {
    showDialogue(index + 1);
  }
});

// 上一句
prevBtn.addEventListener("click", () => {
  showDialogue(index - 1);
});

// 加速
speedBtn.addEventListener("click", () => {
  typingSpeed = typingSpeed === 50 ? 10 : 50;
  showDialogue(index);
});

// 跳过
skipBtn.addEventListener("click", () => {
  clearInterval(typingInterval);
  dialogText.textContent = dialogues[index].text;
});

// 初始化
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
      showDialogue(index + 1);
    }
  }
  
  // 可选：添加其他快捷键支持
  // 左箭头键：上一句
  if (event.code === 'ArrowLeft') {
    event.preventDefault();
    showDialogue(index - 1);
  }
  
  // 右箭头键：下一句
  if (event.code === 'ArrowRight') {
    event.preventDefault();
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      dialogText.textContent = dialogues[index].text;
      charIndex = dialogues[index].text.length;
    } else {
      showDialogue(index + 1);
    }
  }
});
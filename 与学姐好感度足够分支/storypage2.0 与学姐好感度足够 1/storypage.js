window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});

// -------------------- DOM 元素 --------------------
const dialogText = document.getElementById("dialog-text");
const nameBox = document.querySelector(".character-name");
const characterAvatar = document.getElementById("character-avatar");
const avatarContainer = document.querySelector(".character-avatar");

const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const speedBtn = document.getElementById("speed-btn");
const skipBtn = document.getElementById("skip-btn");
const autoBtn = document.getElementById("auto-btn");

const choiceContainer = document.getElementById("choice-container");
const choiceBtns = document.querySelectorAll(".choice-btn");
const dialogBox = document.querySelector(".dialog-box");

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
let isChoiceActive = false; // 新增：标记选择是否激活

// -------------------- 剧情控制 --------------------
const dialogues = [
  { name: "C", text: "时间飞逝 今天好像就是之前约定好的学姐离开的日子" },
  { name: "C", text: "你看着晚霞映红的天花板发呆 手机中打开着的是学姐的对话框 忽然 手机振动了一下" },
  { name: "A", text: "怎么不来送送我！我还在校门口等你呢（颜文字：生气）" },
  { name: "C", text: "你从恍然中惊醒 从床上爬起来 慌乱间披上了件外套 向校门口飞奔而去。"},
  { name: "B", text: "本来便不擅长跑步 又由于一学期没选上体育课 只感觉自己的双腿越发酸痛 呼吸也变得越发急促" },
  { name: "B", text: "忽然 你只感觉一阵柔和的风从身后吹过 你身上的痛苦好像在风的吹拂中烟消云散 你不由得加快了脚步 终于看到了在门口等候的学姐" },
  { name: "C", text: "你来到了学姐身边 但即将离开的学姐脸上却是一幅复杂的申请 一时间 你们两个人竟都想不出来如何开口 空气仿佛都已经凝固在了这一刻" },
  { name: "A", text: "看着你被汗水打湿的 亦或是被风吹乱的刘海 自然地伸出手 帮你梳理整齐" },
  { name: "B", text: "你看着学姐的手 心里闪回着与学姐间的点点滴滴 虽然时间不长 但这一份回忆已经要比天边的那一抹骄阳还要炽热 看着眼前这幅即将离自己远去的脸 不由得心头一紧" },
  { name: "B", text: " ", hasChoice: true, choiceType: "final" }, // 添加choiceType标记为最终选择
];

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

// -------------------- 显示某条对话 --------------------
function showDialogue(idx) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;

  // 获取当前对话的名称
  let currentName = dialogues[index].name;
  let displayName = currentName;
  
  // 根据name值修改显示名称和头像
  if (currentName === 'C') {
    displayName = '旁白';
    avatarContainer.style.display = 'none';
  } else if (currentName === 'B') {
    displayName = '主角';
    characterAvatar.src = '../../男主.png';
    characterAvatar.alt = '主角头像';
    avatarContainer.style.display = 'block';
  } else if (currentName === 'A' || currentName.includes('学姐')) {
    displayName = '学姐';
    characterAvatar.src = '../../学姐.png';
    characterAvatar.alt = '学姐头像';
    avatarContainer.style.display = 'block';
  } else {
    avatarContainer.style.display = 'none';
  }
  
  nameBox.textContent = displayName;

  typeText(dialogues[index].text, () => {
    if (index === 999) autoSave();
    
    // 检查是否是选择对话
    if (dialogues[index].hasChoice) {
      console.log(`检测到选择对话，索引: ${index}`);
      // 强制显示选择框并阻止剧情推进
      forceShowChoices();
    }
  });
}

// -------------------- 强制显示选择框 --------------------
function forceShowChoices() {
  console.log("强制显示选择框并阻止剧情推进");
  
  // 设置选择状态为激活
  isChoiceActive = true;
  
  // 显示选择框
  choiceContainer.classList.remove("hidden");
  choiceContainer.style.display = "flex";
  
  // 设置选择按钮文本
  if (index === 9) {
    choiceBtns[0].textContent = "1. 抓住学姐的手";
    choiceBtns[1].textContent = "2. 默默看着学姐";
    choiceBtns[2].style.display = "none"; // 隐藏第三个选项
  }
  
  // 隐藏对话框和控制按钮
  dialogBox.style.display = "none";
  document.querySelector(".control-images").style.display = "none";
  
  // 清除所有定时器
  clearInterval(typingInterval);
  clearInterval(autoInterval);
  stopAutoPlay();
  
  // 禁用侧边栏功能防止跳过选择
  toggleBtn.style.pointerEvents = "none";
}

// -------------------- 隐藏选择框 --------------------
function hideChoices() {
  isChoiceActive = false;
  choiceContainer.classList.add("hidden");
  choiceContainer.style.display = "none";
  dialogBox.style.display = "block";
  document.querySelector(".control-images").style.display = "flex";
  toggleBtn.style.pointerEvents = "auto";
}

// -------------------- 下一句按钮 --------------------
nextBtn.addEventListener("click", () => {
  // 如果选择框激活，阻止剧情推进
  if (isChoiceActive) {
    console.log("选择框激活中，无法推进剧情");
    return;
  }
  
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
  } else {
    if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } 
  }
  stopAutoPlay();
});

// -------------------- 上一句按钮 --------------------
prevBtn.addEventListener("click", () => {
  showDialogue(index - 1);
  stopAutoPlay();
});

// -------------------- 加速按钮 --------------------
speedBtn.addEventListener("click", () => {
  isFast = !isFast;
  typingSpeed = isFast ? 10 : 50;
  speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(index);
});

// -------------------- 跳过按钮 --------------------
choiceBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (!isChoiceActive) return; // 如果选择框未激活，不处理点击
    
    const choice = btn.dataset.choice;
    console.log("玩家选择了:", choice);
    
    // 根据选择进行跳转
    if (index === 9) {
      hideChoices();
      
      if (choice === "A") {
        // 选择1：抓住学姐的手
        // 请替换为实际的文件路径
        document.body.classList.add("fade-out");
        setTimeout(() => {
          window.location.href = "../storypage2.0 与学姐好感度足够  1选择了1 1/storypage.html";
        }, 1000);
      } else if (choice === "B") {
        // 选择2：默默看着学姐
        // 请替换为实际的文件路径
        document.body.classList.add("fade-out");
        setTimeout(() => {
          window.location.href = "../storypage2.0 与学姐好感度足够  1选择了2 1/storypage.html";
        }, 1000);
      }
    }
  });
});

// -------------------- 自动播放按钮 --------------------
autoBtn.addEventListener("click", () => {
  // 如果选择框激活，阻止自动播放
  if (isChoiceActive) {
    console.log("选择框激活中，无法自动播放");
    return;
  }
  
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
    // 如果选择框激活，停止自动播放
    if (isChoiceActive) {
      stopAutoPlay();
      return;
    }
    
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      dialogText.textContent = dialogues[index].text;
    } else {
      if (index < dialogues.length - 1) showDialogue(index + 1);
      else stopAutoPlay();
    }
  }, 2000);
}

// -------------------- 跳过按钮 --------------------
skipBtn.addEventListener("click", () => {
  // 如果选择框激活，阻止跳过
  if (isChoiceActive) {
    console.log("选择框激活中，无法跳过");
    return;
  }
  
  clearInterval(typingInterval);
  dialogText.textContent = dialogues[index].text;
  stopAutoPlay();
});

// -------------------- 音乐控制 --------------------
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
toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

// -------------------- 自动存档 --------------------
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

  autoSaveNotice.classList.remove("hidden");
  autoSaveNotice.classList.add("show");

  setTimeout(() => {
    autoSaveNotice.classList.remove("show");
    autoSaveNotice.classList.add("hidden");
  }, 1500);
}

// -------------------- 存档 --------------------
saveBtn.addEventListener("click", () => {
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
  alert("已存档！");
});

// -------------------- 读档 --------------------
loadBtn.addEventListener("click", () => {
  window.location.href = "load.html";
});

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

// -------------------- 初始化 --------------------
initAffection();
showDialogue(0);
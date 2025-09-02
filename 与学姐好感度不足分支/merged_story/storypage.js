window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
  
  // 初始化好感度系统
  initAffection();
  
  // 显示初始对话
  showDialogue(0);
  
  // 添加空格键和鼠标点击实现下一句的功能
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      triggerNextDialogue();
    }
  });
  
  document.addEventListener("click", (e) => {
    if (!e.target.closest("button") && !e.target.closest(".control-img") && 
        !e.target.closest("#sidebar") && !e.target.closest("#sidebar-toggle") &&
        !e.target.closest("#special-item")) {
      triggerNextDialogue();
    }
  });
});

// DOM元素
const musicBtn = document.getElementById("music-btn");
// 背景音乐文件暂未提供，注释掉相关代码
// const bgMusic = document.getElementById("bg-music");
const volumeRange = document.getElementById("volume-range");
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");
const mainMenuBtn = document.getElementById("main-menu-btn");
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
const specialItem = document.getElementById("special-item");
const autoSaveNotice = document.getElementById("auto-save-notice");
const phoneImage = document.getElementById("phone-image");

// 状态变量
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;
let autoPlay = false;
let autoInterval = null;
let isFast = false;
let waitingForItem = false;
let isSpecialItemClicked = false;

// 好感度数据
let affectionData = { fang: 50, other: 30 };

// 合并所有剧情对话 - 按照文件夹名称顺序排列
const dialogues = [
  { name: "旁白", text: "一学期的大学生活，如同被风吹散的云烟，在不知不觉中走到了学姐约定的分别时刻" },
  { name: "旁白", text: "你的手机屏幕映出一片淡淡的白光，反射在天花板上，与傍晚的晚霞交织在一起。" },
  { name: "旁白", text: "你就这样看着天花板发呆，思绪纷飞。" },
  { name: "旁白", text: "你一个学期就这样过去了。很忙，却又说不上忙了些什么。" },
  { name: "旁白", text: "你努力回想，这一学期究竟有什么值得留恋的瞬间。" },
  { name: "旁白", text: "除了和青梅的时光，似乎就只有学姐的存在让你记得。" },
  { name: "B", text: "学姐就要走了啊。" },
  { name: "B", text: "我真的很喜欢学姐……但她对我，大概只是普通朋友的态度吧。" },
  { name: "B", text: "要分别了……我该向她表白吗？" },
  { name: "B", text: "会不会……学姐也对我有一点点意思呢？" },
  { name: "B", text: "哈哈，别傻了，现实哪有动漫里那么美好的双向奔赴。" },
  { name: "B", text: "我……真的舍不得她。" },
  { name: "B", text: "不过，就这样下去，也许挺好的，朋友以上恋人未满的状态。" },
  { name: "B", text: "是啊，就算表白成功了，真的在一起，异地恋也撑不了多久，我们也没什么情感基础……"},
  { name: "B", text: "学姐以后肯定也很忙没什么精力谈恋爱吧……"},
  { name: "B", text: "你想到了你有很多的朋友，高中毕业表白之后，大学异地恋，没过多久就分手了，十分痛苦。" },
  { name: "B", text: "异地对于没有情感基础的情侣来说还是太难。" },
  { name: "B", text: "而且学姐对我并不是那么喜欢。" },
  { name: "C", text: "想到这些，你的心里已经开始打退堂鼓。" },
  { name: "C", text: "思绪乱成一锅粥，矛盾与犹豫交织在脑海里。" },
  { name: "C", text: "最终你想到一个办法：还是看学姐的反应。" },
  { name: "B", text: "如果她来向我表白了，那我当然接受。" },
  { name: "B", text: "但是如果她没向我表白，那也就说明她对我并不是那么不舍了吧。" },
  { name: "B", text: "那我也就不必去表白了。" },
  // 好感度不足1的剧情
  { name: "B", text: "可……这样我真的不会后悔吗？" },
  { name: "B", text: "人怎么会这么矛盾呢……" },
  { name: "C", text: "忽然，手机轻轻振动了一下。" },
  { name: "C", text: "你拿起手机，屏幕上是一条简短的消息：" },
  { name: "A", text: "“再见啦，学弟君~ 我已经在去机场的车上咯~ 以后有时间可以来看我的演出哦，我会为你留特等席的 (＾▽＾) ”" },
  { name: "C", text: "你盯着屏幕，回忆着一个学期中与学姐共同度过的点滴时光。" },
  { name: "C", text: "虽然琐碎，却也温暖而美好。" },
  { name: "C", text: "你想到这些，迅速的打出了一句：学姐我还有很多话想和你说" },
  { name: "C", text: "可你又想到了被拒绝之后的种种可能，又或是异地恋的各种可能，慢慢地将那句未发的消息删去了" },
  
  // 好感度不足2的剧情
   { name: "B", text: "就这样吧。作为朋友，我以后还是能见到学姐，还是能看她的演出。" },
  { name: "B", text: "如果捅破了这一层纱窗，可能什么都不剩了……" },
  { name: "B", text: "要是被拒绝了，我也许连出现在她的世界里都不应该了吧……" },
  { name: "B", text: "你像是下定了某种决心" },
  { name: "B", text: "你在手机上打出：“再见，你也要保重。”" },
  { name: "B", text: "最终你按下了发送键" },
  // 好感度不足5的剧情
  { name: "B", text: "唉……" },
  { name: "B", text: "稍微有些难过。" },
  { name: "B", text: "好像尘埃落定了。虽然有些遗憾，但……也未必不好。" },
  { name: "B", text: "也许……一辈子都不会忘记她吧。" },
  { name: "C", text: "思绪渐渐飘远，世界的色彩慢慢褪去，屏幕的光映照下，一切都化作苍白。" },
  { name: "BE", text: "此情可待成追忆，只是当时已惘然。" },
];

// 触发下一句的统一函数
function triggerNextDialogue() {
  if (waitingForItem) return;
  
  if (charIndex < dialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
    
    if (shouldShowSpecialItem()) {
      specialItem.classList.remove("hidden");
      waitingForItem = true;
    }
  } else {
    if (index < dialogues.length - 1) {
      showDialogue(index + 1);
    } else {
      alert("游戏结束");
    }
  }
  stopAutoPlay();
}

// 特殊物品显示判断
function shouldShowSpecialItem() {
  return index === 10 && !isSpecialItemClicked;
}

// 特殊物品点击事件
if (specialItem) {
  specialItem.addEventListener("click", () => {
    alert("你获得了特殊物品！");
    specialItem.classList.add("hidden");
    waitingForItem = false;
    isSpecialItemClicked = true;
    showDialogue(index + 1);
  });
}

// 打字机效果
function typeText(text, callback) {
  clearInterval(typingInterval);
  charIndex = 0;
  dialogText.textContent = "";

  typingInterval = setInterval(() => {
    if (charIndex < text.length) {
      dialogText.textContent += text[charIndex];
      charIndex++;
    }
    
    if (charIndex >= text.length) {
      clearInterval(typingInterval);
      if (callback) callback();
      
      // 检查是否需要显示特殊物品
      if (shouldShowSpecialItem()) {
        specialItem.classList.remove("hidden");
        waitingForItem = true;
      }
    }
  }, typingSpeed);
}

// 显示对话
function showDialogue(idx) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;

  let displayName = dialogues[index].name;
  if (displayName === 'C') {
    displayName = '旁白';
    avatarContainer.style.display = 'none';
  } else if (displayName === 'B') {
    displayName = '主角';
    avatarImg.src = '../../男主.png';
    avatarContainer.style.display = 'block';
  } else if (displayName.includes('学姐')) {
    avatarImg.src = '../../学姐.png';
    avatarContainer.style.display = 'block';
  } else if (displayName === 'BE') {
    displayName = '结局';
    avatarContainer.style.display = 'none';
  } else {
    avatarContainer.style.display = 'none';
  }

  // 确保手机图像常驻显示在右上方并避免与好感度重合
  if (phoneImage) {
    phoneImage.style.position = 'fixed';
    phoneImage.style.top = '100px';
    phoneImage.style.right = '20px';
    phoneImage.style.zIndex = '100';
  }

  nameBox.textContent = displayName;
  typeText(dialogues[index].text);
  
  if (index % 10 === 0) {
    autoSave();
  }
}

// 按钮事件处理
if (nextBtn) {
  nextBtn.addEventListener("click", triggerNextDialogue);
}

if (prevBtn) {
  prevBtn.addEventListener("click", () => { 
    showDialogue(index - 1); 
    stopAutoPlay(); 
  });
}

if (speedBtn) {
  speedBtn.addEventListener("click", () => {
    isFast = !isFast;
    typingSpeed = isFast ? 10 : 50;
    // 修改按钮图片而不是文本
    speedBtn.src = isFast ? "images/jiasu-active.png" : "images/jiasu.png";
    showDialogue(index);
  });
}

if (skipBtn) {
  skipBtn.addEventListener("click", () => {
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
    stopAutoPlay();
  });
}

if (autoBtn) {
  autoBtn.addEventListener("click", () => {
    autoPlay = !autoPlay;
    if (autoPlay) {
      // 修改按钮图片而不是文本
      autoBtn.src = "images/zidong-active.png";
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
  });
}

function startAutoPlay() {
  clearInterval(autoInterval);
  autoInterval = setInterval(() => {
    if (waitingForItem) return;
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      dialogText.textContent = dialogues[index].text;
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
  // 恢复自动播放按钮图片
  if (autoBtn) autoBtn.src = "images/zidong.png";
}

// 音乐控制 - 背景音乐文件暂未提供
if (volumeRange) {
  volumeRange.addEventListener("input", () => { 
    // 音量控制暂时禁用
  });
}

if (musicBtn) {
  musicBtn.addEventListener("click", () => {
    // 切换按钮文本以表示功能
    const isPlaying = musicBtn.textContent === "音乐暂停";
    musicBtn.textContent = isPlaying ? "音乐播放" : "音乐暂停";
  });
}

// 侧边栏控制
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => { 
    sidebar.classList.toggle("show"); 
  });
}

if (mainMenuBtn) {
  mainMenuBtn.addEventListener("click", () => { 
    alert("返回主菜单"); 
  });
}

// 自动存档
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

  if (autoSaveNotice) {
    autoSaveNotice.classList.remove("hidden");
    autoSaveNotice.classList.add("show");

    setTimeout(() => {
      autoSaveNotice.classList.remove("show");
      autoSaveNotice.classList.add("hidden");
    }, 1500);
  }
}

// 存档/读档
if (saveBtn) {
  saveBtn.addEventListener("click", autoSave);
}

if (loadBtn) {
  loadBtn.addEventListener("click", () => { 
    alert("读档功能"); 
  });
}

// 选择框
function showChoices() {
  choiceContainer.classList.remove("hidden");
  dialogBox.style.display = "none";
  stopAutoPlay();
  clearInterval(typingInterval);
}

function hideChoices() {
  choiceContainer.classList.add("hidden");
  dialogBox.style.display = "block";
}

if (choiceBtns && choiceBtns.length > 0) {
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

// 好感度系统
function updateAffection(character, value) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  if (bar) {
    const text = bar.parentElement.querySelector('.affection-text');
    bar.style.width = `${affectionData[character]}%`;
    if (text) {
      text.textContent = `${character === 'fang' ? '芳乃' : '其他'}: ${affectionData[character]}%`;
    }
    localStorage.setItem('affectionData', JSON.stringify(affectionData));
  }
}

function initAffection() {
  const savedData = localStorage.getItem('affectionData');
  if (savedData) {
    try {
      Object.assign(affectionData, JSON.parse(savedData));
    } catch (e) {
      console.error("Error parsing affection data:", e);
    }
  }
  
  for (const [character, value] of Object.entries(affectionData)) {
    updateAffection(character, value);
  }
}
// -------------------- 图片错误处理 --------------------
function handleImageError(img, type) {
  console.error('图片加载失败:', img.src);
  switch(type) {
    case 'background':
      img.style.backgroundColor = '#87CEEB';
      img.alt = '默认背景';
      break;
    case 'character':
      img.style.backgroundColor = '#f0f0f0';
      img.style.border = '2px dashed #ccc';
      img.style.padding = '20px';
      break;
    case 'dialog':
      img.parentElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      break;
    case 'control':
      img.style.backgroundColor = '#eee';
      img.style.border = '1px solid #999';
      img.style.borderRadius = '5px';
      break;
  }
}

function handleBgError(element) {
  console.error('好感度背景图片加载失败');
  element.style.backgroundColor = 'rgba(255, 192, 203, 0.3)';
}

function handleAudioError() {
  console.warn('背景音乐加载失败');
}

// 初始化时检查图片
function checkImages() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.complete || img.naturalHeight === 0) {
      console.warn('图片可能未加载:', img.src);
      if (img.classList.contains('background-img')) {
        handleImageError(img, 'background');
      } else if (img.classList.contains('character-img')) {
        handleImageError(img, 'character');
      } else if (img.classList.contains('dialog-img')) {
        handleImageError(img, 'dialog');
      } else if (img.classList.contains('control-img')) {
        handleImageError(img, 'control');
      }
    }
  });
}

// -------------------- DOM 元素 --------------------
const dialogText = document.getElementById("dialog-text");
const nameBox = document.getElementById("speaker-name");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const speedBtn = document.getElementById("speed-btn");
const skipBtn = document.getElementById("skip-btn");
const autoBtn = document.getElementById("auto-btn");
const choiceContainer = document.getElementById("choice-container");
const choiceBtns = document.querySelectorAll(".choice-btn");
const dialogBox = document.querySelector(".dialog-box");
const senpaiImg = document.getElementById("senpai-img");
const friendImg = document.getElementById("friend-img");
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

// -------------------- 状态变量 --------------------
let currentBranch = 'common';
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;
let autoPlay = false;
let autoInterval = null;
let isFast = false;
let hasMadeChoice = false;

const affectionData = {
  senpai: 0
};

// -------------------- 剧情台词 --------------------
const dialogues = {
  common: [
    { name: "旁白", text: "这次以后，你和学姐间变得亲密了，聊天的次数也变得多了起来" },
    { name: "旁白", text: "在实验中，你发现微信中的聊天也能影响好感度" },
    { name: "旁白", text: "于是，在交流中你很轻松的找到了学姐的喜好" },
    { name: "你", text: "喜欢吃拉面配叉烧，喜欢玩千原万神吗..." },
    { name: "你", text: "你将一些喜好记在了手机上" },
    { name: "学姐", text: "哈哈，和你聊天就没有不喜欢的话题呢，或许这就是知己吧" , effect: { senpai: +10 } },
    { name: "学姐", text: "说起来，下周我要去漫展，要跟我一起吗？" },//todo:手机震动
    { name: "你", text: "当然了！" },
    { name: "学姐", text: "太好了！可以多一个帮手～" },
    { name: "学姐", text: "不过我要提前去化妆和换衣服，可能会比较早哦？" },
    { name: "你", text: "没关系的！我很期待看到学姐的COS呢。" },
    { name: "学姐", text: "那就这么说定啦！周六早上9点，学校门口见！"},//手机终止
    { name: "你", text: "那么，该做什么准备呢", triggerChoice: "main" }
  ],
  join: [
    { name: "旁白", text: "接下来的几天，你们经常讨论漫展的行程和准备事宜。" },
    { name: "旁白", text: "漫展当天..." },
    { name: "学姐", text: "（穿着精致的COS服）怎么样？这套衣服还不错吧？" },
    { name: "你", text: "超级棒！学姐真的很适合这个角色！" },
    { name: "学姐", text: "谢谢～那我们继续出发吧！今天要玩个痛快！" },
    { name: "旁白", text: "你根据学姐喜欢的内容，选择了合适的活动。" },
    { name: "旁白", text: "在漫展度过了愉快的一天，关系更加亲近了。", nextScene: "../../剧情/sport/index.html" }
  ],
  photograph: [
    { name: "旁白", text: "漫展当天..." },//todo：增加一个照相的判定值为true
    { name: "你", text: "学姐，我拍照技术还不错，需要摄影师吗？" },
    { name: "学姐", text: "（摆好姿势）这个角度可以吗？灯光怎么样？" },
    { name: "你", text: "完美！...好！拍到了！" },
    { name: "学姐", text: "（跑过来看相机）哇！拍得真好！" , effect: { senpai: +15 }},
    { name: "你", text: "嘿嘿...我也进行了特训呢" },
    { name: "学姐", text: "真是十分感谢你呢！让我们继续吧！" },
    { name: "你", text: "通过好感度，你为学姐规划了合适的行程" },
    { name: "旁白", text: "在漫展上度过了愉快的一天，你们的关系也更加亲近了。", nextScene: "../../剧情/sport/index.html" }
  ]
};

// -------------------- 场景跳转 --------------------
function goToNextScene(sceneUrl) {
  console.log("跳转到下一个页面:", sceneUrl);
  document.body.classList.add("fade-out");
  
  localStorage.setItem('affectionData', JSON.stringify(affectionData));
  
  setTimeout(() => {
    window.location.href = sceneUrl || "next_scene.html";
  }, 1000);
}

// -------------------- 打字机效果 --------------------
function typeText(text, callback) {
  clearInterval(typingInterval);
  charIndex = 0;
  dialogText.textContent = "";

  typingInterval = setInterval(() => {
    if (charIndex < text.length) {
      dialogText.textContent += text[charIndex];
      charIndex++;
    } else {
      clearInterval(typingInterval);
      if (callback) callback();
    }
  }, typingSpeed);
}

// -------------------- 切换角色立绘 --------------------
function toggleCharacterImage(speaker) {
  const characterImages = document.querySelectorAll('.character-img');
  characterImages.forEach(img => {
    img.classList.add('hidden');
  });

  switch(speaker) {
    case '学姐':
      if (senpaiImg) senpaiImg.classList.remove('hidden');
      break;
    case '朋友':
      if (friendImg) friendImg.classList.remove('hidden');
      break;
    case '老师':
      if (friendImg) friendImg.classList.remove('hidden'); // 使用朋友立绘代替老师
      break;
    case '主角':
    default:
      // 旁白或其他对话时显示主角
      const mainCharacterImg = document.getElementById('main-character');
      if (mainCharacterImg) mainCharacterImg.classList.remove('hidden');
      break;
  }
}

// -------------------- 显示对话 --------------------
function showDialogue(branch, idx) {
  const currentDialogues = dialogues[branch];
  if (idx < 0) idx = 0;
  if (idx >= currentDialogues.length) {
    console.log("分支剧情结束");
    return;
  }
  
  currentBranch = branch;
  index = idx;
  const dialogue = currentDialogues[index];
  nameBox.textContent = dialogue.name;
  toggleCharacterImage(dialogue.name);

  typeText(dialogue.text, () => {});
}

// -------------------- 下一句按钮 --------------------
function handleNext() {
  const currentDialogues = dialogues[currentBranch];
  
  if (charIndex < currentDialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = currentDialogues[index].text;
    charIndex = currentDialogues[index].text.length;
    return;
  }
  
  const currentDialogue = currentDialogues[index];
  
  if (currentDialogue.triggerChoice && !hasMadeChoice) {
    showChoices(currentDialogue.triggerChoice);
    return;
  }
  
  if (currentDialogue.effect) {
    applyEffect(currentDialogue.effect);
  }
  
  if (currentDialogue.nextScene) {
    goToNextScene(currentDialogue.nextScene);
    return;
  }
  
  if (index < currentDialogues.length - 1) {
    showDialogue(currentBranch, index + 1);
  } else {
    console.log("已经是最后一句对话");
  }
  
  stopAutoPlay();
}

// -------------------- 显示选择框 --------------------
function showChoices(choiceType) {
  if (hasMadeChoice) return;
  
  dialogBox.style.display = "none";
  if (choiceType === "main") choiceContainer.classList.remove("hidden");
  clearIntervals();
}

function hideAllChoices() {
  choiceContainer.classList.add("hidden");
  dialogBox.style.display = "block";
}

function clearIntervals() {
  clearInterval(typingInterval);
  clearInterval(autoInterval);
  autoPlay = false;
  if (autoBtn) autoBtn.textContent = "自动播放";
}

// -------------------- 处理选择 --------------------
function handleChoice(event) {
  if (hasMadeChoice) return;
  
  const choice = event.currentTarget.dataset.choice;
  hideAllChoices();
  hasMadeChoice = true;

  showDialogue(choice, 0);
}

// -------------------- 应用效果 --------------------
function applyEffect(effectObj) {
  for (const [character, value] of Object.entries(effectObj)) {
    updateAffection(character, affectionData[character] + value);
  }
}

// -------------------- 好感度旁白 --------------------
function updateAffection(character, value) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  const text = bar.parentElement.querySelector('.affection-text');
  if (bar) bar.style.width = `${affectionData[character]}%`;
  if (text) text.textContent = `学姐: ${affectionData[character]}%`;
  
}

function initAffection() {
  const savedData = localStorage.getItem('affectionData');
  if (savedData) {
    const loadedData = JSON.parse(savedData);
    if (loadedData.senpai !== undefined) affectionData.senpai = loadedData.senpai;
  }
  updateAffection('senpai', affectionData.senpai);
}

// -------------------- 屏幕点击继续 --------------------
function bindScreenClick() {
  document.body.addEventListener('click', function(event) {
    if (window.phoneOpen) return;
    if (!event.target.closest('.choice-btn') && 
        !event.target.closest('.control-images') &&
        !event.target.closest('#sidebar') &&
        !event.target.closest('#sidebar-toggle')) {
      handleNext();
    }
  });
  // 空格键推进剧情
  document.addEventListener('keydown', function(e) {
    if (window.phoneOpen) return;
    if (e.code === 'Space' && !e.repeat) {
      handleNext();
    }
  });
  if (window.phoneOpen) return;
}

// -------------------- 自动播放控制 --------------------
function toggleAutoPlay() {
  autoPlay = !autoPlay;
  if (autoPlay) {
    autoBtn.textContent = "停止自动";
    startAutoPlay();
  } else stopAutoPlay();
}

function startAutoPlay() {
  clearInterval(autoInterval);
  autoInterval = setInterval(() => handleNext(), 3000);
}

function stopAutoPlay() {
  clearInterval(autoInterval);
  autoPlay = false;
  if (autoBtn) autoBtn.textContent = "自动播放";
}

// -------------------- 其他控制按钮 --------------------
function handlePrev() {
  if (index > 0) showDialogue(currentBranch, index - 1);
  stopAutoPlay();
}

function toggleSpeed() {
  isFast = !isFast;
  typingSpeed = isFast ? 10 : 50;
  speedBtn.textContent = isFast ? "原速" : "加速";
  showDialogue(currentBranch, index);
}

function handleSkip() {
  clearInterval(typingInterval);
  const currentDialogues = dialogues[currentBranch];
  dialogText.textContent = currentDialogues[index].text;
  charIndex = currentDialogues[index].text.length;
  stopAutoPlay();
}

// -------------------- 绑定按钮 --------------------
function bindControlButtons() {
  if (nextBtn) nextBtn.addEventListener("click", handleNext);
  if (prevBtn) prevBtn.addEventListener("click", handlePrev);
  if (speedBtn) speedBtn.addEventListener("click", toggleSpeed);
  if (skipBtn) skipBtn.addEventListener("click", handleSkip);
  if (autoBtn) autoBtn.addEventListener("click", toggleAutoPlay);
  
  choiceBtns.forEach(btn => btn.addEventListener("click", handleChoice));
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebar-toggle");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => sidebar.classList.toggle("show"));
  }
  
  // 确保在 DOM 加载完成后绑定存档和读档按钮
  bindSaveLoadButtons();
}

// -------------------- 存档读档按钮绑定 --------------------
function bindSaveLoadButtons() {
  const saveBtn = document.getElementById("save-btn");
  const loadBtn = document.getElementById("load-btn");
  
  if (saveBtn) {
    saveBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      
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
        branch: currentBranch || "common",
        dialogueIndex: index || 0,
        affectionData: { ...affectionData },
        background: bodyBg,  // 🔹 保存背景图
        timestamp: Date.now()
      };
      console.log("存档进度：", saveData);

      saves.push(saveData);
      localStorage.setItem("storySaves", JSON.stringify(saves));

      console.log("存档已写入：", saveData);
      alert("游戏已存档！");

      // 仅在 initSaveUI 存在的情况下调用（避免 ReferenceError）
      if (typeof initSaveUI === "function") {
        initSaveUI();
      }
    });
  }

  if (loadBtn) {
    loadBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      // 直接跳转到存档界面
      window.location.href = "../../savepage/savepage2.0/save.htm";
    });
  }
}

// -------------------- 音频控制 --------------------
// 创建音频元素并自动播放Spring.mp3
const bgAudio = document.createElement("audio");
bgAudio.src = "../../audio/Spring.mp3";
bgAudio.loop = true;
bgAudio.autoplay = true;
bgAudio.volume = 0.5; // 默认音量
bgAudio.style.display = "none";
document.body.appendChild(bgAudio);

// 获取音量控制元素
const volumeRange = document.getElementById("volume-range");
const musicBtn = document.getElementById("music-btn");

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

// -------------------- DOMContentLoaded 初始化 --------------------
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
  initAffection();
  showDialogue('common', 0);
  bindControlButtons();
  bindScreenClick();
  checkImages(); // 添加图片检查
  console.log("漫展约定事件初始化完成");

  // 🔹 页面加载时检查是否通过 URL 读档
  const urlParams = new URLSearchParams(window.location.search);
  const loadTimestamp = urlParams.get("load");
  if (loadTimestamp) {
    const saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
    const save = saves.find(s => s.timestamp == loadTimestamp);
    if (save) {
      currentBranch = save.branch;
      index = save.dialogueIndex;
      Object.assign(affectionData, save.affectionData);
      updateAffection('senpai', affectionData.senpai);
      
      // 隐藏选择界面，显示对话框
      hideAllChoices();
      showDialogue(currentBranch, index);
      alert("读档成功！");
    }
  }

  // 监听手机界面开关，控制剧情推进
  window.phoneOpen = false;
  const phoneChatInterface = document.getElementById("phone-chat-interface");
  if (phoneChatInterface) {
    const observer = new MutationObserver(() => {
      window.phoneOpen = phoneChatInterface.classList.contains("show");
    });
    observer.observe(phoneChatInterface, { attributes: true, attributeFilter: ["class"] });
  }
});
// 可选：主菜单按钮也加淡出动画
const mainMenuBtn = document.getElementById("main-menu-btn");
mainMenuBtn.addEventListener("click", () => {
  document.body.classList.remove("fade-in");
  document.body.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = "../../index.html";
  }, 500);
});
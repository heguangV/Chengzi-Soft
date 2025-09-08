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

const dialogues = {
  common: [
    { name: "系统", text: "某天课后，你在图书馆偶遇了正在看动漫杂志的学姐。" },
    { name: "学姐", text: "（兴奋地指着杂志）「哇！下周末有大型漫展，这次我一定要出这个角色！」" },
    { name: "你", text: "「学姐也参加漫展吗？好厉害！」" },
    { name: "学姐", text: "「是啊！我准备了很久的COS服终于要派上用场了～」" },
    { name: "系统", text: "学姐眼中闪烁着兴奋的光芒，似乎对这次漫展充满期待。" },
    { name: "系统", text: "你决定...", triggerChoice: "main" }
  ],
  join: [
    { name: "你", text: "「学姐，我正好也想去漫展，可以一起去吗？」" },
    { name: "学姐", text: "（惊喜地）「真的吗？太好了！正好我可以多一个帮手～」" },
    { name: "学姐", text: "「不过我要提前去化妆和换衣服，可能会比较早哦？」" },
    { name: "你", text: "「没关系的！我很期待看到学姐的COS呢。」" },
    { name: "学姐", text: "「那就这么说定啦！周六早上9点，学校门口见！」", effect: { senpai: +15 } },
    { name: "系统", text: "你们约定好了一起去漫展，学姐看起来非常开心。" },
    { name: "系统", text: "接下来的几天，你们经常讨论漫展的行程和准备事宜。" },
    { name: "系统", text: "漫展当天..." },
    { name: "学姐", text: "（穿着精致的COS服）「怎么样？这套衣服还不错吧？」" },
    { name: "你", text: "「超级棒！学姐真的很适合这个角色！」" },
    { name: "学姐", text: "「谢谢～那我们出发吧！今天要玩个痛快！」", effect: { senpai: +10 } },
  { name: "系统", text: "你们在漫展度过了愉快的一天，关系更加亲近了。", nextScene: "../../剧情/sport/index.html" }
  ],
  support: [
    { name: "你", text: "「学姐加油！期待看到你的COS照片～」" },
    { name: "学姐", text: "「谢谢～我会多发一些照片到空间的！」" },
    { name: "学姐", text: "「如果你改变主意想来的话，随时联系我哦。」" },
    { name: "你", text: "「好的，祝学姐玩得开心！」", effect: { senpai: +5 } },
    { name: "系统", text: "漫展结束后，学姐在空间发了很多精美的COS照片。" },
    { name: "系统", text: "你在下面点赞评论，学姐很快回复了你。" },
    { name: "学姐", text: "「谢谢支持！下次漫展一起来玩吧～」" },
  { name: "系统", text: "虽然没能一起去，但你们通过这种方式保持了联系。", nextScene: "../../剧情/sport/index.html" }
  ],
  photograph: [
    { name: "你", text: "「学姐，我拍照技术还不错，需要摄影师吗？」" },
    { name: "学姐", text: "（眼睛一亮）「真的吗？太好了！我正愁找不到合适的摄影师呢！」" },
    { name: "学姐", text: "「朋友都是手机党，拍出来的效果总是不理想...」" },
    { name: "你", text: "「那我来做学姐的专属摄影师吧！」" },
    { name: "学姐", text: "「太好了！那我们得提前商量一下拍摄方案～」", effect: { senpai: +20 } },
    { name: "系统", text: "你们约好提前见面，讨论拍摄角度和场景。" },
    { name: "系统", text: "漫展当天..." },
    { name: "学姐", text: "（摆好姿势）「这个角度可以吗？灯光怎么样？」" },
    { name: "你", text: "「完美！学姐保持这个姿势...好！拍到了！」" },
    { name: "学姐", text: "（跑过来看相机）「哇！拍得真好！你太专业了！」" },
    { name: "朋友", text: "「哇哦～专属摄影师就是不一样呢！」" },
    { name: "学姐", text: "（脸红）「今天真的多亏你了...谢谢！」", effect: { senpai: +15 } },
  { name: "系统", text: "你为学姐拍出了精美的照片，她在朋友圈特别感谢了你。", nextScene: "../../剧情/sport/index.html" }
  ]
};

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
const affectionData = { senpai: 30 };

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
      // 系统或其他对话时显示主角
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

// -------------------- 好感度系统 --------------------
function updateAffection(character, value) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  const text = bar.parentElement.querySelector('.affection-text');
  if (bar) bar.style.width = `${affectionData[character]}%`;
  if (text) text.textContent = `学姐: ${affectionData[character]}%`;
  localStorage.setItem('affectionData', JSON.stringify(affectionData));
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
}

// -------------------- 音频控制 --------------------
const musicBtn = document.getElementById("music-btn");
const bgMusic = document.getElementById("bg-music");
const volumeRange = document.getElementById("volume-range");

if (volumeRange) {
  volumeRange.addEventListener("input", () => {
    if (bgMusic) bgMusic.volume = volumeRange.value / 100;
  });
}

if (musicBtn && bgMusic) {
  musicBtn.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(e => {
        console.warn("音频播放失败:", e);
        handleAudioError();
      });
      musicBtn.textContent = "音乐暂停";
    } else {
      bgMusic.pause();
      musicBtn.textContent = "音乐播放";
    }
  });
}

// -------------------- 侧边栏控制 --------------------
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");

if (toggleBtn && sidebar) {
  toggleBtn.addEventListener("click", () => sidebar.classList.toggle("show"));
}


// -------------------- 存档读档（完整新版，多存档） --------------------

const saveBtn = document.getElementById("save-btn");
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
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

const loadBtn = document.getElementById("load-btn"); // 🔹 获取读档按钮
if (loadBtn) {
    loadBtn.addEventListener("click", () => { 
        // 直接跳转到存档界面
        window.location.href = "../../savepage/savepage2.0/save.htm";
    });
}

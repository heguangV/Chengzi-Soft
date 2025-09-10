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
    { "name": "学姐", "text": "诶？你也看这部番吗，真是少见啊" },
    { "name": "你", "text": "嗯嗯！我也算这部作品的死忠粉呢" },
    { "name": "学姐", "text": "真是缘分啊，加个好友吧！以后继续聊！" },
    { "name": "你", "text": "是过去的梦吗，能加上学姐的好友算是我命好吧..." },
    { "name": "你", "text": "虽然那次加上好友后 ，也没有再聊几句..." },
    { "name": "旁白", "text": "嗡嗡——" },
    { "name": "旁白", "text": "你麻木的关掉手机闹铃，从梦中苏醒，熬夜的大脑还有些晕眩" },
    { "name": "旁白", "text": "视野里好像出现了个从未见过的东西" },
    { "name": "你", "text": "学姐：30%？这个格式，难道是好感度？" },
    { "name": "旁白", "text": "作为一名资深宅，你第一反应的就是各种gal中的经典配置：好感度" },
    { "name": "你", "text": "学姐...大概是赤松风吧" },
    { "name": "你", "text": "虽然对她很有好感，但是她学期末就将要留学，即使接近了感觉也不会长久" },
  { "name": "你", "text": "这...怎么办呢", triggerChoice: "todo" },// 在此触发：去外面转转/继续睡觉
    //继续睡觉 你：大概是还没睡醒吧...再睡一会吧
    { name: "旁白", text: "周末的天街商场人头攒动，美食区的空气里混杂着各种令人食指大动的香气。" },
    { name: "旁白", text: "你正纠结于是吃火锅还是拉面时，一个熟悉的身影闯入了你的视线。" },
    { name: "旁白", text: "是学姐。她正和一位朋友有说有笑，似乎也面临着同样的选择困难。" },
    { "name": "你", "text": "这...是命运的选择吗？" },
    { name: "你", text: "要不然，测试一下...?", triggerChoice: "main" }
  ],
  
  approach: [
    { name: "你", text: "（深吸一口气，走上前去）学姐？好巧啊。" },
    { name: "学姐", text: "咦？是你啊！真的好巧，你也来这边逛街？" },
    { name: "你", text: "我正好刷到视频，那边有家店味道好像不错，要不要一起？" },
    { name: "学姐", text: "好啊，我正愁做不出选择呢！", effect: { senpai: +5 } },
    { name: "你", text: "（啊，真的增加了）" },
    { name: "旁白", text: "在一段时间排队后，我们成功的在店内入座" },
    { name: "旁白", text: "你试着问了几道菜，发现学姐的好感度也会发生细微的变化" },
    { name: "旁白", text: "依照这种变化，你很快找到了学姐的最爱" },
    { name: "你", text: "怎么样学姐，吃的还合口味吗？" },
    { name: "学姐", text: "嗯！看来我们的口味还挺合的嘛。", effect: { senpai: +10 } },
    { name: "学姐", text: "以后有机会的话，再一起出来玩吧", effect: { senpai: +5 } },
    { name: "你", text: "（心中暗喜）那就这么说定了！", nextScene: "../coser/index.html" }
  ],
  
  
  leave: [
  { name: "旁白", text: "你犹豫了一下，最终还是选择了离开。人群很快淹没了她的背影。" },
  { name: "旁白", text: "也许保持距离才是正确的选择。" },
  { name: "你", text: "好感度这种东西，大概只是我的臆想吧..." },
  { name: "旁白", text: "你独自一人吃完了晚饭。错过了本可改变命运的一天。" },
  { name: "旁白", text: "游戏结束。", nextScene: "../../index.html" }
  ]
};

// 新增：继续睡觉分支 -> 触发注释剧情并结束游戏
dialogues.sleep = [
  { name: "你", text: "什么好感度，大概只是我的臆想吧..." },
  { name: "你", text: "大概是还没睡醒……再睡一会吧。" },
  { name: "旁白", text: "你把闹钟关掉，翻身继续睡去。错过了本可改变命运的一天。" },
  { name: "旁白", text: "游戏结束。", nextScene: "../../index.html" }
];

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
localStorage.setItem('affectionData', JSON.stringify(affectionData));


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
  // 每次进入新台词，重置本句的选择使用权，支持多个选择点
  hasMadeChoice = false;
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
  // 仅使用一级选择容器，根据类型动态改写两个按钮
  if (choiceType === "main" || choiceType === "todo") {
    const btns = choiceContainer.querySelectorAll('.choice-btn');
    if (btns.length >= 2) {
      const [btn1, btn2] = btns;
      if (choiceType === "todo") {
        btn1.textContent = "去外面转转";
        btn1.dataset.choice = "goOut";
        btn2.textContent = "继续睡觉";
        btn2.dataset.choice = "sleep";
      } else {
        // 恢复为主选择（打招呼/离开）
        btn1.textContent = "主动上前打招呼";
        btn1.dataset.choice = "approach";
        btn2.textContent = "转身离开";
        btn2.dataset.choice = "leave";
      }
    }
    choiceContainer.classList.remove("hidden");
  }
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
  // 处理新增的 todo 阶段选择
  if (choice === 'goOut') {
    // 选择外出：继续当前分支剧情（进入商场剧情）
    showDialogue(currentBranch, index + 1);
    return;
  }
  if (choice === 'sleep') {
    // 选择睡觉：进入睡觉分支并在结尾结束游戏
    showDialogue('sleep', 0);
    return;
  }
  // 其他分支按原逻辑进入对应分支
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
// 可选：主菜单按钮也加淡出动画
const mainMenuBtn = document.getElementById("main-menu-btn");
mainMenuBtn.addEventListener("click", () => {
  document.body.classList.remove("fade-in");
  document.body.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = "../../index.html";
  }, 500);
});
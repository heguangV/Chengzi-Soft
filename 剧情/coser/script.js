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
    // Removed erroneous storyFlags initialization
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
// 手机聊天界面元素（按需获取）- 使用独立变量名避免与下方同名常量冲突
let phoneUIEl = null;
let chatMessagesEl = null;
let chatCloseBtnEl = null;
const PHONE_START_IDX = 7; // 指向 TODO: 手机震动 的那句
const PHONE_END_IDX = 12;  // 指向 //手机终止 的那句
let phoneSequenceActive = false; // 手机聊天序列进行中 -> 强制暂停剧情
let phoneSequenceDone = false;   // 手机聊天序列已完成 -> 后续不再触发
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

// -------------------- 全局剧情判定（持久化） --------------------
const storyFlags = {
  photograph: false
};

// -------------------- 剧情台词 --------------------
const dialogues = {
  common: [
    { name: "旁白", text: "这次以后，你和学姐间变得亲密了，聊天的次数也变得多了起来" },//room
    { name: "旁白", text: "在实验中，你发现微信中的聊天也能影响好感度" },
    { name: "旁白", text: "于是，在交流中你很轻松的找到了学姐的喜好" },
    { name: "你", text: "喜欢吃拉面配叉烧，喜欢玩千原万神..." },
    { name: "你", text: "平时喜欢在文萃弹钢琴放松心情..." },
    { name: "你", text: "你将一些喜好记在了手机上" },
    { name: "你", text: "只要一直按学姐喜欢事情去做，一定能提高好感度吧..." },
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
    { name: "旁白", text: "接下来的几天，你们经常讨论漫展的行程和准备事宜。" },//manzhan
    { name: "旁白", text: "漫展当天..." },
    { name: "学姐", text: "（穿着精致的COS服）怎么样？这套衣服还不错吧？" },
    { name: "你", text: "超级棒！学姐真的很适合这个角色！" },
    { name: "学姐", text: "谢谢～那我们继续出发吧！今天要玩个痛快！" },
    { name: "旁白", text: "你根据学姐喜欢的内容，选择了合适的活动。" },
     { name: "学姐", text: "没想到不仅是聊天，连生活步调都这么合拍，没准我们很合适呢~" , effect: { senpai: +10 }},
    { name: "你", text: "哈哈，可能我比较理解你吧" },
    { name: "学姐", text: "是这样吗......" },
    { name: "旁白", text: "在漫展度过了愉快的一天，关系更加亲近了。", nextScene: "../../剧情/sport/index.html" }
  ],
  photograph: [
    { name: "旁白", text: "漫展当天..." },//todo：增加一个照相的判定值为true//manzhan
    { name: "你", text: "学姐，我拍照技术还不错，需要摄影师吗？" },
    { name: "学姐", text: "诶？真的吗？那太好了，我正愁找不到合适的摄影师呢！" },
    { name: "学姐", text: "（摆好姿势）这个角度可以吗？灯光怎么样？" },
    { name: "你", text: "完美！...好！拍到了！" },
    { name: "学姐", text: "（跑过来看相机）哇！拍得真好！你摄像技术有一手嘛" , effect: { senpai: +15 }},
    { name: "你", text: "嘿嘿...我也进行了特训呢" },
    { name: "学姐", text: "真是十分感谢你！那让我们继续吧！" },
    { name: "你", text: "通过好感度，你为学姐规划了合适的行程" },
    { name: "学姐", text: "没想到不仅是聊天，连生活步调都这么合拍，没准我们很合适呢~" , effect: { senpai: +10 }},
    { name: "你", text: "哈哈，可能我比较理解你吧" },
    { name: "学姐", text: "是这样吗......" },
    { name: "旁白", text: "在漫展上度过了愉快的一天，你们的关系也更加亲近了。", nextScene: "../../剧情/sport/index.html" }
  ]
};


  // -------------------- 场景背景切换（根据注释） --------------------
  const BG_BASE = "../../asset/images/";
  function setSceneBackground(imageFile) {
    const url = BG_BASE + imageFile;
    document.body.style.backgroundImage = `url('${url}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center center';
  }

  // 对应台词索引的背景图映射
  const SCENE_BG_MAP = {
    common: {
      0: 'room.png' // //room
    },
    join: {
      0: 'manzhan.png' // //manzhan
    },
    photograph: {
      0: 'manzhan.png' // //manzhan
    }
  };

  function applySceneBackground(branch, idx) {
    const map = SCENE_BG_MAP[branch];
    if (map && Object.prototype.hasOwnProperty.call(map, idx)) {
      setSceneBackground(map[idx]);
    }
  }
// -------------------- 场景跳转 --------------------
function goToNextScene(sceneUrl) {
  console.log("跳转到下一个页面:", sceneUrl);
  document.body.classList.add("fade-out");
  
  localStorage.setItem('affectionData', JSON.stringify(affectionData));
  try { localStorage.setItem('storyFlags', JSON.stringify(storyFlags)); } catch (e) {}
  
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
  // 在真正渲染前，拦截到达“手机聊天片段”起点的请求
  if (
    branch === 'common' &&
    idx === PHONE_START_IDX &&
    !phoneSequenceDone &&
    !phoneSequenceActive
  ) {
    // 触发手机聊天序列，直接在气泡里展示 TODO->终止 段落
    runCoserInvitePhoneSequence();
    return;
  }

  const currentDialogues = dialogues[branch];
  if (idx < 0) idx = 0;
  if (idx >= currentDialogues.length) {
    console.log("分支剧情结束");
    return;
  }
  
  currentBranch = branch;
  index = idx;
  // 根据注释标注切换对应场景背景（未到下一个注释前持续生效）
  applySceneBackground(currentBranch, index);
  const dialogue = currentDialogues[index];
  nameBox.textContent = dialogue.name;
  toggleCharacterImage(dialogue.name);

  typeText(dialogue.text, () => {});
}

// -------------------- 下一句按钮 --------------------
function handleNext() {
  // 手机聊天中或界面打开时，禁止推进
  if (window.phoneOpen || phoneSequenceActive) return;

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

  // 设置并持久化摄影判定
  storyFlags.photograph = (choice === 'photograph');
  try { localStorage.setItem('storyFlags', JSON.stringify(storyFlags)); } catch (e) {}

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

// -------------------- 剧情判定初始化 --------------------
function initStoryFlags() {
  try {
    const saved = JSON.parse(localStorage.getItem('storyFlags') || '{}');
    if (typeof saved.photograph === 'boolean') {
      storyFlags.photograph = saved.photograph;
    }
  } catch (e) {}
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

  // 绑定手机聊天界面关闭按钮（用于在序列中提前关闭时也能恢复剧情）
  bindPhoneUI();
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
  storyFlags: { ...storyFlags },
  background: getBodyBackgroundAbsoluteUrl(),  // 🔹 保存当前背景图
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
  initStoryFlags();
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
      if (save.storyFlags) {
        Object.assign(storyFlags, save.storyFlags);
        try { localStorage.setItem('storyFlags', JSON.stringify(storyFlags)); } catch (e) {}
      }
      
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

// -------------------- 手机聊天序列（TODO->终止段落） --------------------
function getPhoneEls() {
  if (!phoneUIEl) phoneUIEl = document.getElementById('phone-chat-interface');
  if (!chatMessagesEl) chatMessagesEl = document.getElementById('chat-messages');
  if (!chatCloseBtnEl) chatCloseBtnEl = document.getElementById('chat-close-btn');
  return !!(phoneUIEl && chatMessagesEl);
}

function bindPhoneUI() {
  if (!getPhoneEls()) return;
  if (chatCloseBtnEl && !chatCloseBtnEl._bound) {
    chatCloseBtnEl.addEventListener('click', () => {
      // 用户手动关闭时，如果处于序列中，则立即结束并恢复剧情
      if (phoneSequenceActive) finishPhoneSequence(true);
      else closeChatInterface();
    });
    chatCloseBtnEl._bound = true;
  }
}

function openChatInterface() {
  if (!getPhoneEls()) return;
  phoneUIEl.classList.add('show');
  // 滚到底，稍作延迟等待渲染
  setTimeout(() => { if (chatMessagesEl) chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight; }, 100);
}

function closeChatInterface() {
  if (!getPhoneEls()) return;
  phoneUIEl.classList.remove('show');
}

function addChatMessage(sender, text) {
  if (!getPhoneEls()) return;
  const wrap = document.createElement('div');
  wrap.className = 'message ' + (sender === 'sent' ? 'sent' : 'received');
  const content = document.createElement('div');
  content.className = 'message-content';
  content.textContent = text;
  wrap.appendChild(content);
  chatMessagesEl.appendChild(wrap);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function vibratePhone(ms = 600) {
  try { if (navigator.vibrate) navigator.vibrate([120, 80, 120]); } catch (e) {}
  if (getPhoneEls()) {
  phoneUIEl.classList.add('phone-vibrating');
  setTimeout(() => phoneUIEl.classList.remove('phone-vibrating'), ms);
  }
}

function runCoserInvitePhoneSequence() {
  if (phoneSequenceActive || phoneSequenceDone) return;
  if (!getPhoneEls()) {
    console.warn('未找到手机聊天界面，跳过手机聊天序列');
    // 直接跳过并继续剧情
    showDialogue('common', PHONE_END_IDX + 1);
    return;
  }

  // 停止一切自动推进/打字，隐藏对话框
  clearIntervals();
  stopAutoPlay();
  if (dialogBox) dialogBox.style.display = 'none';

  phoneSequenceActive = true;

  // 读取对话 7..12，映射成气泡：学姐 -> received，你 -> sent
  const seq = [];
  for (let i = PHONE_START_IDX; i <= PHONE_END_IDX; i++) {
    const d = dialogues.common[i];
    if (!d) continue;
    const sender = d.name === '你' ? 'sent' : 'received';
    seq.push({ sender, text: d.text });
  }

  // 打开手机 + 震动
  openChatInterface();
  vibratePhone(800);

  // 清空旧记录
  chatMessagesEl.innerHTML = '';

  // 逐条加入消息
  const step = 1200; // 每条消息间隔从 800ms 延长到 1200ms，便于阅读
  seq.forEach((m, i) => setTimeout(() => addChatMessage(m.sender, m.text), i * step));

  // 全部展示完后，稍等片刻自动关闭并恢复剧情
  const total = seq.length * step + 2000; // 末尾额外停留 2s 再关闭
  setTimeout(() => finishPhoneSequence(false), total);
}

function finishPhoneSequence(fromUserClose) {
  phoneSequenceActive = false;
  phoneSequenceDone = true;

  // 关闭手机界面（若尚未关闭）
  if (getPhoneEls() && phoneUIEl.classList.contains('show')) {
    closeChatInterface();
  }

  // 恢复主对话框
  if (dialogBox) dialogBox.style.display = 'block';

  // 将剧情索引直接跳到终止行之后
  currentBranch = 'common';
  index = PHONE_END_IDX; // 指向终止那句
  showDialogue(currentBranch, index + 1); // 跳到“那么，该做什么准备呢”
}
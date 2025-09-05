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

function checkImages() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.complete || img.naturalHeight === 0) {
      console.warn('图片可能未加载:', img.src);
      if (img.classList.contains('background-img')) handleImageError(img, 'background');
      else if (img.classList.contains('character-avatar')) handleImageError(img, 'character');
      else if (img.classList.contains('dialog-img')) handleImageError(img, 'dialog');
      else if (img.classList.contains('control-img')) handleImageError(img, 'control');
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
const subChoiceContainer = document.getElementById("sub-choice-container");
const choiceBtns = document.querySelectorAll(".choice-btn");
const dialogBox = document.querySelector(".dialog-box");
const senpaiImg = document.getElementById("senpai-img");
const friendImg = document.getElementById("friend-img");
const mainCharImg = document.getElementById("main-character");

// 侧边栏
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");

// 音乐控制
const musicBtn = document.getElementById("music-btn");
const bgMusic = document.getElementById("bg-music");
const volumeRange = document.getElementById("volume-range");

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

const dialogues = {
  common: [
    { name: "旁白", "text": "怀着对一切大学生活的好奇，你走进了BIT的大门。当然，还有你的青梅陪着你——你俩都以不错的成绩考进了BIT。" },
    { name: "旁白", "text": "新生各项事宜的办理略显繁琐，你和青梅又并非同个专业，二人只得暂时分离，约定等一切忙完后共进晚餐。" },
    { name: "旁白", "text": "书院迎新场地，专业咨询四字吸引了你的目光，你连忙走上前想要咨询更多信息，毕竟初来乍到的你对自己的专业也并不太了解，也想借此机会认识更多的同学——看动漫上就是这样，大学生活就是各种各样的社团和结交新的朋友。" },
    { name: "旁白", "text": "专业咨询场地人满为患，你看见有位同学刚咨询完一名学姐，便连忙走上前。" },
    { name: "你", "text": "学姐你好，我想咨询一下XX专业的相关信息。" },
    { name: "学姐", "text": "你好呀！这个专业……（介绍专业信息）。对了，今晚在文体中心还有一场专门的专业宣讲会，内容会更详细，感兴趣的话可以去听听。" },
    { name: "你", "text": "文体中心，在哪呀？" },
    { name: "学姐", "text": "就是东校区体育馆那边……" },
    { name: "旁白", "text": "见你仍旧一脸疑惑，学姐再次开口。" },
    { name: "学姐", "text": "你有加我们新生群吗？里面有我们学校的地图。" },
    { name: "你", "text": "还没有。" },
    { name: "旁白", "text": "学姐低头在桌上开始翻找。" },
    { name: "学姐", "text": "奇怪，新生群二维码呢？" },
    { name: "旁白", "text": "边上一名同学说：“被XXX他们拿去招人了。” 学姐悄悄翻了个白眼，说到：" },
    { name: "学姐", "text": "这样吧同学，你先加我QQ，我把你拉到新生群里去。" },
    { name: "旁白", "text": "……" },
    { name: "旁白", "text": "你成功加到了学姐的QQ，也加入到了新生群，看到了校园地图。" },
    { name: "旁白", "text": "你继续逛着迎新会，闲来无事翻看了学姐QQ空间，发现你们兴趣爱好非常相同，并且学姐还是一名coser。" },
    { name: "系统", text: "周末的天街商场人头攒动，美食区的空气里混杂着各种令人食指大动的香气。" },
    { name: "系统", text: "你正纠结于是吃火锅还是拉面时，一个熟悉的身影闯入了你的视线。" },
    { name: "系统", text: "是学姐。她正和一位朋友有说有笑，似乎也面临着同样的选择困难。" },
    { name: "系统", text: "你犹豫着要不要上前打招呼。", triggerChoice: "main" }
  ],
  
  approach: [
    { name: "你", text: "（深吸一口气，走上前去）「学姐？好巧啊。」" },
    { name: "学姐", text: "（闻声回头，脸上露出惊喜的表情）「咦？是你啊！真的好巧，你也来这边逛街？」" },
    { name: "朋友", text: "（立刻表现出极大的兴趣，眼神在你们之间来回扫动）「哦——？梦瑶，这位是？不介绍一下吗？」" },
    { name: "学姐", text: "（略显不好意思，轻轻推了下朋友）「别闹。这是我同专业的学弟，很认真的一个人。」 （转向你）「这是我朋友，我们一个社团的。」" },
    { name: "朋友", text: "「学弟你好呀~就你一个人吗？我们俩正愁吃饭选择困难症犯了呢，要不要一起？人多吃饭也热闹！」" },
    { name: "学姐", text: "「喂！你别替别人做决定啊...」 （语气有些嗔怪，但并没有真正反对）" },
    { name: "你", text: "「当然好啊！求之不得。」" },
    { name: "朋友", text: "「哈哈，爽快！那就这么定了！我知道那边有家店味道不错，走吧！」 （说着便热情地在前面带路）" },
    { name: "学姐", text: "（看着你，无奈又觉得好笑地笑了笑）「好吧...那就一起吧。她总是这样风风火火的，你别介意。」", effect: { senpai: +15 } },
    { name: "系统", text: "你们三人一起享用了一顿愉快的晚餐。你和学姐的距离似乎拉近了不少。", nextScene: "../coser/index.html" }
  ],
  
  observe: [
    { name: "系统", text: "你决定不上前打扰，只是在不远处的一个角落坐下，偶尔望向她们的方向。" },
    { name: "系统", text: "学姐和朋友似乎终于决定了吃什么，笑着向一家餐厅走去。" },
    { name: "系统", text: "学姐无意中回头，似乎瞥见了你，略微停顿了一下，但最终还是被朋友拉走了。" },
    { name: "系统", text: "一次平静的周末，什么也没有发生。", effect: { senpai: 0 } },
    { name: "系统", text: "你独自一人吃完了晚饭。", nextScene: "../coser/index.html" }
  ],
  
  leave: [
    { name: "系统", text: "你犹豫了一下，最终还是选择了离开。人群很快淹没了她们的背影。" },
    { name: "系统", text: "也许保持距离才是正确的选择。", effect: { senpai: 0 } },
    { name: "系统", text: "你独自一人吃完了晚饭。", nextScene: "../coser/index.html" }
  ]
};


// -------------------- 打字机效果 --------------------
function typeText(text, callback) {
  clearInterval(typingInterval);
  charIndex = 0;
  dialogText.textContent = "";
  typingInterval = setInterval(() => {
    if (charIndex < text.length) dialogText.textContent += text[charIndex++];
    else { clearInterval(typingInterval); if (callback) callback(); }
  }, typingSpeed);
}

// -------------------- 角色立绘 --------------------
function toggleCharacterImage(speaker) {
  [senpaiImg, friendImg, mainCharImg].forEach(img => img?.classList.add('hidden'));
  switch(speaker) {
    case '学姐': senpaiImg?.classList.remove('hidden'); break;
    case '朋友': friendImg?.classList.remove('hidden'); break;
    case '你': mainCharImg?.classList.remove('hidden'); break;
  }
}

// -------------------- 对话显示 --------------------
function showDialogue(branch, idx) {
  const currentDialogues = dialogues[branch];
  if (!currentDialogues || idx < 0 || idx >= currentDialogues.length) return;
  currentBranch = branch;
  index = idx;

  const dialogue = currentDialogues[index];
  nameBox.textContent = dialogue.name;
  toggleCharacterImage(dialogue.name);
  typeText(dialogue.text);

  if (dialogue.triggerChoice && !hasMadeChoice) showChoices(dialogue.triggerChoice);
  else hideAllChoices();
}

// -------------------- 下一句 --------------------
function handleNext() {
  const currentDialogues = dialogues[currentBranch];
  if (!currentDialogues) return;

  if (charIndex < currentDialogues[index].text.length) {
    clearInterval(typingInterval);
    dialogText.textContent = currentDialogues[index].text;
    charIndex = currentDialogues[index].text.length;
    return;
  }

  const currentDialogue = currentDialogues[index];

  if (currentDialogue.effect) applyEffect(currentDialogue.effect);
  if (currentDialogue.nextScene) goToNextScene(currentDialogue.nextScene);

  if (index < currentDialogues.length - 1) showDialogue(currentBranch, index + 1);
  stopAutoPlay();
}

// -------------------- 选择框 --------------------
function showChoices(type) {
  if (hasMadeChoice) return;
  dialogBox.style.display = "none";
  if (type === "main") { choiceContainer.classList.remove("hidden"); subChoiceContainer.classList.add("hidden"); }
  else { subChoiceContainer.classList.remove("hidden"); choiceContainer.classList.add("hidden"); }
  clearIntervals();
}

function hideAllChoices() {
  choiceContainer.classList.add("hidden");
  subChoiceContainer.classList.add("hidden");
  dialogBox.style.display = "block";
}

function handleChoice(event) {
  if (hasMadeChoice) return;
  const choice = event.currentTarget.dataset.choice;
  hideAllChoices();
  hasMadeChoice = true;
  if (["approach","observe","leave"].includes(choice)) showDialogue(choice, 0);
  else showDialogue(choice, 0);
}

// -------------------- 好感度 --------------------
function updateAffection(character, value) {
  affectionData[character] = Math.max(0, Math.min(100, value));
  const bar = document.querySelector(`.affection-fill[data-character="${character}"]`);
  const text = bar?.parentElement.querySelector('.affection-text');
  if (bar) bar.style.width = `${affectionData[character]}%`;
  if (text) text.textContent = `学姐: ${affectionData[character]}%`;
  localStorage.setItem('affectionData', JSON.stringify(affectionData));
}

function applyEffect(effectObj) {
  for (const [char, val] of Object.entries(effectObj)) updateAffection(char, affectionData[char] + val);
}

function initAffection() {
  const saved = JSON.parse(localStorage.getItem('affectionData') || '{}');
  Object.assign(affectionData, saved);
  updateAffection('senpai', affectionData.senpai);
}

// -------------------- 场景跳转 --------------------
function goToNextScene(url) {
  document.body.classList.add("fade-out");
  localStorage.setItem('affectionData', JSON.stringify(affectionData));
  setTimeout(() => window.location.href = url || "next_scene.html", 1000);
}

// -------------------- 自动播放 --------------------
function toggleAutoPlay() { autoPlay = !autoPlay; autoBtn.textContent = autoPlay ? "停止自动" : "自动播放"; autoPlay ? startAutoPlay() : stopAutoPlay(); }
function startAutoPlay() { clearInterval(autoInterval); autoInterval = setInterval(handleNext, 3000); }
function stopAutoPlay() { clearInterval(autoInterval); autoPlay = false; autoBtn.textContent = "自动播放"; }

// -------------------- 速度控制 --------------------
function toggleSpeed() { isFast = !isFast; typingSpeed = isFast ? 10 : 50; speedBtn.textContent = isFast ? "快速" : "正常"; }

// -------------------- 上一页 --------------------
function handlePrev() { showDialogue(currentBranch, Math.max(0, index - 1)); stopAutoPlay(); }

// -------------------- 音乐控制 --------------------
function toggleMusic() { if (bgMusic.paused) bgMusic.play().catch(handleAudioError); else bgMusic.pause(); }
function adjustVolume() { bgMusic.volume = volumeRange.value / 100; }

// -------------------- 初始化绑定 --------------------
function bindControlButtons() {
  nextBtn.addEventListener("click", handleNext);
  prevBtn.addEventListener("click", handlePrev);
  speedBtn.addEventListener("click", toggleSpeed);
  autoBtn.addEventListener("click", toggleAutoPlay);
  choiceBtns.forEach(btn => btn.addEventListener("click", handleChoice));
  musicBtn.addEventListener("click", toggleMusic);
  volumeRange.addEventListener("input", adjustVolume);

  if (toggleBtn && sidebar) toggleBtn.addEventListener("click", () => sidebar.classList.toggle("show"));
}

// -------------------- 清理所有计时器 --------------------
function clearIntervals() {
  clearInterval(typingInterval);
  clearInterval(autoInterval);
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
      branch:"common",
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

// -------------------- 页面初始化 --------------------
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
  initAffection();
  showDialogue('common', 0);
  bindControlButtons();
  checkImages();
});

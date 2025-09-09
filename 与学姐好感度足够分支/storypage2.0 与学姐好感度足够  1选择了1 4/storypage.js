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

// -------------------- 剧情数据 --------------------
const dialogues = [
  { name: "B", text: "时光飞逝 下半学期已过去大半 ..." },
  { name: "C", text: "今天 是你们约定好去水族馆的日子 而你起晚了" },
  { name: "B", text: "这不能怪我啊！ 明明订好了闹钟为什么会不响啊！！" }, 
  { name: "舍友", text: "明明是你自己说要再睡一会就拍掉了…" }, 
  { name: "C", text: "不管了！ 去水族馆要紧" }, 
  { name: "C", text: "你飞奔下楼 骑上一辆共享单车 （希望不会是坏掉的） 天遂人愿 你勉强在约定的时间中赶到了学校的水族馆前" },
  { name: "C", text: "她站在水族馆门口 以一副幽怨的眼神注视着你 伸出手指在你的脑袋上敲了一下" },
  { name: "A", text: "“头发都没梳好 还说自己起床了！ 我教你的穿搭技巧倒是有好好在学…”" },
  { name: "A", text: "用手轻轻梳理着你的头发 一边打量着你全身的穿着" },
  { name: "B", text: "这可是我花了一晚上才挑选出来的 要不然怎么会起晚） 想着 你也观察起她的穿着" },
  { name: "C", text: "她身着一件淡蓝色的衬衫 外面是一件短款的夹克 下身穿着一件高腰牛仔裤 头上戴着一只米色的棒球帽 虽然简约 但在她如同明星般的比例与气质的映衬下 还是让人难以移开目光 惹得走过的路人频频注目" },
  { name: "A", text: "怎么样 学姐的专业穿搭” 她的脸上扬起一种自豪感 仿佛在等待你的夸奖" },
  { name: "B", text: "非常漂亮，真是让人移不开眼睛呢" },
  { name: "B", text: "你将内心的想法和盘托出" },
  { name: "C", text: "学姐愣了一下，转身牵起你的手走进了水族馆" },
  { name: "B", text: "你发现，学姐的耳根微微发红" },
  { name: "C", text: "水族馆中的灯光暗淡 只剩下水箱中淡淡的蓝色弥漫在空气之中" },
  { name: "C", text: "她在你面前走着 由于是第一次来 好奇的看着周围种类繁多的鱼 显得有些可爱" },
  { name: "C", text: "忽然 她在一面水箱前停下 露出一副“坚毅的眼神”" },
  { name: "B", text: "“你该不会…” 在你心中升起一种不妙的预感" },
  { name: "A", text: "“sakana~”她向前伸出双手 单脚站在地上 像是在模仿水箱中游荡的鱼儿" },
  { name: "B", text: "在你不知所措时 却看到她注视着你 似乎想让你也加入其中" },
  { name: "C", text: "你高举着双手 加入了其中 引得旁边的同学驻足" },
  { name: "C", text: "你们毫不在意 相视一笑后 向前方继续走着 不同的是 你们的十指紧紧扣在了一起" },  
  { name: "A", text: "牵着你的手 向着一个方向快速前进着 像是有什么确定的目标 你虽然疑惑 但也毫无抗拒着跟着不断向前" }, 
  { name: "C", text: "在走过一段长廊后 迎面而来的是一个「360 度全透明」的水下世界 水下的各种植物与动物毫无掩饰的展现在眼前 光源也只剩下了水中泛出的微光 世界仿佛都黯淡了下来" },
  { name: "A", text: "「这里是我朋友推荐的哦 怎么样 很有震撼感吧~」" },  
  { name: "C", text: "你确实被这场景震撼到 不由得点了点头" }, 
  { name: "A", text: "「她还说 这里最适合…」 声音在最关键的地方消失" }, 
  { name: "B", text: "「???」 你看着她莫名羞红的脸 忽然仿佛有了答案" },
  { name: "C", text: "在淡蓝色的世界中 你伸出了双手 将学姐拥入怀中" },
  { name: "A", text: "你感受到学姐并没有任何反抗 反而迎合着你 伸手抱住了你" },  
  { name: "C", text: "你看着怀中的学姐 脸颊上的红晕甚至比刚才更加明显 她的嘴唇微微颤动 仿佛有话要说 你便试着将耳朵贴的更近了一点" }, 
  { name: "A", text: "我喜欢你…" }, 
  { name: "B", text: "整个世界好像只剩下了这一句话的声音 你被这突如其来的告白怔在了原地 一时说不出话" },
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
             characterAvatar.src = '';
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
      characterAvatar.src = '';
    }

    nameBox.textContent = displayName;
  }

  typeText(dialogues[index].text, () => {
    if (index === 999) autoSave();
  });
}

// -------------------- 下一句 --------------------
function handleNext() {
  const curLen = dialogues[index]?.text?.length || 0;
  // 如果仍在打字中，点击只显示完整文本
  if (charIndex < curLen) {
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = dialogText.textContent.length;
    stopAutoPlay();
    return;
  }

  // 已经显示完整文本，推进下一句或结束
  if (index < dialogues.length - 1) {
    showDialogue(index + 1);
  } else {
    try { hideChoices(); } catch (e) { /* ignore if not available */ }
    stopAutoPlay();
    alert("游戏结束！");
    console.log("准备跳转到主页...");
    setTimeout(() => {
      window.location.replace("../../index.html");
    }, 120);
  }
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
        // 游戏结束，隐藏选择并提示，然后返回主页
        stopAutoPlay();
        try { hideChoices(); } catch (e) { /* ignore if not available */ }
        alert("游戏结束！");
        // 返回主页（相对路径向上两级到仓库根目录的 index.html）
        window.location.href = "../../index.html";
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
    newSaveBtn.addEventListener("click", () => {
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

      // 仅在 initSaveUI 存在的情况下调用（避免 ReferenceError）
      if (typeof initSaveUI === "function") {
        initSaveUI();
      }
    });
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
  // 仅响应左键点击
  if (e instanceof MouseEvent && e.button !== 0) return;

  // 如果存在手机等待状态并且正在等待，则不响应点击推进
  if (typeof waitingForPhoneResponse !== 'undefined' && waitingForPhoneResponse) return;

  const target = e.target;
  // 避免在按钮、输入、链接、侧边栏、聊天输入或选择按钮上触发
  const interactive = target.closest && (
    target.closest('button') ||
    target.closest('input') ||
    target.closest('a') ||
    target.closest('#sidebar') ||
    target.closest('.chat-input') ||
    target.closest('.choice-btn')
  );
  if (isChoiceActive || interactive) return;

  // 如果当前对话仍在打字中，则点击只显示完整文本；否则推进下一句
  const curTextLen = dialogues[index]?.text?.length || 0;
  if (charIndex < curTextLen) {
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = curTextLen;
    return;
  }

  handleNext();
});
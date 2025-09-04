// -------------------- DOMContentLoaded 初始化 --------------------
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
  initAffection();
  showDialogue('common', 0);
  bindControlButtons();
  bindScreenClick();
  console.log("游戏初始化完成");
});

// -------------------- 剧情台词 --------------------
const dialogues = {
  common: [
    { "name": "旁白", "text": "怀着对一切大学生活的好奇，你走进了BIT的大门。当然，还有你的青梅陪着你——你俩都以不错的成绩考进了BIT。" },
    { "name": "旁白", "text": "新生各项事宜的办理略显繁琐，你和青梅又并非同个专业，二人只得暂时分离，约定等一切忙完后共进晚餐。" },
    { "name": "旁白", "text": "书院迎新场地，专业咨询四字吸引了你的目光，你连忙走上前想要咨询更多信息，毕竟初来乍到的你对自己的专业也并不太了解，也想借此机会认识更多的同学——看动漫上就是这样，大学生活就是各种各样的社团和结交新的朋友。" },
    { "name": "旁白", "text": "专业咨询场地人满为患，你看见有位同学刚咨询完一名学姐，便连忙走上前。" },
    { "name": "你", "text": "学姐你好，我想咨询一下XX专业的相关信息。" },
    { "name": "学姐", "text": "你好呀！这个专业……（介绍专业信息）。对了，今晚在文体中心还有一场专门的专业宣讲会，内容会更详细，感兴趣的话可以去听听。" },
    { "name": "你", "text": "文体中心，在哪呀？" },
    { "name": "学姐", "text": "就是东校区体育馆那边……" },
    { "name": "旁白", "text": "见你仍旧一脸疑惑，学姐再次开口。" },
    { "name": "学姐", "text": "你有加我们新生群吗？里面有我们学校的地图。" },
    { "name": "你", "text": "还没有。" },
    { "name": "旁白", "text": "学姐低头在桌上开始翻找。" },
    { "name": "学姐", "text": "奇怪，新生群二维码呢？" },
    { "name": "旁白", "text": "边上一名同学说：“被XXX他们拿去招人了。” 学姐悄悄翻了个白眼，说到：" },
    { "name": "学姐", "text": "这样吧同学，你先加我QQ，我把你拉到新生群里去。" },
    { "name": "旁白", "text": "……" },
    { "name": "旁白", "text": "你成功加到了学姐的QQ，也加入到了新生群，看到了校园地图。" },
    { "name": "旁白", "text": "你继续逛着迎新会，闲来无事翻看了学姐QQ空间，发现你们兴趣爱好非常相同，并且学姐还是一名coser。" },
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
    window.location.href = sceneUrl || "../coser/index.html.html";
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

  // 控制角色立绘显示
  updateCharacterDisplay(dialogue.name);

  typeText(dialogue.text, () => {
    // 对话显示完成后，只处理特定条件，不自动继续
    if (dialogue.triggerChoice && !hasMadeChoice) {
      // 显示选择框，但不自动继续
    } else if (dialogue.effect) {
      applyEffect(dialogue.effect);
      // 应用效果，但不自动继续
    } else if (dialogue.nextScene) {
      // 跳转场景，但不自动继续
    }
    // 不再自动播放下一句，等待用户点击
  });
}

// -------------------- 更新角色立绘显示 --------------------
function updateCharacterDisplay(name) {
  // 获取角色立绘元素
  const mainCharacter = document.getElementById('main-character');
  const senpaiImg = document.getElementById('senpai-img');
  const friendImg = document.getElementById('friend-img');
  
  // 默认情况下隐藏所有角色
  if (mainCharacter) mainCharacter.classList.add('hidden');
  if (senpaiImg) senpaiImg.classList.add('hidden');
  if (friendImg) friendImg.classList.add('hidden');
  
  // 根据说话者显示对应的角色
  if (name === '你' || name === '系统') {
    // 主角说话或系统旁白时显示主角
    if (mainCharacter) mainCharacter.classList.remove('hidden');
  } else if (name === '学姐') {
    // 学姐说话时显示学姐
    if (senpaiImg) senpaiImg.classList.remove('hidden');
  } else if (name === '朋友') {
    // 朋友说话时显示朋友
    if (friendImg) friendImg.classList.remove('hidden');
  }
}

// -------------------- 下一句按钮 --------------------
function handleNext() {
  const currentDialogues = dialogues[currentBranch];
  
  if (charIndex < currentDialogues[index].text.length) {
    // 如果正在打字，立即完成当前对话
    clearInterval(typingInterval);
    dialogText.textContent = currentDialogues[index].text;
    charIndex = currentDialogues[index].text.length;
    return;
  }
  
  // 检查当前对话的特殊条件
  const currentDialogue = currentDialogues[index];
  
  if (currentDialogue.triggerChoice && !hasMadeChoice) {
    // 显示选择框，不自动继续
    showChoices(currentDialogue.triggerChoice);
    return;
  }
  
  if (currentDialogue.nextScene) {
    // 跳转到下一个场景
    goToNextScene(currentDialogue.nextScene);
    return;
  }
  
  // 普通对话，继续下一句
  if (index < currentDialogues.length - 1) {
    showDialogue(currentBranch, index + 1);
  } else {
    console.log("已经是最后一句对话");
  }
  
  stopAutoPlay();
}

// -------------------- 显示选择框 --------------------
function showChoices(choiceType) {
  if (hasMadeChoice) {
    console.log("已经做出选择，不再显示选择框");
    return;
  }
  
  dialogBox.style.display = "none";
  if (choiceType === "main") {
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
  if (hasMadeChoice) {
    console.log("已经做出选择，不能再选择");
    return;
  }
  
  const choice = event.currentTarget.dataset.choice;
  hideAllChoices();
  hasMadeChoice = true;

  // 切换到选择的分支，从第0句开始
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
    if (loadedData.senpai !== undefined) {
      affectionData.senpai = loadedData.senpai;
    }
  }
  updateAffection('senpai', affectionData.senpai);
}

// -------------------- 屏幕点击继续 --------------------
function bindScreenClick() {
  document.body.addEventListener('click', function(event) {
    // 确保点击的不是UI元素
    if (!event.target.closest('.choice-btn') && 
        !event.target.closest('.control-images') &&
        !event.target.closest('#sidebar') &&
        !event.target.closest('#sidebar-toggle') &&
        !event.target.closest('#phone-chat-interface') &&
        !event.target.closest('#phone-image')) {
      handleNext();
    }
  });
}

// -------------------- 自动播放控制 --------------------
function toggleAutoPlay() {
  autoPlay = !autoPlay;
  if (autoPlay) {
    autoBtn.textContent = "停止自动";
    startAutoPlay();
  } else {
    stopAutoPlay();
  }
}

function startAutoPlay() {
  clearInterval(autoInterval);
  autoInterval = setInterval(() => {
    handleNext();
  }, 3000);
}

function stopAutoPlay() {
  clearInterval(autoInterval);
  autoPlay = false;
  if (autoBtn) autoBtn.textContent = "自动播放";
}

// -------------------- 其他控制按钮 --------------------
function handlePrev() {
  if (index > 0) {
    showDialogue(currentBranch, index - 1);
  }
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
  
  choiceBtns.forEach(btn => {
    btn.addEventListener("click", handleChoice);
  });
  
  // 绑定空格键实现下一句功能
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault(); // 阻止默认行为（页面滚动）
      handleNext();
    }
  });
}
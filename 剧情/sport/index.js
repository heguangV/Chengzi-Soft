const dialogText = document.getElementById("dialog-text");
const nameBox = document.querySelector(".character-name");
const characterAvatar = document.querySelector("#character-avatar");
const characterAvatarContainer = document.querySelector("#character-avatar-container");

const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const speedBtn = document.getElementById("speed-btn");
const autoBtn = document.getElementById("auto-btn");
const skipBtn = document.getElementById("skip-btn");

const choiceContainer = document.getElementById("choice-container");
const choiceBtns = document.querySelectorAll(".choice-btn");
const dialogBox = document.querySelector(".dialog-box");

const autoSaveNotice = document.getElementById("auto-save-notice");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebar = document.getElementById("sidebar");
const mainMenuBtn = document.getElementById("main-menu-btn");
const loadBtn = document.getElementById("load-btn");
const saveBtn = document.getElementById("save-btn");
const musicBtn = document.getElementById("music-btn");
const volumeRange = document.getElementById("volume-range");
const bgMusic = document.getElementById("bg-music");

// -------------------- 状态变量 --------------------
let index = 0;
let charIndex = 0;
let typingSpeed = 50;
let typingInterval = null;

let autoPlay = false;
let autoInterval = null;
let isFast = false;
let isChoiceActive = false;
let isPaused = false;
let spaceDown = false; // 防止空格长按重复触发

// 选择后的回退边界：不允许回退到该索引之前（用于防止回到选择前）
let minIndex = 0;

// 本章选择标志（用于最终判定）
let sportFlags = { ramen: false, chashao: false };

function loadSportFlags() {
  try {
    const saved = JSON.parse(localStorage.getItem('sportFlags') || '{}');
    if (saved && typeof saved === 'object') {
      sportFlags.ramen = !!saved.ramen;
      sportFlags.chashao = !!saved.chashao;
    }
  } catch (e) {}
}

function saveSportFlags() {
  try { localStorage.setItem('sportFlags', JSON.stringify(sportFlags)); } catch (e) {}
}

function getStoryFlags() {
  try { return JSON.parse(localStorage.getItem('storyFlags') || '{}'); } catch (e) { return {}; }
}

// -------------------- 每句对白音效（speak） --------------------
const SFX_SPEAK_URL = '../../asset/sounds/speak.ogg';
let _speakAudio = null;
let _speakLastIndex = -1;
function getSpeakAudio() {
  if (_speakAudio) return _speakAudio;
  try {
    _speakAudio = new Audio(SFX_SPEAK_URL);
    _speakAudio.preload = 'auto';
    _speakAudio.volume = 0.6;
  } catch (e) { /* noop */ }
  return _speakAudio;
}
function playSpeakOnceFor(indexVal) {
  if (typeof indexVal !== 'number') return;
  if (_speakLastIndex === indexVal) return; // 避免重复渲染同一句时重复播放
  _speakLastIndex = indexVal;
  const a = getSpeakAudio();
  if (!a) return;
  try {
    a.pause();
    a.currentTime = 0;
    a.play().catch(() => {});
  } catch (e) { /* ignore */ }
}

// -------------------- 背景切换（按注释语义） --------------------
// 按注释语义的文本特征识别场景标签，直到下一个标签前背景保持不变
let currentBgTag = null; // 'room' | 'shop' | 'yundonghui' | 'school' | null
const BG_BY_TAG = {
  room: '../../asset/images/room.png',
  shop: '../../asset/images/shopstreet.png',
  yundonghui: '../../asset/images/yundonghui.jpg',
  school: '../../asset/images/school.png'
};

// 背景转场：黑场淡入淡出，避免突兀切换
let _bgFadeOverlay = null;
let _bgFadeBusy = false;
let _bgFadePending = null;

function getBgFadeOverlay() {
  if (_bgFadeOverlay) return _bgFadeOverlay;
  const ov = document.createElement('div');
  ov.id = 'bg-fade-overlay';
  ov.style.position = 'fixed';
  ov.style.left = '0';
  ov.style.top = '0';
  ov.style.width = '100%';
  ov.style.height = '100%';
  ov.style.background = '#000';
  ov.style.opacity = '0';
  ov.style.transition = 'opacity 220ms linear';
  ov.style.pointerEvents = 'none';
  ov.style.zIndex = '9998'; // 低于游戏覆盖层(9999)，但高于普通背景
  document.body.appendChild(ov);
  _bgFadeOverlay = ov;
  return ov;
}

function setSceneBackground(url) {
  if (!url) return;
  try {
    const ov = getBgFadeOverlay();
    const doSwap = (nextUrl) => {
      // 淡入黑场
      ov.style.transition = 'opacity 220ms linear';
      ov.style.opacity = '1';
      setTimeout(() => {
        // 切换背景
        document.body.style.backgroundImage = `url("${nextUrl}")`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center center';
        document.body.style.backgroundRepeat = 'no-repeat';
        // 淡出黑场
        requestAnimationFrame(() => {
          ov.style.transition = 'opacity 300ms ease';
          ov.style.opacity = '0';
          setTimeout(() => {
            _bgFadeBusy = false;
            if (_bgFadePending) {
              const pending = _bgFadePending; _bgFadePending = null;
              setSceneBackground(pending);
            }
          }, 310);
        });
      }, 230);
    };

    if (_bgFadeBusy) {
      _bgFadePending = url; // 合并快速连续的切换
      return;
    }
    _bgFadeBusy = true;
    doSwap(url);
  } catch (e) {}
}

function maybeUpdateBackgroundByDialogue(d) {
  if (!d || !d.text) return;
  const t = d.text;
  // 根据注释对应的关键句识别
  if (t.indexOf('转眼到了选课的日子') !== -1) {
    if (currentBgTag !== 'room') {
      currentBgTag = 'room';
      setSceneBackground(BG_BY_TAG.room);
    }
    return;
  }
  if (t.indexOf('在校门口汇合，一起去了天街') !== -1) {
    if (currentBgTag !== 'shop') {
      currentBgTag = 'shop';
      setSceneBackground(BG_BY_TAG.shop);
    }
    return;
  }
  if (t.indexOf('你们一起来到了操场') !== -1) {
    if (currentBgTag !== 'yundonghui') {
      currentBgTag = 'yundonghui';
      setSceneBackground(BG_BY_TAG.yundonghui);
    }
    return;
  }
  // 进入文萃或北湖的两处台词时切换为校园背景
  if (t.indexOf('刚走入文萃') !== -1 || t.indexOf('冬日的北湖边显得格外凄清') !== -1) {
    if (currentBgTag !== 'school') {
      currentBgTag = 'school';
      setSceneBackground(BG_BY_TAG.school);
    }
    return;
  }
}

// -------------------- 剧情对话 --------------------
const dialogues = [
  { name: "旁白", text: "转眼到了选课的日子，你也投入到了紧张刺激的抢课环节。" },//room
  { name: "旁白", text: "开始抢课", playGame: "jianshu" },
  { name: "你", text: "呼...学校的选课网站什么时候才能正常啊？" },
  { name: "你", text: "真是气人..." },
  { name: "你", text: "说起来，最近有些奇怪，好感度总是没有反应" },
  { name: "你", text: "和学姐聊天的时候，也能感觉到她好像有些顾虑" },
  { name: "你", text: "到底是怎么回事呢？" },
  { name: "学姐", text: "我有点想出去逛逛，要跟我一起吗" },
  { name: "你", text: "好！这就来！" },
  { name: "学姐", text: "嗯嗯，我在校门口等你哦" },
  { name: "旁白", text: "你和学姐在校门口汇合，一起去了天街" },//shop
  { name: "学姐", text: "自从在天街偶然和你碰面，我就觉得你很特别呢" },
  { name: "学姐", text: "你和其他人不一样，一直能照顾我的心情呢" },
  { name: "学姐", text: "你不会是有什么特异功能吧?" },
  { name: "学姐", text: "哈哈，开个玩笑，以前怎么没有发现你这么好的人呢" },
  { name: "你", text: "这个......" },
  { name: "学姐", text: "........." },
  { name: "学姐", text: "诶，那里好像有抢冰红茶的活动，去看看吧" },
  { name: "你", text: "好啊，看我的吧！", playGame: "binghongcha" },
  { name: "学姐", text: "哦吼 没想你的身手也挺好的嘛" },
  { name: "学姐", text: "有点饿了，你有什么想吃的吗" },
  { name: "旁白", text: "你试着指了几个，发现好感度没有任何变化" },
  { name: "你", text: "只能靠自己选了吗...学姐爱吃什么呢"},
  { name: "你", text: "嗯...", hasChoice: true }
];

// -------------------- 手机聊天（todo -> 结束手机 段） --------------------
const PHONE_START_IDX = 7; // 对应 //todo:手机振动
const PHONE_END_IDX = 9;   // 对应 //结束手机
let phoneSequenceActive = false;
let phoneSequenceDone = false;
let phoneUIEl = null;
let chatMessagesEl = null;
let chatCloseBtnEl = null;

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
      if (phoneSequenceActive) finishPhoneSequence(true);
      else closeChatInterface();
    });
    chatCloseBtnEl._bound = true;
  }
}

function openChatInterface() {
  if (!getPhoneEls()) return;
  phoneUIEl.classList.add('show');
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

function runSportPhoneSequence() {
  if (phoneSequenceActive || phoneSequenceDone) return;
  if (!getPhoneEls()) {
    console.warn('未找到手机聊天界面，跳过手机聊天序列');
    showDialogue(PHONE_END_IDX + 1);
    return;
  }

  // 停止推进并隐藏对话框
  isPaused = true;
  clearInterval(typingInterval);
  stopAutoPlay();
  if (dialogBox) dialogBox.style.display = 'none';

  phoneSequenceActive = true;

  // 读取对话 6..8，学姐 -> received，你 -> sent
  const seq = [];
  for (let i = PHONE_START_IDX; i <= PHONE_END_IDX; i++) {
    const d = dialogues[i];
    if (!d) continue;
    const sender = d.name === '你' ? 'sent' : 'received';
    seq.push({ sender, text: d.text });
  }

  openChatInterface();
  vibratePhone(800);
  chatMessagesEl.innerHTML = '';

  const step = 1200;
  seq.forEach((m, i) => setTimeout(() => addChatMessage(m.sender, m.text), i * step));
  const total = seq.length * step + 2000;
  setTimeout(() => finishPhoneSequence(false), total);
}

function finishPhoneSequence(fromUserClose) {
  phoneSequenceActive = false;
  phoneSequenceDone = true;
  isPaused = false;

  if (getPhoneEls() && phoneUIEl.classList.contains('show')) closeChatInterface();
  if (dialogBox) dialogBox.style.display = 'block';

  showDialogue(PHONE_END_IDX + 1);
}

// -------------------- 好感度系统 --------------------

function updateAffection(value) {
  affectionData.fang = Math.max(0, Math.min(100, affectionData.fang + value));
  const bar = document.querySelector('.affection-fill[data-character="fang"]');
  const text = document.querySelector('.affection-text');
  if (bar) bar.style.width = `${affectionData.senpai}%`;
  if (text) text.textContent = `学姐: ${affectionData.senpai}%`;

  
  // 显示好感度变化
  if (value > 0) {
    showNotice(`学姐好感度 +${value}`);
  }
}

function initAffection() {
  const savedData = localStorage.getItem('affectionData');
  if (savedData) affectionData = JSON.parse(savedData);
  updateAffection(0);
}

function showNotice(message) {
  const notice = document.createElement('div');
  notice.className = 'save-notice';
  notice.textContent = message;
  document.body.appendChild(notice);
  
  setTimeout(() => {
    notice.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notice.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notice);
    }, 500);
  }, 2000);
}

// -------------------- 打字机效果 --------------------
function typeText(text, callback) {
  clearInterval(typingInterval);
  charIndex = 0;
  if (dialogText) dialogText.textContent = "";

  typingInterval = setInterval(() => {
    if (dialogText && charIndex < text.length) {
      dialogText.textContent += text[charIndex];
      charIndex++;
    } else {
      clearInterval(typingInterval);
      if (callback) callback();
    }
  }, typingSpeed);
}

function showDialogue(idx) {
  // 拦截到达手机段落的请求
  if (idx === PHONE_START_IDX && !phoneSequenceActive && !phoneSequenceDone) {
    runSportPhoneSequence();
    return;
  }
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;

  // 播放每句对白开始音效
  playSpeakOnceFor(index);
  // 不允许回退到锁定边界之前（防止回到选择前）
  if (idx < minIndex) idx = minIndex;
  index = idx;

  // 动态触发两处 TODO 的选择
  const maybe = dialogues[index];
  if (maybe && maybe.triggerChoice && !isChoiceActive) {
    showChoiceMenu(maybe.triggerChoice);
    return;
  }

  let currentName = dialogues[index].name;
  if (nameBox) nameBox.textContent = currentName;

  // 根据角色显示不同头像
    if (currentName === "旁白") {
      // 旁白不显示任何立绘
      if (characterAvatarContainer) {
        characterAvatarContainer.style.display = 'none';
        characterAvatarContainer.style.visibility = 'hidden';
      }
      if (characterAvatar) {
        characterAvatar.style.display = 'none';
        characterAvatar.style.visibility = 'hidden';
        // 清除 src 避免残留图片
        characterAvatar.src = '';
        characterAvatar.alt = '';
      }
    } else if (currentName === "学姐") {
      if (characterAvatar) {
        characterAvatar.src = "../../asset/images/学姐.png";
        characterAvatar.alt = "学姐头像";
        characterAvatar.style.display = 'block';
        characterAvatar.style.visibility = 'visible';
      }
      if (characterAvatarContainer) {
        characterAvatarContainer.style.display = 'block';
        characterAvatarContainer.style.visibility = 'visible';
      }
    } else if (currentName === "你") {
      if (characterAvatar) {
        characterAvatar.src = "../../asset/images/男主.png";
        characterAvatar.alt = "主角头像";
        characterAvatar.style.display = 'block';
        characterAvatar.style.visibility = 'visible';
      }
      if (characterAvatarContainer) {
        characterAvatarContainer.style.display = 'block';
        characterAvatarContainer.style.visibility = 'visible';
      }
    } else {
      // 未知角色默认不显示立绘，但不报错
      if (characterAvatarContainer) {
        characterAvatarContainer.style.display = 'none';
        characterAvatarContainer.style.visibility = 'hidden';
      }
      if (characterAvatar) {
        characterAvatar.style.display = 'none';
        characterAvatar.style.visibility = 'hidden';
        characterAvatar.src = '';
        characterAvatar.alt = '';
      }
    }

  const currentDialogue = dialogues[index];

  // 在显示文本前，按注释语义尝试切换背景（保持到下一个标签）
  maybeUpdateBackgroundByDialogue(currentDialogue);
     // 如果到达特定剧情，解锁成就
     if (index === 3) { 
      achievementSystem.unlockAchievement("qiangke");
    }
  

  // 如果是结局台词，直接显示文字并跳转
  if (currentDialogue.ending) {
    if (dialogText) dialogText.textContent = currentDialogue.text;
    charIndex = currentDialogue.text.length;

    const endingType = currentDialogue.ending;
    // 对于 'home' 结局：立刻提示并返回主页，不再推进剧情
    if (endingType === 'home') {
      // 北湖分支的终句：“好感度吗，或许只是属于我的一场梦吧” —— 点亮“终为陌路”
      try {
        const text = (currentDialogue && currentDialogue.text) || '';
        if (text.indexOf('好感度吗，或许只是属于我的一场梦吧') !== -1 && window.achievementSystem && typeof window.achievementSystem.unlockAchievement === 'function') {
          window.achievementSystem.unlockAchievement('zhongwei_molu');
        }
      } catch (e) { /* noop */ }
      stopAutoPlay();
      isPaused = true;
      try { alert('游戏结束'); } catch (e) {}
      window.location.href = '../../index.html';
      return;
    }

    setTimeout(() => {
      // 如果明确指定结局类型，则直接跳转对应结局
      if (endingType === 'byFlags') {
        const sp = (function(){
          try { return JSON.parse(localStorage.getItem('sportFlags') || '{}'); } catch (e) { return {}; }
        })();
        const choseRamen = !!(sportFlags.ramen || sp.ramen);
        const choseChashao = !!(sportFlags.chashao || sp.chashao);
        if (choseRamen && choseChashao) {
          window.location.href = "../../与学姐好感度足够分支/storypage2.0 与学姐好感度足够  1选择了1 4/storypage.html";
        } else {
          window.location.href = "../../与学姐好感度不足分支/merged_story/storypage.html";
        }
        return;
      }
      if (endingType === 'insufficient' || endingType === 'bad') {
        window.location.href = "../../与学姐好感度不足分支/merged_story/storypage.html";
        return;
      }
      if (endingType === 'sufficient' || endingType === 'good') {
        window.location.href = "../../与学姐好感度足够分支/storypage2.0 与学姐好感度足够  1选择了1 4/storypage.html";
        return;
      }
      // 否则按好感度阈值跳转
      console.log("当前好感度:", affectionData.fang);
      if (affectionData.fang < 70) {
        window.location.href = "../../与学姐好感度不足分支/merged_story/storypage.html";
      } else {
        window.location.href = "../../与学姐好感度足够分支/storypage2.0 与学姐好感度足够  1选择了1 4/storypage.html";
      }
    }, 2000);

    return; // 不再进入打字机
  }
  // 检查是否需要触发手机震动
  if (dialogues[index].triggerPhone) {
    isPaused = true;
    stopAutoPlay();
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;

    if (window.makePhoneVibrate) {
      window.makePhoneVibrate();
      window.onPhoneVibrationComplete = function() {
        isPaused = false;
        if (index < dialogues.length - 1) {
          showDialogue(index + 1);
        }
      };
    }

    if (!window._phoneOpenListenerAdded) {
      window._phoneOpenListenerAdded = true;
      let lastPhoneOpen = window.phoneOpen;
      setInterval(function() {
        if (lastPhoneOpen && !window.phoneOpen && isPaused) {
          isPaused = false;
          if (index < dialogues.length - 1) {
            showDialogue(index + 1);
          }
        }
        lastPhoneOpen = window.phoneOpen;
      }, 300);
    }
    return;
  }

  typeText(dialogues[index].text, () => {
    if (dialogues[index].hasChoice) {
      forceShowChoices();
    }

    
  });
}

// -------------------- 强制显示选择框 --------------------
function forceShowChoices() {
  isChoiceActive = true;
  if (choiceContainer) choiceContainer.classList.remove("hidden");
  if (dialogBox) dialogBox.style.display = "none";
  
  clearInterval(typingInterval);
  clearInterval(autoInterval);
  stopAutoPlay();
}

// 辅助：当前行是否需要显示选项（用于防止快速点击跳过回调）
function isCurrentLineNeedingChoice() {
  try {
    const d = dialogues[index];
    return !!(d && d.hasChoice === true);
  } catch (e) { return false; }
}

// 辅助：若当前行应显示选项且尚未显示，则立刻显示，并返回 true 表示已处理
function ensureChoiceIfNeeded() {
  if (isCurrentLineNeedingChoice() && !isChoiceActive) {
    forceShowChoices();
    return true;
  }
  return false;
}

// -------------------- 动态选择菜单（用于多处 todo） --------------------
let currentChoiceType = null; // 'topping' | 'search' | 'reveal' | 'vision' | null

function showChoiceMenu(choiceType) {
  if (!choiceContainer) return;
  currentChoiceType = choiceType;

  // 准备选项列表
  let options = [];
  if (choiceType === 'topping') {
    options = [
      { text: '叉烧', code: 'topping_chashao' },
      { text: '关东煮', code: 'topping_odenk' },
      { text: '饺子', code: 'topping_dumpling' }
    ];
  } else if (choiceType === 'search') {
    options = [
      { text: '去北湖转转', code: 'search_beihu' },
      { text: '去文萃转转', code: 'search_wencui' }
    ];
  } else if (choiceType === 'reveal') {
    options = [
      { text: '承认', code: 'reveal_confess' },
      { text: '隐瞒', code: 'reveal_hide' }
    ];
  } else if (choiceType === 'vision') {
    options = [
      { text: '放弃', code: 'vision_abandon' },
      { text: '犹豫', code: 'vision_hesitate' }
    ];
  }

  // 准备按钮：优先复用已有按钮，不足则动态创建并在隐藏时移除
  const staticBtns = Array.from(choiceContainer.querySelectorAll('.choice-btn'));
  for (let i = 0; i < options.length; i++) {
    let btn = staticBtns[i];
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.setAttribute('data-dynamic', '1');
      choiceContainer.appendChild(btn);
      // 为动态新增按钮添加点击处理
      btn.addEventListener('click', () => {
        if (!isChoiceActive) return;
        handleChoice(btn.dataset.choice);
      });
    }
    btn.textContent = options[i].text;
    btn.dataset.choice = options[i].code;
    btn.style.display = '';
  }
  // 多余的静态按钮隐藏
  for (let i = options.length; i < staticBtns.length; i++) {
    staticBtns[i].style.display = 'none';
  }

  // 显示容器
  isChoiceActive = true;
  choiceContainer.classList.remove('hidden');
  if (dialogBox) dialogBox.style.display = 'none';
  clearInterval(typingInterval);
  stopAutoPlay();
}

// -------------------- 隐藏选择框 --------------------
function hideChoices() {
  isChoiceActive = false;
  if (choiceContainer) choiceContainer.classList.add("hidden");
  if (dialogBox) dialogBox.style.display = "block";
  // 清理动态创建的按钮
  if (choiceContainer) {
    const dyn = choiceContainer.querySelectorAll('.choice-btn[data-dynamic="1"]');
    dyn.forEach(btn => btn.remove());
    // 恢复被隐藏的静态按钮显示状态与默认文案（不强制重置文案，后续菜单会覆盖）
    const statics = choiceContainer.querySelectorAll('.choice-btn:not([data-dynamic])');
    statics.forEach(btn => btn.style.display = '');
  }
}

// -------------------- 处理选择 --------------------
function handleChoice(choice) {
  hideChoices();
  // 锁定回退边界：做出选择后，上一句不得回到选择前
  // 选择触发位置为当前 index（系统/提示行），实际进入的是 index+1
  if (typeof index === 'number') {
    minIndex = Math.max(minIndex, index + 1);
  }
  // 处理两处 TODO 的动态选择
  if (currentChoiceType === 'topping') {
    if (choice === 'topping_chashao') {
      try { if (typeof updateAffection === 'function') updateAffection(5); } catch (e) {}
  sportFlags.chashao = true; saveSportFlags();
    }
    currentChoiceType = null;
    showDialogue(index + 1);
    return;
  }
  if (currentChoiceType === 'search') {
    // 去北湖：直接进入下一句（北湖分支）
    if (choice === 'search_beihu') {
      currentChoiceType = null;
  // 锁到北湖分支第一句，禁止回到选择前
  minIndex = Math.max(minIndex, index + 1);
      showDialogue(index + 1);
      return;
    }
    // 去文萃：跳到文萃分支第一句
    if (choice === 'search_wencui') {
      currentChoiceType = null;
      let target = index + 1;
      for (let i = index + 1; i < dialogues.length; i++) {
        const d = dialogues[i];
        if (d && typeof d.text === 'string' && d.text.indexOf('刚走入文萃') !== -1) {
          target = i;
          break;
        }
      }
  // 进一步收紧边界：直接锁到文萃首句，防止回到北湖分支
  minIndex = Math.max(minIndex, target);
      showDialogue(target);
      return;
    }
  }
  if (currentChoiceType === 'reveal') {
    if (choice === 'reveal_confess') {
      // 插入承认分支对白，并小幅提升好感
      dialogues.splice(index + 1, 0,
        { name: '学姐', text: '哈哈，果然是这样吗...' },
        { name: '你', text: '但是，无论有没有好感度，我都会喜欢上你的。' },
        { name: '你', text: '如果对你有困扰，我真的很抱歉...' }
      );
      try { if (typeof updateAffection === 'function') updateAffection(5); } catch (e) {}
      currentChoiceType = null;
      showDialogue(index + 1);
      return;
    }
    if (choice === 'reveal_hide') {
      // 插入隐瞒分支对白，直接进入不足/坏结局
      dialogues.splice(index + 1, 0,
        { name: '学姐', text: '你不知道吗…' },
        { name: '学姐', text: '抱歉，当我没说过。再给我一些时间缓冲一下吧。' },
        { name: '学姐', text: '我可能没办法在这段时间正常地与你交流了。' },
  { name: '旁白', text: '不知道是不是命运，之后你再也没有看到过学姐。', ending: 'home' }
      );
      currentChoiceType = null;
      showDialogue(index + 1);
      return;
    }
  }
  if (currentChoiceType === 'vision') {
    // 无论选择哪一个，都继续到下一句
    currentChoiceType = null;
    showDialogue(index + 1);
    return;
  }
  
  // 根据选择更新剧情
  if (choice === "A") {
    dialogues.push(
      { name: "学姐", text: "啊，正巧我也想吃呢，一起去吧~" },
    );//增加一个判定为true
  // 选择拉面 -> 标记 ramen 为 true
  sportFlags.ramen = true; saveSportFlags();
  } else if (choice === "B") {
    dialogues.push(
      { name: "学姐", text: "嗯...还是吃拉面吧，有点想吃了。" },
      { name: "你", text: "诶...那一起去吧！" },
    );
  sportFlags.ramen = true; saveSportFlags();
  } else if (choice === "C") {
    dialogues.push(
      { name: "学姐", text: "嗯...还是吃拉面吧，有点想吃了。" },
      { name: "你", text: "诶...那一起去吧！" },
    );
  sportFlags.ramen = true; saveSportFlags();
  }
  
  // 继续剧情
  dialogues.push(
    { name: "旁白", text: "到了拉面店，你们各点了一碗拉面。" },
  { name: "学姐", text: "唔，不知道什么配菜好呢，你有什么推荐的吗" },
  { name: "系统", text: "", triggerChoice: 'topping' },
    { name: "学姐", text: "好啊，那就吃这个吧" },
    { name: "旁白", text: "你们一起吃完，坐上了回学校的摆渡车" },
    { name: "旁白", text: "你看着学姐，好感度一直没有变化" },
    { name: "学姐", text: "要不要去操场散散心？" },
    { name: "你", text: "嗯，啊...听你安排" },
    { name: "旁白", text: "你们一起来到了操场" },//yundonghui
    { name: "学姐", text: "...其实，我一直有点顾虑" },
    { name: "学姐", text: "你总是能完美的迎合我的想法，仿佛能洞穿我的内心一样" },
    { name: "学姐", text: "这么想的时候，我的身边就发生了怪事" },
    { name: "学姐", text: "我好像能看到我自己类似好感度条的东西..." },
    { name: "学姐", text: "我想着最近和我相处的你，会不会也能看到呢？" },
  { name: "你", text: "...这" },//todo:选择：1.承认 2.隐瞒
  { name: "系统", text: "", triggerChoice: 'reveal' },
  // 选择后将插入不同台词分支：见 handleChoice('reveal_*')
    { name: "旁白", text: "学姐对着你笑了笑" },
    { name: "学姐", text: "啊...是这样吗...让我考虑一下吧" },
    { name: "学姐", text: "..." },
{ name: "旁白", text: "在一阵无言的沉默之后，学姐转身跑开了" },
{ name: "你", text: "啊..." },
{ name: "旁白", text: "在你发愣时，学姐已经消失在了视野里" },
{ name: "你", text: "不行...得去找学姐" },
{ name: "你", text: "微信不回信息，电话也不接...怎么办呢" },
  { name: "你", text: "该去哪里找呢" },
  { name: "系统", text: "", triggerChoice: 'search' },
//选1.
{ name: "旁白", text: "冬日的北湖边显得格外凄清" },//school
{ name: "旁白", text: "傍晚的斜阳映照在湖水中，仿佛流光碎金" },
{ name: "你", text: "没在这里吗" },
{ name: "旁白", text: "最终你还是没有找到学姐，只能在微信上留言后离开" },
{ name: "旁白", text: "像是命运的作用，在这之后，你再也没有遇到学姐" },
{ name: "你", text: "好感度吗，或许只是属于我的一场梦吧", ending: 'home' },//end
//选2.
{ name: "旁白", text: "刚走入文萃，你就音乐的听到了空气中弥漫的钢琴声" },//school
{ name: "你", text: "在弹钢琴，学姐也十分纠结吗..." },
{ name: "你", text: "..." },
{ name: "学姐", text: "...（沉默的弹琴）" },
{ name: "学姐", text: "其实我一直在想，如果没有好感度这种东西的话" },
{ name: "学姐", text: "你大概肯定不会像这样与我相处吧" },
{ name: "学姐", text: "但我果然，还是放不下对我无微不至的你" },
{ name: "学姐", text: "生活中的那些人，或许只是有求于我，或是只觉得我好看" },
{ name: "学姐", text: "但你却让我由衷的感到幸福" },
{ name: "学姐", text: "如果说，让你放弃看到好感的能力，你会怎么选呢" },//choice：1.放弃2.犹豫
{ name: "系统", text: "", triggerChoice: 'vision' },
{ name: "学姐", text: "这就是你的选择吗，我明白了", ending: 'byFlags' },// 根据标志跳转到足够/不足结局
  );

  // 显示下一句对话
  showDialogue(index + 1);
}

// -------------------- 停止自动播放 --------------------
function stopAutoPlay() {
  autoPlay = false;
  clearInterval(autoInterval);
  if (autoBtn) autoBtn.textContent = "自动播放";
}

// -------------------- 开始自动播放 --------------------
function startAutoPlay() {
  clearInterval(autoInterval);
  autoInterval = setInterval(() => {
    if (isChoiceActive || isPaused) {
      stopAutoPlay();
      return;
    }
    // 若当前句应有选项但尚未显示，立即弹出并停止自动
    if (ensureChoiceIfNeeded()) {
      stopAutoPlay();
      return;
    }
    
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      if (dialogText) dialogText.textContent = dialogues[index].text;
      // 补全文本后再次检测是否需要出现选项
      ensureChoiceIfNeeded();
    } else {
      if (index < dialogues.length - 1) showDialogue(index + 1);
      else stopAutoPlay();
    }
  }, 2000);
}

// -------------------- 侧边栏控制 --------------------

// -------------------- 侧边栏控制 --------------------

const toggleBtn = document.getElementById("sidebar-toggle");

if (toggleBtn && sidebar) {
  toggleBtn.addEventListener("click", () => sidebar.classList.toggle("show"));
}// -------------------- 音乐控制 --------------------
function toggleMusic() {
  if (bgMusic) {
    if (bgMusic.paused) {
      bgMusic.play();
      if (musicBtn) musicBtn.textContent = "音乐暂停";
    } else {
      bgMusic.pause();
      if (musicBtn) musicBtn.textContent = "音乐播放";
    }
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
// -------------------- 存档系统 --------------------

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
      branch: "common",
      dialogueIndex: index || 0,
      affectionData: { ...affectionData },
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
    loadBtn.addEventListener("click", () => { 
        // 直接跳转到存档界面
        window.location.href = "../../savepage/savepage2.0/save.htm";
    });
}


// -------------------- 事件监听器 --------------------
function bindEventListeners() {
  if (nextBtn) nextBtn.addEventListener("click", () => {
    if (window.phoneOpen) return;
    if (isPaused || isChoiceActive) return;
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      if (dialogText) dialogText.textContent = dialogues[index].text;
      charIndex = dialogues[index].text.length;
      // 兜底：该句应出现选项时，立即弹出并阻止继续
      if (ensureChoiceIfNeeded()) { stopAutoPlay(); return; }
    } else {
      // 若当前句需要选项但尚未弹出，则先弹出
      if (ensureChoiceIfNeeded()) { stopAutoPlay(); return; }
      if (index < dialogues.length - 1) {
        showDialogue(index + 1);
      }
    }
    stopAutoPlay();
  });

  if (prevBtn) prevBtn.addEventListener("click", () => {
    if (isPaused) return;
    showDialogue(index - 1);
    stopAutoPlay();
  });

  if (speedBtn) speedBtn.addEventListener("click", () => {
    if (isPaused) return;
    isFast = !isFast;
    typingSpeed = isFast ? 10 : 50;
    if (speedBtn) speedBtn.textContent = isFast ? "原速" : "加速";
    showDialogue(index);
  });

  if (autoBtn) autoBtn.addEventListener("click", () => {
    if (isPaused) return;
    if (isChoiceActive) return;
    
    autoPlay = !autoPlay;
    if (autoPlay) {
      if (autoBtn) autoBtn.textContent = "停止自动";
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
  });

  if (skipBtn) skipBtn.addEventListener("click", () => {
    if (isChoiceActive) return;
    
    clearInterval(typingInterval);
    if (dialogText) dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
    // 若该句需要选项，立即显示
    ensureChoiceIfNeeded();
  });

  if (choiceBtns && choiceBtns.forEach) {
    choiceBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (!isChoiceActive) return;
        const choice = btn.dataset.choice;
        handleChoice(choice);
      });
    });
  }


  
  mainMenuBtn.addEventListener("click", () => {
    document.body.classList.remove("fade-in");
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "../../index.html";
    }, 500);
  });

  if (musicBtn) musicBtn.addEventListener('click', toggleMusic);
  if (volumeRange && bgMusic) {
    volumeRange.addEventListener('input', () => {
      bgMusic.volume = volumeRange.value / 100;
    });
  }
}
  // 空格键推进剧情（按下只触发一次，长按不会重复触发）
  document.addEventListener('keydown', function(e) {
    // 只处理空格键
    const isSpace = e.code === 'Space' || e.key === ' ' || e.keyCode === 32;
    if (!isSpace) return;
    // 防止长按连续触发
    if (spaceDown) return;
    spaceDown = true;

    if (window.phoneOpen) return;
    if (isPaused) return;
    if (isChoiceActive) return;
    if (charIndex < dialogues[index].text.length) {
      clearInterval(typingInterval);
      if (dialogText) dialogText.textContent = dialogues[index].text;
      charIndex = dialogues[index].text.length;
      if (ensureChoiceIfNeeded()) { stopAutoPlay(); return; }
    } else {
      if (ensureChoiceIfNeeded()) { stopAutoPlay(); return; }
      if (index < dialogues.length - 1) {
        showDialogue(index + 1);
      }
    }
    stopAutoPlay();
  });

  // 在空格松开时允许再次触发
  document.addEventListener('keyup', function(e) {
    const isSpace = e.code === 'Space' || e.key === ' ' || e.keyCode === 32;
    if (isSpace) spaceDown = false;
  });


   // 添加鼠标左键点击事件监听器
  document.addEventListener('click', (e) => {
    if (window.phoneOpen) return;
    if (isPaused) return;
    if (e.target.tagName !== 'BUTTON' && 
        e.target.tagName !== 'INPUT' && 
        e.target.tagName !== 'IMG' &&
        e.target.id !== 'sidebar-toggle' &&
        !e.target.closest('button') &&
        !e.target.closest('input') &&
        !e.target.closest('img') &&
        !e.target.closest('#sidebar-toggle')) {
      if (isChoiceActive) return;
      if (charIndex < dialogues[index].text.length) {
        clearInterval(typingInterval);
        if (dialogText) dialogText.textContent = dialogues[index].text;
        charIndex = dialogues[index].text.length;
        if (ensureChoiceIfNeeded()) { stopAutoPlay(); return; }
      } else {
        if (ensureChoiceIfNeeded()) { stopAutoPlay(); return; }
        if (index < dialogues.length - 1) {
          showDialogue(index + 1);
        }
      }
      stopAutoPlay();
    }
  });


// -------------------- 初始化 --------------------
function init() {
  initAffection();
  showDialogue(0);
  bindEventListeners();

  if (window.phoneModule && window.phoneModule.initPhoneElements) {
    window.phoneModule.initPhoneElements();
    window.phoneModule.initPhoneChat();
  }

  // 监听手机界面开关，控制剧情推进
  window.phoneOpen = false;
  const phoneChatInterface = document.getElementById('phone-chat-interface');
  if (phoneChatInterface) {
    const observer = new MutationObserver(() => {
      window.phoneOpen = phoneChatInterface.classList.contains('show');
    });
    observer.observe(phoneChatInterface, { attributes: true, attributeFilter: ['class'] });
  }

  // 绑定手机界面关闭按钮
  bindPhoneUI();

  // 音乐默认播放（若被策略阻止，首次用户交互再播放）；同时同步初始音量
  tryAutoPlayMusic();
}

// -------------------- DOMContentLoaded 初始化 --------------------
document.addEventListener('DOMContentLoaded', function() {
  document.body.classList.add("fade-in");
  init();
});

// ------- 音乐默认播放兜底与初始化 -------
function tryAutoPlayMusic() {
  if (!bgMusic) return;
  // 初始化音量为滑块值或 50%
  const v = Math.max(0, Math.min(100, Number(volumeRange && volumeRange.value) || 50));
  bgMusic.volume = v / 100;
  if (volumeRange) {
    volumeRange.value = String(v);
    volumeRange.addEventListener('input', () => {
      bgMusic.volume = Math.max(0, Math.min(1, Number(volumeRange.value) / 100));
    });
  }
  const attempt = () => bgMusic.play().then(() => {
    if (musicBtn) musicBtn.textContent = '音乐暂停';
  }).catch(() => Promise.reject());
  attempt().catch(() => {
    const onFirstGesture = () => {
      attempt().finally(() => {
        document.removeEventListener('click', onFirstGesture);
        document.removeEventListener('keydown', onFirstGesture);
        document.removeEventListener('touchstart', onFirstGesture, { passive: true });
      });
    };
    document.addEventListener('click', onFirstGesture, { once: true });
    document.addEventListener('keydown', onFirstGesture, { once: true });
    document.addEventListener('touchstart', onFirstGesture, { once: true, passive: true });
  });
}

// -------------------- 小游戏覆盖层（iframe）支持 --------------------
// 在剧情中任何对话对象里使用 playGame: "key" 即可打开对应根目录下的小游戏页面
const gameOverlayId = 'game-overlay-iframe';

function createGameOverlay() {
  // 避免重复创建
  if (document.getElementById(gameOverlayId)) return;

  const overlay = document.createElement('div');
  overlay.id = gameOverlayId;
  overlay.style.position = 'fixed';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.85)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';

  const container = document.createElement('div');
  container.style.width = '90%';
  container.style.height = '90%';
  container.style.position = 'relative';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '返回游戏';
  closeBtn.style.position = 'absolute';
  closeBtn.style.right = '8px';
  closeBtn.style.top = '8px';
  closeBtn.style.zIndex = '10001';
  closeBtn.addEventListener('click', () => {
    closeGame();
  });

  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.id = gameOverlayId + '-frame';

  container.appendChild(closeBtn);
  container.appendChild(iframe);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
}

function openGame(key) {
  // key -> 映射到根目录下的两个小游戏文件
  const map = {
    jianshu: '../../jianshu(移动端测试/jianshu.html',
    binghongcha: '../../binghongcha/binghongcha3.html'
  };

  // 兼容没有配置的情况
  if (!key || !map[key]) {
    console.warn('未知的小游戏 key:', key);
    return;
  }

  // 锁定回退边界：一旦进入小游戏，禁止回到该行，防止重复触发
  try { minIndex = Math.max(minIndex, index + 1); } catch (e) {}

  createGameOverlay();
  const iframe = document.getElementById(gameOverlayId + '-frame');
  const overlay = document.getElementById(gameOverlayId);
  if (!iframe || !overlay) return;

  // 解析目标 URL —— 使用 new URL 可以正确解析相对路径（无论是 file:// 还是 http(s)）
  let resolvedUrl;
  try {
    resolvedUrl = new URL(map[key], window.location.href).href;
  } catch (e) {
    // 如果 map[key] 是完整 URL，会直接使用
    resolvedUrl = map[key];
  }
  console.log('打开小游戏 URL:', resolvedUrl);
  // 标记当前对话对应的小游戏已被播放，防止关闭后再次触发
  try { if (dialogues[index]) dialogues[index]._gamePlayed = true; } catch (e) {}

  // 如果当前页面是通过 file:// 打开，许多浏览器会阻止在 iframe 中加载本地文件。
  // 尝试用新窗口打开并监测窗口关闭以恢复剧情；推荐使用本地 HTTP 服务以获得最佳体验。
  if (window.location.protocol === 'file:') {
    const child = window.open(resolvedUrl, '_blank');
    if (!child) {
      alert('浏览器阻止了弹窗。请关闭弹窗阻止以在 iframe 中嵌入小游戏。');
      return;
    }

    // 暂停剧情
    isPaused = true;
    stopAutoPlay();

    // 轮询子窗口是否已关闭，关闭后恢复剧情（如果游戏没有通过 postMessage 返回结果，会在此处推进）
    const poll = setInterval(() => {
      try {
        if (child.closed) {
          clearInterval(poll);
          // 如果已经通过 postMessage 处理过结束（_gameEndHandled），则不重复推进
          if (dialogues[index] && dialogues[index]._gameEndHandled) {
            isPaused = false;
            return;
          }
          isPaused = false;
          if (index < dialogues.length - 1) showDialogue(index + 1);
        }
      } catch (e) {
        // 访问被拒绝时也尝试恢复
        clearInterval(poll);
        if (dialogues[index] && dialogues[index]._gameEndHandled) {
          isPaused = false;
          return;
        }
        isPaused = false;
        if (index < dialogues.length - 1) showDialogue(index + 1);
      }
    }, 500);

    return;
  }

  iframe.src = resolvedUrl;
  overlay.style.display = 'flex';
  // 暂停剧情的操作
  isPaused = true;
  stopAutoPlay();
}

function closeGame() {
  const overlay = document.getElementById(gameOverlayId);
  if (!overlay) return;
  overlay.style.display = 'none';
  const iframe = document.getElementById(gameOverlayId + '-frame');
  if (iframe) iframe.src = 'about:blank';
  // 恢复剧情
  isPaused = false;
  // 继续下一句对话（防止回到带有 playGame 的同一句而重复触发）
  if (index < dialogues.length - 1) showDialogue(index + 1);
}

// 监听来自 iframe 的 postMessage，小游戏在结束时应发送 { type: 'gameEnd' }
window.addEventListener('message', (ev) => {
  let data = ev.data;
  try {
    // 某些游戏可能会发送 JSON 字符串
    if (typeof data === 'string') data = JSON.parse(data);
  } catch (e) {
    // ignore
  }

  if (!data || typeof data !== 'object') return;

  if (data.type === 'gameEnd') {
    // 标记当前对话已通过消息处理结束，避免轮询重复推进
    if (dialogues[index]) dialogues[index]._gameEndHandled = true;

    // 如果小游戏返回了 courses 字段，按不同 item 分支处理（例如冰红茶需要阈值判断）
    if (typeof data.courses === 'number') {
      // 根据当前触发的小游戏类型解锁成就
      try {
        const cur = dialogues[index];
        if (cur && cur.playGame === 'jianshu') {
          // 抢课：返回 5 节课则解锁“气运之子”
          if (data.courses === 5 && window.achievementSystem && typeof window.achievementSystem.unlockAchievement === 'function') {
            window.achievementSystem.unlockAchievement('qiyun_zhizi');
          }
        } else if (cur && cur.playGame === 'binghongcha') {
          // 冰红茶：得分 > 2000 解锁“破防高手”
          if (data.courses > 2000 && window.achievementSystem && typeof window.achievementSystem.unlockAchievement === 'function') {
            window.achievementSystem.unlockAchievement('pofang_gaoshou');
          }
        }
      } catch (e) { /* noop */ }

      const itemLabel = typeof data.item === 'string' ? data.item : '节课';
      if (itemLabel === '瓶冰红茶') {
        // 冰红茶按分数阈值判断成功或失败（>1000 成功）
        const success = data.courses > 1000;
        const msg = success ? `成功抢到冰红茶` : `未抢到冰红茶`;
        showResultPopup(msg, () => {
          closeGame();
          if (typeof data.affectionDelta === 'number') updateAffection(data.affectionDelta);
        });
      } else {
        // 其他物品使用通用弹窗
        showCoursePopup(data.courses, itemLabel, () => {
          closeGame();
          if (typeof data.affectionDelta === 'number') updateAffection(data.affectionDelta);
        });
      }
    } else {
      // 直接关闭并继续
      closeGame();
      if (typeof data.affectionDelta === 'number') updateAffection(data.affectionDelta);
    }
  }
  else if (data.type === 'gameRestart') {
    // 清除当前对话的 game end 标志，以便接收新的返回值
    if (dialogues[index]) dialogues[index]._gameEndHandled = false;
    console.log('收到 gameRestart，已清除 _gameEndHandled');
  }
});

// 显示一个简洁的弹窗，告知玩家抢到了 n 节课，点击确认后回调
function showCoursePopup(n, itemLabel, cb) {
  const id = 'course-popup-notice';
  let box = document.getElementById(id);
  if (!box) {
    box = document.createElement('div');
    box.id = id;
    box.style.position = 'fixed';
    box.style.left = '50%';
    box.style.top = '40%';
    box.style.transform = 'translate(-50%, -50%)';
    box.style.background = 'rgba(0,0,0,0.9)';
    box.style.color = '#fff';
    box.style.padding = '20px';
    box.style.borderRadius = '8px';
    box.style.zIndex = '10002';
    box.style.textAlign = 'center';
    const bodyDiv = document.createElement('div');
    bodyDiv.style.fontSize = '18px';
    bodyDiv.style.marginBottom = '12px';
    bodyDiv.className = 'course-popup-body';
    box.appendChild(bodyDiv);
    const btn = document.createElement('button');
    btn.className = 'course-popup-btn';
    btn.textContent = '确定';
    btn.style.padding = '6px 12px';
    box.appendChild(btn);
    document.body.appendChild(box);
  }

  // 更新内容并重新绑定按钮回调（覆盖旧的回调）
  const bodyDiv = box.querySelector('.course-popup-body');
  const btn = box.querySelector('.course-popup-btn');
  if (bodyDiv) bodyDiv.textContent = `你抢到了 ${n} ${itemLabel}！`;

  // 清除旧的事件监听（简单替换方式）
  const newBtn = btn.cloneNode(true);
  newBtn.addEventListener('click', () => {
    if (box && box.parentNode) box.parentNode.removeChild(box);
    if (cb) cb();
  });
  btn.parentNode.replaceChild(newBtn, btn);
}

// 显示成功/失败的简单结果弹窗（用于冰红茶按阈值判断）
function showResultPopup(message, cb) {
  const id = 'course-popup-notice';
  let box = document.getElementById(id);
  if (!box) {
    box = document.createElement('div');
    box.id = id;
    box.style.position = 'fixed';
    box.style.left = '50%';
    box.style.top = '40%';
    box.style.transform = 'translate(-50%, -50%)';
    box.style.background = 'rgba(0,0,0,0.9)';
    box.style.color = '#fff';
    box.style.padding = '20px';
    box.style.borderRadius = '8px';
    box.style.zIndex = '10002';
    box.style.textAlign = 'center';
    const bodyDiv = document.createElement('div');
    bodyDiv.style.fontSize = '18px';
    bodyDiv.style.marginBottom = '12px';
    bodyDiv.className = 'course-popup-body';
    box.appendChild(bodyDiv);
    const btn = document.createElement('button');
    btn.className = 'course-popup-btn';
    btn.textContent = '确定';
    btn.style.padding = '6px 12px';
    box.appendChild(btn);
    document.body.appendChild(box);
  }

  const bodyDiv = box.querySelector('.course-popup-body');
  const btn = box.querySelector('.course-popup-btn');
  if (bodyDiv) bodyDiv.textContent = message;

  const newBtn = btn.cloneNode(true);
  newBtn.addEventListener('click', () => {
    if (box && box.parentNode) box.parentNode.removeChild(box);
    if (cb) cb();
  });
  btn.parentNode.replaceChild(newBtn, btn);
}

// 扫描对话数组，在显示对话时检查 playGame 字段并触发 openGame
const originalShowDialogue = showDialogue;
function showDialogueWrapper(i) {
  const d = dialogues[i];
  // 如果本句需要触发小游戏且尚未播放，立即暂停剧情，阻止任何推进行为
  if (d && d.playGame && !d._gamePlayed) {
    isPaused = true;
    stopAutoPlay();
    // 先显示当前对话，再在短延迟后打开小游戏
    originalShowDialogue(i);
    setTimeout(() => openGame(d.playGame), 600);
    return;
  }

  originalShowDialogue(i);
}


// 覆盖原函数
showDialogue = showDialogueWrapper;
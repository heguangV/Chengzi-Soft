document.addEventListener('DOMContentLoaded', function() {
  document.body.classList.add("fade-in");

  // -------------------- DOM 元素 --------------------
  const dialogText = document.getElementById("dialog-text");
  const nameBox = document.querySelector(".character-name");
  const characterAvatar = document.querySelector("#character-avatar");
  const avatarContainer = document.querySelector(".character-avatar");

  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");
  const speedBtn = document.getElementById("speed-btn");
  const autoBtn = document.getElementById("auto-btn");
  const skipBtn = document.getElementById("skip-btn");

  const choiceContainer = document.getElementById("choice-container");
  const choiceBtns = document.querySelectorAll(".choice-btn");
  const dialogBox = document.querySelector(".dialog-box");

  const miniGameContainer = document.getElementById("mini-game-container");
  const gameActionBtn = document.getElementById("game-action-btn");
  const gameResult = document.getElementById("game-result");

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
  let isMiniGameActive = false;

  let isPaused = false;
  // -------------------- 剧情对话 --------------------
  const dialogues = [
    { name: "旁白", text: "转眼到了选课的日子，你也投入到了紧张刺激的抢课环节。" },
    { name: "旁白", text: "上课的日子有些枯燥，时间过的却很快，运动会悄然接近了。" },
    { name: "旁白", text: "偶然间你得知了学姐也会参加这次运动会的800米项目，让本对运动不敢兴趣的你也决定前去观看。" },
    { name: "旁白", text: "到了学姐比赛那天，你买好能量饮料，备好一些糖果，前往操场。" },
    { name: "旁白", text: "女子800米准备处，你看见了学姐热身的身影。" },
    { name: "旁白", text: "比赛开始了，学姐起步很快，跑在队伍前列，你大声呐喊：" },
    { name: "你", text: "学姐加油！" },
    { name: "旁白", text: "学姐也似乎感受到你的鼓励，迈着矫健的步伐，一直保持在队伍前列。" },
    { name: "旁白", text: "形势一片大好，眼见最后一圈即将跑完，学姐突然停下了脚步，一瘸一拐的走向终点。" },
    { name: "旁白", text: "本该前三的他也因此无缘奖牌。学姐走过终点，你连忙跑向了他，扶着学姐，关心道：" },
    { name: "你", text: "学姐你怎么了？扭到脚了吗？" },
    { name: "学姐", text: "最后冲刺的时候没控制好步伐，扭到脚了。" },
    { name: "旁白", text: "你说：", hasChoice: true }
  ];

  // -------------------- 好感度系统 --------------------
  let affectionData = { fang: 50 };

  function updateAffection(value) {
    affectionData.fang = Math.max(0, Math.min(100, affectionData.fang + value));
    const bar = document.querySelector('.affection-fill[data-character="fang"]');
    const text = document.querySelector('.affection-text');
    bar.style.width = `${affectionData.fang}%`;
    text.textContent = `芳乃: ${affectionData.fang}%`;
    localStorage.setItem('affectionData', JSON.stringify(affectionData));
    
    // 显示好感度变化
    if (value > 0) {
      showNotice(`芳乃好感度 +${value}`);
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

  // -------------------- 显示某条对话 --------------------
  function showDialogue(idx) {
  if (idx < 0) idx = 0;
  if (idx >= dialogues.length) idx = dialogues.length - 1;
  index = idx;

  let currentName = dialogues[index].name;
  nameBox.textContent = currentName;

  // 根据角色显示不同头像
  if (currentName === "旁白") {
    avatarContainer.style.display = 'none';
  } else if (currentName === "学姐") {
    characterAvatar.src = "../../学姐.png";
    characterAvatar.style.display = 'block';
    avatarContainer.style.display = 'flex';
    console.log('Loading 学姐.png');
  } else if (currentName === "你") {
    characterAvatar.src = "../../男主.png";
    characterAvatar.style.display = 'block';
    avatarContainer.style.display = 'flex';
    console.log('Loading 男主.png');
  } else {
    avatarContainer.style.display = 'none';
  }


  // 检查是否需要触发手机震动
  if (dialogues[index].triggerPhone) {
    // 设置全局暂停状态
    isPaused = true;
    stopAutoPlay();
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
    // 调用phone.js中的函数使手机震动
    if (window.makePhoneVibrate) {
      window.makePhoneVibrate();
      // 添加回调函数，当手机震动结束后恢复剧情
      window.onPhoneVibrationComplete = function() {
        isPaused = false;
        if (index < dialogues.length - 1) {
          showDialogue(index + 1);
        }
      };
    }
    // 监听 window.phoneOpen 状态变化，关闭手机界面时恢复剧情
    if (!window._phoneOpenListenerAdded) {
      window._phoneOpenListenerAdded = true;
      let lastPhoneOpen = window.phoneOpen;
      setInterval(function() {
        if (lastPhoneOpen && !window.phoneOpen && isPaused) {
          // 手机界面刚刚关闭且剧情暂停，恢复剧情
          isPaused = false;
          if (index < dialogues.length - 1) {
            showDialogue(index + 1);
          }
        }
        lastPhoneOpen = window.phoneOpen;
      }, 300);
    }
    return; // 暂停剧情，等待手机震动结束或手机界面关闭后继续
  }

  typeText(dialogues[index].text, () => {
    if (dialogues[index].hasChoice) {
      forceShowChoices();
    }
    // 以下代码已被注释，禁用小游戏功能，确保剧情正常推进
    /*
    else if (dialogues[index].hasMiniGame) {
      showMiniGame();
    }
    */
  });
  }

  // -------------------- 强制显示选择框 --------------------
  function forceShowChoices() {
    isChoiceActive = true;
    choiceContainer.classList.remove("hidden");
    dialogBox.style.display = "none";
    
    clearInterval(typingInterval);
    clearInterval(autoInterval);
    stopAutoPlay();
  }

  // -------------------- 隐藏选择框 --------------------
  function hideChoices() {
    isChoiceActive = false;
    choiceContainer.classList.add("hidden");
    dialogBox.style.display = "block";
  }

  // -------------------- 显示小游戏 --------------------
  function showMiniGame() {
    console.log('显示小游戏界面');
    isMiniGameActive = true;
    miniGameContainer.classList.remove("hidden");
    dialogBox.style.display = "none";
    
    clearInterval(typingInterval);
    clearInterval(autoInterval);
    stopAutoPlay();
  }

  // -------------------- 隐藏小游戏 --------------------
  function hideMiniGame() {
    console.log('隐藏小游戏界面');
    isMiniGameActive = false;
    miniGameContainer.classList.add("hidden");
    dialogBox.style.display = "block";
  }

  // -------------------- 处理选择 --------------------
  function handleChoice(choice) {
    hideChoices();
    
    // 根据选择更新剧情
    if (choice === "A") {
      // 选择一
      dialogues.push(
        { name: "学姐", text: "啊不用那么麻烦，扶我过去就好了。" },
        { name: "旁白", text: "学姐感觉背还是太过亲密了，略感害羞。于是你扶着学姐到了校医务室。" },
        { name: "旁白", text: "医生看了看，略微包扎一下，叮嘱学姐这两天少走一点。" },
        { name: "你", text: "学姐，这些是给你准备的，你先休息一下，我去推个轮椅过来。" },
        { name: "旁白", text: "而后你推着轮椅把学姐送回了她的宿舍楼下。" }
      );
      updateAffection(15);
    } else if (choice === "B") {
      // 选择二
      dialogues.push(
        { name: "学姐", text: "嗯，好。" },
        { name: "旁白", text: "学姐点点头。你安顿好学姐，拿出先前准备的饮料和糖果。" },
        { name: "你", text: "学姐，这些是给你准备的，你先休息一下，我去推个轮椅过来。" },
        { name: "旁白", text: "你找到了轮椅，把学姐推去校医务室，但操场到校医务室的路上坡下坡很多，你推的略感吃力。" },
        { name: "旁白", text: "突然感到一阵轻松，原来是学姐用手转着轮椅的双轮。" },
        { name: "学姐", text: "这样你应该会轻松点。" },
        { name: "旁白", text: "学姐笑着回头看你。到了校医务室，医生看了看，略微包扎一下，叮嘱学姐这两天少走一点。" },
        { name: "旁白", text: "而后你推着轮椅把学姐送回了她的宿舍楼下。" }
      );
      updateAffection(20);
    } else if (choice === "C") {
      // 选择三
      dialogues.push(
        { name: "旁白", text: "学姐点点头，脸颊有些泛红。本来打算扶着学姐过去，奈何没走两步学姐的鞋就掉了出来。" },
        { name: "旁白", text: "学姐尴尬地把鞋重新穿上。" },
        { name: "你", text: "学姐，要不我背你过去吧……" },
        { name: "旁白", text: "见学姐没有拒绝，你便蹲下了身子，学姐也趴到了你的背上。" },
        { name: "旁白", text: "你背着学姐到了校医务室，医生看了看，略微包扎一下，叮嘱学姐这两天少走一点。" },
        { name: "你", text: "学姐，这些是给你准备的，你先休息一下，我去推个轮椅过来。" },
        { name: "旁白", text: "而后你推着轮椅把学姐送回了她的宿舍楼下。" }
      );
      updateAffection(30);
    }        // 继续剧情，已移除小游戏部分，确保剧情正常推进
    dialogues.push(
      { name: "旁白", text: "转眼到了期末周，期间你和学姐聊了不少。" },
      { name: "旁白", text: "学姐还和你介绍了BIT的热带风味冰红茶传说，据说只要在期末周抢到足够多的热带风味冰红茶，你的期末成绩就一定不会挂科。" },
      { name: "旁白", text: "你有些好奇，但觉得复习更重要，决定先专注于考试准备。" },
      { name: "旁白", text: "但是该复习的还是不能少，奈何自己独自复习思路总是很乱，你决定向学姐寻求帮助。" },
      { name: "你", text: "学姐，感觉一个人复习好迷茫，也没有方法，你能不能辅导我一下呀？" },
      { name: "学姐", text: "好呀。" },
      { name: "旁白", text: "学姐答应了。二人商定好时间，找了间空教室。" },
      { name: "旁白", text: "学姐带来了她之前的学习资料，并且帮你答疑了部分难题。" },
      { name: "旁白", text: "在学姐的帮助下，你感觉自己的学习能力进一步提升了。" },
      { name: "旁白", text: "在学姐的帮助下和自己的努力下，你顺利通过了期末考试。" },
      { name: "旁白", text: "寒假到了……" },
      { name: "旁白", "text": "手机振动",triggerPhone: true  },
{ name: "你", text: "没想到 因为买不到车票留在学校 还能遇上这种事..." },
{ name: "旁白", text: "操场上" },
{ name: "学姐", text: "..." },
{ name: "学姐", text: "其实 按照原定计划 这个学期结束后 我就要离开这里了 去国外继续学习工作" },
{ name: "你", text: "诶...?" },
{ name: "你", text: "怎么这么突然？" },
{ name: "学姐", text: "其实 因为我的工作比较多 在学校的几年一直没能交到什么朋友..." },
{ name: "学姐", text: "由于家庭的影响 我从小就被要求做到最好 这种病态的意识让我忽略了日常的人际关系" },
{ name: "学姐", text: "在这次运动会失利了之后 我也便决心离开这里了 反正这几年来也没有什么想留恋的" },
{ name: "你", text: "..." },
{ name: "学姐", text: "但是真到了要走的时候 到有点放不下你 虽然只相处了半个学期 但是和你待在一起的感觉总是很难忘呢" },
{ name: "学姐", text: "...我后天就要走了 有空的话记得来送送我哦" },
{ name: "你", text: "...我会来的...相信你在那边能取得成功啊" },
{ name: "你", text: "看着学姐面带微笑的样子 想挽留的话仍然是没有说出口 到最后只能转变下一句祝愿" },
{ name: "你", text: "我真的有资格 留下她吗？" }
    );
    
    // 显示下一句对话
    showDialogue(index + 1);
  }

  // -------------------- 处理小游戏 --------------------
  function handleMiniGame() {
    console.log('处理小游戏逻辑');
    
    // 无论成功与否，先重置按钮文本
    gameActionBtn.textContent = "抢课！";
    
    // 模拟小游戏结果
    // 为了测试，我们让成功概率提高到80%
    const success = Math.random() > 0.2;
    
    if (success) {
      gameResult.textContent = "恭喜！你成功抢到了热带风味冰红茶！";
      gameResult.style.color = "green";
      
      // 延迟后继续剧情
      setTimeout(() => {
        hideMiniGame();
        
        // 创建新的对话内容
        const newDialogues = [
          { name: "旁白", text: "但是该复习的还是不能少，奈何自己独自复习思路总是很乱，你决定向学姐寻求帮助。" },
          { name: "你", text: "学姐，感觉一个人复习好迷茫，也没有方法，你能不能辅导我一下呀？" },
          { name: "学姐", text: "好呀。" },
          { name: "旁白", text: "学姐答应了。二人商定好时间，找了间空教室。" },
          { name: "旁白", text: "学姐带来了她之前的学习资料，并且帮你答疑了部分难题。" },
          { name: "旁白", text: "在学姐的帮助下，你感觉自己的学习能力进一步提升了。" },
          { name: "旁白", text: "在学姐的帮助下和自己的努力下，以及可能有热带风味冰红茶的buff下，你顺利通过了期末考试。" },
          { name: "旁白", text: "寒假到了……" }
        ];
        
        console.log('添加新对话到数组');
        // 添加新对话到dialogues数组
        dialogues.push(...newDialogues);
        
        updateAffection(10);
        
        // 确保index变量在调用showDialogue前已更新
        const nextIndex = index + 1;
        
        console.log(`继续剧情，下一个索引: ${nextIndex}`);
        // 确保正确调用showDialogue函数继续剧情
        setTimeout(() => {
          // 增加一层防护，确保showDialogue函数被调用
          try {
            // 强制将isMiniGameActive设置为false，确保showDialogue可以正常工作
            isMiniGameActive = false;
            // 直接使用index+1而不是nextIndex变量，避免任何可能的变量引用问题
            console.log(`调用showDialogue(${index + 1})`);
            showDialogue(index + 1);
          } catch (error) {
            console.error('调用showDialogue时发生错误:', error);
            // 即使发生错误，也尝试通过另一种方式继续剧情
            if (typeof showDialogue === 'function') {
              showDialogue(index + 1);
            }
          }
        }, 100);
      }, 2000);
    } else {
      gameResult.textContent = "很遗憾，没有抢到热带风味冰红茶，再试一次吧！";
      gameResult.style.color = "red";
      
      // 可以重新尝试
      gameActionBtn.textContent = "再试一次";
    }
  }

  // -------------------- 停止自动播放 --------------------
  function stopAutoPlay() {
    autoPlay = false;
    clearInterval(autoInterval);
    autoBtn.textContent = "自动播放";
  }

  // -------------------- 开始自动播放 --------------------
  function startAutoPlay() {
    clearInterval(autoInterval);
    autoInterval = setInterval(() => {
      if (isChoiceActive || isMiniGameActive) {
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

  const toggleBtn = document.getElementById("sidebar-toggle");

  
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("show");
    });
  }
  
  // -------------------- 音乐控制 --------------------
  function toggleMusic() {
    if (bgMusic.paused) {
      bgMusic.play();
      musicBtn.textContent = "音乐暂停";
    } else {
      bgMusic.pause();
      musicBtn.textContent = "音乐播放";
    }
  }

  // -------------------- 存档系统 --------------------
  function saveGame() {
    const saveData = {
      index: index,
      affectionData: affectionData,
      dialogues: dialogues,
      charIndex: charIndex
    };
    localStorage.setItem('saveData', JSON.stringify(saveData));
    showNotice('存档成功！');
  }

  function loadGame() {
    const savedData = localStorage.getItem('saveData');
    if (savedData) {
      const data = JSON.parse(savedData);
      index = data.index;
      affectionData = data.affectionData;
      // 这里不覆盖整个dialogues数组，只更新好感度
      updateAffection(0);
      showDialogue(index);
      showNotice('读档成功！');
    } else {
      showNotice('没有找到存档！');
    }
  }

  // -------------------- 事件监听器 --------------------

  nextBtn.addEventListener("click", () => {
    if (window.phoneOpen) return; // 手机界面打开时禁止推进剧情
    if (isPaused || isChoiceActive || isMiniGameActive) return;
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

  prevBtn.addEventListener("click", () => {
    if (isPaused) return;
    showDialogue(index - 1);
    stopAutoPlay();
  });

  speedBtn.addEventListener("click", () => {
    if (isPaused) return;
    isFast = !isFast;
    typingSpeed = isFast ? 10 : 50;
    speedBtn.textContent = isFast ? "原速" : "加速";
    showDialogue(index);
  });

  autoBtn.addEventListener("click", () => {
    if (isPaused) return;
    if (isChoiceActive || isMiniGameActive) return;
    
    autoPlay = !autoPlay;
    if (autoPlay) {
      autoBtn.textContent = "停止自动";
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
  });

  skipBtn.addEventListener("click", () => {
    if (isChoiceActive || isMiniGameActive) return;
    
    clearInterval(typingInterval);
    dialogText.textContent = dialogues[index].text;
    charIndex = dialogues[index].text.length;
  });

  choiceBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (!isChoiceActive) return;
      
      const choice = btn.dataset.choice;
      handleChoice(choice);
    });
  });

  gameActionBtn.addEventListener('click', () => {
    // 移除不必要的条件检查，确保总是可以调用handleMiniGame
    handleMiniGame();
  });

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }
  
  mainMenuBtn.addEventListener('click', () => {
    window.location.href = '../../index.html';
  });
  saveBtn.addEventListener('click', saveGame);
  loadBtn.addEventListener('click', loadGame);
  musicBtn.addEventListener('click', toggleMusic);
  volumeRange.addEventListener('input', () => {
    bgMusic.volume = volumeRange.value / 100;
  });

  // 添加键盘空格键事件监听器
  document.addEventListener('keydown', (e) => {
    if (window.phoneOpen) return; // 手机界面打开时禁止推进剧情
    if (isPaused) return;
    // 统一空格键推进逻辑
    if (e.code === 'Space') {
      e.preventDefault(); // 阻止页面滚动
      if (isChoiceActive || isMiniGameActive) return;
      // 模拟点击下一句按钮，保持与其它文件一致
      nextBtn.click();
    }
  });

  // 添加鼠标左键点击事件监听器
  document.addEventListener('click', (e) => {
    if (window.phoneOpen) return; // 手机界面打开时禁止推进剧情
    if (isPaused) return;
    // 确保点击的不是其他交互元素
    if (e.target.tagName !== 'BUTTON' && 
        e.target.tagName !== 'INPUT' && 
        e.target.tagName !== 'IMG' &&
        e.target.id !== 'sidebar-toggle' &&
        !e.target.closest('button') &&
        !e.target.closest('input') &&
        !e.target.closest('img') &&
        !e.target.closest('#sidebar-toggle')) {
      if (isChoiceActive || isMiniGameActive) return;
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
    }
  });
  
  // 点击侧边栏外部区域关闭侧边栏
  document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('open')) {
      // 如果点击的不是侧边栏内部元素，也不是触发按钮，则关闭侧边栏
      if (!sidebar.contains(e.target) && e.target !== sidebarToggle) {
        sidebar.classList.remove('open');
      }
    }
  });
  
  if (window.phoneModule && window.phoneModule.initPhoneElements) {
    window.phoneModule.initPhoneElements();
    window.phoneModule.initPhoneChat();
  }
  
  // 初始化
  initAffection();
  showDialogue(0);
  // 注释掉测试模式，恢复正常剧情流程
  /*
  // 创建一个测试函数，用于快速测试小游戏逻辑
  function testMiniGame() {
    // 直接添加包含热带风味冰红茶的对话到dialogues数组末尾
    const newDialogues = [
      { name: "旁白", text: "转眼到了期末周，期间你和学姐聊了不少。" },
      { name: "旁白", text: "学姐还和你介绍了BIT的热带风味冰红茶传说，据说只要在期末周抢到足够多的热带风味冰红茶，你的期末成绩就一定不会挂科。" },
      { name: "旁白", text: "你有些好奇，于是想去试试抢热带风味冰红茶。", hasMiniGame: true }
    ];
    
    // 添加测试对话
    dialogues.push(...newDialogues);
    
    // 跳转到新添加的第一个对话
    const testIndex = dialogues.length - newDialogues.length;
    console.log(`测试模式：跳转到索引 ${testIndex}`);
    showDialogue(testIndex);
  }
  /*
  // 直接进入测试模式，跳过前面的对话
  testMiniGame();
  */
});
    window.addEventListener("DOMContentLoaded", () => {
      document.body.classList.add("fade-in");
      
      // 初始化好感度系统
      initAffection();
      
      // 显示初始对话
      showDialogue(0);
      
      // 添加空格键和鼠标点击实现下一句的功能（防止长按重复触发）
      document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
          e.preventDefault();
          // 如果已经按下，不重复触发
          if (spaceDown) return;
          spaceDown = true;
          triggerNextDialogue();
        }
      });

      // 在松开空格时重置标志，允许下一次触发
      document.addEventListener("keyup", (e) => {
        if (e.code === "Space") {
          spaceDown = false;
        }
      });
      
      // 修改点击事件处理，排除手机图像和聊天界面
      document.addEventListener("click", (e) => {
        // 检查点击的是否是手机图像
        const isPhoneImage = e.target.closest("#phone-image");
        // 检查点击的是否在聊天界面内
        const isInChatInterface = e.target.closest("#phone-chat-interface");
        
        // 如果聊天界面是打开的，阻止点击推进剧情
        if (phoneChatInterface.classList.contains("show")) {
          return;
        }
        
        // 如果是等待手机响应的状态，只有点击手机才能继续
        if (waitingForPhoneResponse) {
          if (isPhoneImage) {
            handlePhoneResponse();
          }
          return;
        }
        
        if (!isPhoneImage && 
            !isInChatInterface &&
            !e.target.closest("button") && 
            !e.target.closest(".control-img") && 
            !e.target.closest("#sidebar") && 
            !e.target.closest("#sidebar-toggle") &&
            !e.target.closest("#special-item")) {
          triggerNextDialogue();
        }
      });

      // 初始化手机聊天界面
      initPhoneChat();
    });

    // DOM元素
  const musicBtn = document.getElementById("music-btn");
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
    const phoneChatInterface = document.getElementById("phone-chat-interface");
    const chatCloseBtn = document.getElementById("chat-close-btn");
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.querySelector(".chat-input");
    const chatSendBtn = document.querySelector(".chat-send-btn");

    // 状态变量
    let index = 0;
    let charIndex = 0;
    let typingSpeed = 50;
    let typingInterval = null;
    let autoPlay = false;
    let autoInterval = null;
    let isFast = false;
  let spaceDown = false; // 防止空格长按连续触发
    let waitingForItem = false;
    let isSpecialItemClicked = false;
    let hasReceivedFinalMessage = false;
    let waitingForPhoneResponse = false; // 新增：等待手机响应的状态
    let phoneNotification = null; // 新增：手机通知标记
    let gamePaused = false; // 新增：游戏暂停状态

    // 好感度数据
    

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

    // 合并所有剧情对话 - 按照文件夹名称顺序排列
    const dialogues = [
      { name: "旁白", text: "一学期的大学生活，如同被风吹散的云烟，在不知不觉中走到了学姐约定的时刻" },
      { name: "旁白", text: "你的手机屏幕映出一片淡淡的白光，反射在天花板上，与傍晚的晚霞交织在一起。" },
      { name: "旁白", text: "你就这样看着天花板发呆，思绪纷飞。" },

      // 这里移除了"忽然，手机轻轻振动了一下"的对话
      { name: "C", text: "你拿起手机，屏幕上是一条简短的消息：" },//信息改为 抱歉 我还是不太了解你 下学期我就要转学了 照顾好自己哦

      // 好感度不足2的剧情

      { name: "B", text: "果然 光靠好感度的能力 还是得不到学姐的心吗" },

      { name: "B", text: "你在手机上打出：" },
      { name: "B", text: "最终你按下了发送键" },
      // 好感度不足5的剧情
      { name: "B", text: "唉……" },
      { name: "B", text: "稍微有些难过。" },
      { name: "B", text: "好像尘埃落定了。虽然有些遗憾，但……也未必不好。" },
      { name: "B", text: "也许……一辈子都不会忘记她吧。" },
      { name: "C", text: "思绪渐渐飘远，世界的色彩慢慢褪去，屏幕的光映照下，一切都化作苍白。" },
      { name: "BE", text: "此情可待成追忆，只是当时已惘然。" },
    ];

    // 聊天消息数据 - 初始只有前面的聊天记录
    let chatData = [

      { sender: "sent", text: "嗯...", time: "10:45" }
    ];

    // 初始化手机聊天界面
    function initPhoneChat() {
      // 点击手机图像显示聊天界面
      if (phoneImage) {
        phoneImage.addEventListener("click", (e) => {
          e.stopPropagation(); // 阻止事件冒泡
          
          // 如果是等待手机响应的状态，处理手机响应
          if (waitingForPhoneResponse) {
            handlePhoneResponse();
            return;
          }
          
          openChatInterface();
        });
      }

      // 关闭聊天界面
      if (chatCloseBtn) {
        chatCloseBtn.addEventListener("click", () => {
          closeChatInterface();
        });
      }

      // 发送消息功能
      if (chatSendBtn) {
        chatSendBtn.addEventListener("click", sendMessage);
      }

      if (chatInput) {
        chatInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        });
      }

      // 加载聊天记录
      loadChatMessages();
    }

    // 打开聊天界面
    function openChatInterface() {
      phoneChatInterface.classList.add("show");
      // 暂停游戏
      stopAutoPlay();
      clearInterval(typingInterval);
      
      // 确保聊天界面滚动到底部
      setTimeout(() => {
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }, 100);
    }

    // 关闭聊天界面
    function closeChatInterface() {
      phoneChatInterface.classList.remove("show");
    }

    // 让手机震动并显示通知
    function makePhoneVibrate() {
      if (!phoneImage) return;
      
      // 添加震动动画
      phoneImage.classList.add("phone-vibrating");
      
      // 添加通知标记
      phoneNotification = document.createElement("div");
      phoneNotification.classList.add("phone-notification");
      phoneImage.appendChild(phoneNotification);
      
      // 设置等待手机响应的状态
      waitingForPhoneResponse = true;
      
      // 暂停自动播放
      stopAutoPlay();
    }

    // 处理手机响应
    function handlePhoneResponse() {
      // 移除震动效果和通知
      if (phoneImage) {
        phoneImage.classList.remove("phone-vibrating");
        if (phoneNotification && phoneImage.contains(phoneNotification)) {
          phoneImage.removeChild(phoneNotification);
        }
      }
      
      // 添加最后的消息到聊天记录
      addFinalMessageToChat();
      
      // 自动打开聊天界面
      openChatInterface();
      
      // 继续对话
      waitingForPhoneResponse = false;
      
      // 2秒后自动关闭聊天界面并继续剧情
      setTimeout(() => {
        closeChatInterface();
        showDialogue(index + 1);
      }, 2000);
    }

    // 加载聊天消息
    function loadChatMessages() {
      if (!chatMessages) return;
      
      chatMessages.innerHTML = "";
      
      chatData.forEach(msg => {
        const messageEl = document.createElement("div");
        messageEl.classList.add("message", msg.sender);
        
        const contentEl = document.createElement("div");
        contentEl.classList.add("message-content");
        contentEl.textContent = msg.text;
        
        const timeEl = document.createElement("div");
        timeEl.classList.add("message-time");
        timeEl.textContent = msg.time;
        
        messageEl.appendChild(contentEl);
        messageEl.appendChild(timeEl);
        chatMessages.appendChild(messageEl);
      });
      
      // 滚动到底部
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 添加最后的消息到聊天记录
    function addFinalMessageToChat() {
      if (hasReceivedFinalMessage) return;
      
      hasReceivedFinalMessage = true;
      
      // 添加最后的消息
      chatData.push({
        sender: "received", 
        text: "再见啦，学弟君~ 我已经在去机场的车上咯~ 以后有时间可以来看我的演出哦，我会为你留特等席的 (＾▽＾)", 
        time: "12:30"
      });
      
      // 重新加载聊天记录
      loadChatMessages();
    }

    // 发送消息
    function sendMessage() {
      if (!chatInput || !chatMessages || chatInput.value.trim() === "") return;
      
      const now = new Date();
      const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const messageEl = document.createElement("div");
      messageEl.classList.add("message", "sent");
      
      const contentEl = document.createElement("div");
      contentEl.classList.add("message-content");
      contentEl.textContent = chatInput.value;
      
      const timeEl = document.createElement("div");
      timeEl.classList.add("message-time");
      timeEl.textContent = time;
      
      messageEl.appendChild(contentEl);
      messageEl.appendChild(timeEl);
      chatMessages.appendChild(messageEl);
      
      // 清空输入框
      chatInput.value = "";
      
      // 滚动到底部
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // 所有消息都使用随机回复
      setTimeout(() => {
        simulateReply();
      }, 1000);
    }

    // 模拟回复
    function simulateReply() {
      if (!chatMessages) return;
      
      const now = new Date();
      const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const replies = [
        "抱歉，我现在有点忙，晚点回复你",
        "好的，我知道了",
        "谢谢你的关心",
        "我会想你的",
        "保持联系哦",

      ];
      
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const messageEl = document.createElement("div");
      messageEl.classList.add("message", "received");
      
      const contentEl = document.createElement("div");
      contentEl.classList.add("message-content");
      contentEl.textContent = randomReply;
      
      const timeEl = document.createElement("div");
      timeEl.classList.add("message-time");
      timeEl.textContent = time;
      
      messageEl.appendChild(contentEl);
      messageEl.appendChild(timeEl);
      chatMessages.appendChild(messageEl);
      
      // 滚动到底部
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 触发下一句的统一函数
    function triggerNextDialogue() {
      if (waitingForItem || gamePaused) return;
      
      if (charIndex < dialogues[index].text.length) {
        clearInterval(typingInterval);
        dialogText.textContent = dialogues[index].text;
        charIndex = dialogues[index].text.length;
        
        if (shouldShowSpecialItem()) {
          specialItem.classList.remove("hidden");
          waitingForItem = true;
        }
      } else {
        // 检查是否需要让手机震动（第26条对话之后）
        if (index === 25) {
          makePhoneVibrate();
          return; // 停止继续推进对话，等待玩家点击手机
        }
        
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

      nameBox.textContent = displayName;
      
      // 检查是否是"最终你按下了发送键"这句台词(索引36)
      if (index === 36) {
        // 显示完文字后自动触发特殊事件
        typeText(dialogues[index].text, function() {
          setTimeout(autoSendFarewellMessage, 500);
        });
      } else {
        typeText(dialogues[index].text);
      }
      
      if (index % 10 === 0) {
        autoSave();
      }
    }

    // 自动发送"再见了"消息并关闭手机
    function autoSendFarewellMessage() {
      console.log('autoSendFarewellMessage triggered');
      
      // 保存当前索引值
      const currentIndex = index;
      
      // 强制暂停游戏：暂停自动播放、清除打字效果、设置暂停标志
      stopAutoPlay();
      clearInterval(typingInterval);
      gamePaused = true; // 添加一个暂停标志
      
      // 如果手机界面已经打开，先关闭它
      if (phoneChatInterface && phoneChatInterface.classList.contains('show')) {
        phoneChatInterface.classList.remove('show');
        
        // 等待界面关闭后再重新打开
        setTimeout(() => {
          console.log('Re-opening chat interface...');
          phoneChatInterface.classList.add('show');
          
          // 确保聊天界面滚动到底部
          setTimeout(() => {
            if (chatMessages) {
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }
          }, 100);
        }, 500);
      } else {
        // 强制打开手机聊天界面
        if (phoneChatInterface) {
          console.log('Force opening chat interface...');
          phoneChatInterface.classList.add('show');
          
          // 确保聊天界面滚动到底部
          setTimeout(() => {
            if (chatMessages) {
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }
          }, 100);
        } else {
          console.error('phoneChatInterface element not found');
          // 如果找不到元素，重置暂停标志并直接继续剧情
          gamePaused = false;
          setTimeout(() => showDialogue(currentIndex + 1), 500);
          return;
        }
      }
      
      // 等待界面完全显示后再操作
      setTimeout(function() {
        // 在输入框中预填"再见了"
        if (chatInput) {
          console.log('Filling message: 再见了');
          chatInput.value = "再见了";
          
          // 自动聚焦输入框
          chatInput.focus();
          
          // 等待一小段时间后手动创建并添加消息，不使用sendMessage以避免触发simulateReply
          setTimeout(function() {
            if (chatMessages && chatInput.value.trim() !== "") {
              console.log('Manually adding message to chat...');
              const now = new Date();
              const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
              
              const messageEl = document.createElement("div");
              messageEl.classList.add("message", "sent");
              
              const contentEl = document.createElement("div");
              contentEl.classList.add("message-content");
              contentEl.textContent = chatInput.value;
              
              const timeEl = document.createElement("div");
              timeEl.classList.add("message-time");
              timeEl.textContent = time;
              
              messageEl.appendChild(contentEl);
              messageEl.appendChild(timeEl);
              chatMessages.appendChild(messageEl);
              
              // 清空输入框
              chatInput.value = "";
              
              // 滚动到底部
              chatMessages.scrollTop = chatMessages.scrollHeight;
              
              // 添加学姐的随机回复消息
              setTimeout(() => {
                console.log('Adding random reply message...');
                
                // 使用simulateReply函数进行随机回复
                simulateReply();
                
                // 发送后等待2秒再关闭手机界面并继续剧情
                setTimeout(function() {
                  if (phoneChatInterface) {
                    console.log('Closing chat interface...');
                    phoneChatInterface.classList.remove('show');
                  }
                  
                  // 重置暂停标志
                  gamePaused = false;
                  
                  if (typeof showDialogue === 'function') {
                    console.log('Continuing story with next dialogue...');
                    showDialogue(currentIndex + 1);
                  }
                }, 2000);
              }, 1500);
            } else {
              console.error('Cannot add message: chatMessages not found or message is empty');
              // 如果无法添加消息，直接关闭界面并继续剧情
              setTimeout(() => {
                if (phoneChatInterface) phoneChatInterface.classList.remove('show');
                gamePaused = false; // 重置暂停标志
                showDialogue(currentIndex + 1);
              }, 1000);
            }
          }, 500);
        } else {
          console.error('Chat input not found');
          // 如果找不到输入框，直接关闭界面并继续剧情
          setTimeout(() => {
            if (phoneChatInterface) phoneChatInterface.classList.remove('show');
            gamePaused = false; // 重置暂停标志
            showDialogue(currentIndex + 1);
          }, 1000);
        }
      }, 300);
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
        if (waitingForItem || waitingForPhoneResponse || gamePaused) return;
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

    // 侧边栏控制
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => { 
        sidebar.classList.toggle("show"); 
      });
    }

// 可选：主菜单按钮也加淡出动画

mainMenuBtn.addEventListener("click", () => {
  document.body.classList.remove("fade-in");
  document.body.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = "../../index.html";
  }, 500);
});

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

// -------------------- 存档读档（完整新版，多存档） --------------------


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

  });
}


if (loadBtn) {
    loadBtn.addEventListener("click", () => { 
        // 直接跳转到存档界面
        window.location.href = "../../savepage/savepage2.0/save.htm";
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
          text.textContent = `${character === 'fang' ? '学姐' : '其他'}: ${affectionData[character]}%`;
        }
        
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
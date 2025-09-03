    window.addEventListener("DOMContentLoaded", () => {
      document.body.classList.add("fade-in");
      
      // 初始化好感度系统
      initAffection();
      
      // 显示初始对话
      showDialogue(0);
      
      // 添加空格键和鼠标点击实现下一句的功能
      document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
          e.preventDefault();
          triggerNextDialogue();
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
    let waitingForItem = false;
    let isSpecialItemClicked = false;
    let hasReceivedFinalMessage = false;
    let waitingForPhoneResponse = false; // 新增：等待手机响应的状态
    let phoneNotification = null; // 新增：手机通知标记
    let gamePaused = false; // 新增：游戏暂停状态

    // 好感度数据
    let affectionData = { fang: 50, other: 30 };

    // 合并所有剧情对话 - 按照文件夹名称顺序排列
    const dialogues = [
      { name: "旁白", text: "一学期的大学生活，如同被风吹散的云烟，在不知不觉中走到了学姐约定的分别时刻" },
      { name: "旁白", text: "你的手机屏幕映出一片淡淡的白光，反射在天花板上，与傍晚的晚霞交织在一起。" },
      { name: "旁白", text: "你就这样看着天花板发呆，思绪纷飞。" },
      { name: "旁白", text: "你一个学期就这样过去了。很忙，却又说不上忙了些什么。" },
      { name: "旁白", text: "你努力回想，这一学期究竟有什么值得留恋的瞬间。" },
      { name: "旁白", text: "除了和青梅的时光，似乎就只有学姐的存在让你记得。" },
      { name: "B", text: "学姐就要走了啊。" },
      { name: "B", text: "我真的很喜欢学姐……但她对我，大概只是普通朋友的态度吧。" },
      { name: "B", text: "要分别了……我该向她表白吗？" },
      { name: "B", text: "会不会……学姐也对我有一点点意思呢？" },
      { name: "B", text: "哈哈，别傻了，现实哪有动漫里那么美好的双向奔赴。" },
      { name: "B", text: "我……真的舍不得她。" },
      { name: "B", text: "不过，就这样下去，也许挺好的，朋友以上恋人未满的状态。" },
      { name: "B", text: "是啊，就算表白成功了，真的在一起，异地恋也撑不了多久，我们也没什么情感基础……"},
      { name: "B", text: "学姐以后肯定也很忙没什么精力谈恋爱吧……"},
      { name: "B", text: "你想到了你有很多的朋友，高中毕业表白之后，大学异地恋，没过多久就分手了，十分痛苦。" },
      { name: "B", text: "异地对于没有情感基础的情侣来说还是太难。" },
      { name: "B", text: "而且学姐对我并不是那么喜欢。" },
      { name: "C", text: "想到这些，你的心里已经开始打退堂鼓。" },
      { name: "C", text: "思绪乱成一锅粥，矛盾与犹豫交织在脑海里。" },
      { name: "C", text: "最终你想到一个办法：还是看学姐的反应。" },
      { name: "B", text: "如果她来向我表白了，那我当然接受。" },
      { name: "B", text: "但是如果她没向我表白，那也就说明她对我并不是那么不舍了吧。" },
      { name: "B", text: "那我也就不必去表白了。" },
      // 好感度不足1的剧情
      { name: "B", text: "可……这样我真的不会后悔吗？" },
      { name: "B", text: "人怎么会这么矛盾呢……" },
      // 这里移除了"忽然，手机轻轻振动了一下"的对话
      { name: "C", text: "你拿起手机，屏幕上是一条简短的消息：" },
      
      { name: "C", text: "你盯着屏幕，回忆着一个学期中与学姐共同度过的点滴时光。" },
      { name: "C", text: "虽然琐碎，却也温暖而美好。" },
      { name: "C", text: "你想到这些，迅速的打出了一句：学姐我还有很多话想和你说" },
      { name: "C", text: "可你又想到了被拒绝之后的种种可能，又或是异地恋的各种可能，慢慢地将那句未发的消息删去了" },
      
      // 好感度不足2的剧情
      { name: "B", text: "就这样吧。作为朋友，我以后还是能见到学姐，还是能看她的演出。" },
      { name: "B", text: "如果捅破了这一层纱窗，可能什么都不剩了……" },
      { name: "B", text: "要是被拒绝了，我也许连出现在她的世界里都不应该了吧……" },
      { name: "B", text: "你像是下定了某种决心" },
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
      { sender: "received", text: "学弟君，最近怎么样？", time: "10:30" },
      { sender: "sent", text: "还不错，就是有点忙。学姐呢？", time: "10:32" },
      { sender: "received", text: "我也还好，最近在准备毕业演出", time: "10:35" },
      { sender: "received", text: "你会来看吗？", time: "10:35" },
      { sender: "sent", text: "当然会！我一定会去的！", time: "10:36" },
      { sender: "received", text: "太好了！我会给你留最好的位置 (＾▽＾)", time: "10:37" },
      { sender: "received", text: "说起来，时间过得真快呢", time: "10:38" },
      { sender: "received", text: "感觉昨天才刚认识你", time: "10:38" },
      { sender: "sent", text: "是啊，一学期就这么过去了", time: "10:40" },
      { sender: "sent", text: "和学姐在一起的时光真的很开心", time: "10:40" },
      { sender: "received", text: "我也是哦，和你在一起很愉快", time: "10:42" },
      { sender: "received", text: "可惜我马上就要毕业了...", time: "10:42" },
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
      phoneNotification.textContent = "1";
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
        "再见啦，学弟君~ 我已经在去机场的车上咯~ 以后有时间可以来看我的演出哦，我会为你留特等席的 (＾▽＾)"
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
    if (volumeRange) {
      volumeRange.addEventListener("input", () => { 
        // 音量控制暂时禁用
      });
    }

    if (musicBtn) {
      musicBtn.addEventListener("click", () => {
        // 切换按钮文本以表示功能
        const isPlaying = musicBtn.textContent === "音乐暂停";
        musicBtn.textContent = isPlaying ? "音乐播放" : "音乐暂停";
      });
    }

    // 侧边栏控制
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => { 
        sidebar.classList.toggle("show"); 
      });
    }

    if (mainMenuBtn) {
      mainMenuBtn.addEventListener("click", () => { 
        alert("返回主菜单"); 
      });
    }

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

    // 存档/读档
    if (saveBtn) {
      saveBtn.addEventListener("click", autoSave);
    }

    if (loadBtn) {
      loadBtn.addEventListener("click", () => { 
        alert("读档功能"); 
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
          text.textContent = `${character === 'fang' ? '芳乃' : '其他'}: ${affectionData[character]}%`;
        }
        localStorage.setItem('affectionData', JSON.stringify(affectionData));
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
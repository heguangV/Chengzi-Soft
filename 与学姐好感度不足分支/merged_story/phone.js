// 全局监听手机聊天界面开关，自动设置 window.phoneOpen
window.phoneOpen = false;
document.addEventListener("DOMContentLoaded", function() {
  var phoneChatInterface = document.getElementById("phone-chat-interface");
  if (phoneChatInterface) {
    var observer = new MutationObserver(function() {
      window.phoneOpen = phoneChatInterface.classList.contains("show");
    });
    observer.observe(phoneChatInterface, { attributes: true, attributeFilter: ["class"] });
  }
});
window.phoneModule = window.phoneModule || {};

// DOM元素 - 手机相关
window.phoneModule.phoneImage = null;
window.phoneModule.phoneChatInterface = null;
window.phoneModule.chatCloseBtn = null;
window.phoneModule.chatMessages = null;
window.phoneModule.chatInput = null;
window.phoneModule.chatSendBtn = null;

// 手机相关状态变量
window.phoneModule.waitingForPhoneResponse = false; // 等待手机响应的状态
window.phoneModule.phoneNotification = null; // 手机通知标记
window.phoneModule.hasReceivedFinalMessage = false;

// 聊天消息数据
window.phoneModule.chatData = [

];

// 初始化手机DOM元素
window.phoneModule.initPhoneElements = function() {
  window.phoneModule.phoneImage = document.getElementById("phone-image");
  window.phoneModule.phoneChatInterface = document.getElementById("phone-chat-interface");
  window.phoneModule.chatCloseBtn = document.getElementById("chat-close-btn");
  window.phoneModule.chatMessages = document.getElementById("chat-messages");
  window.phoneModule.chatInput = document.querySelector(".chat-input");
  window.phoneModule.chatSendBtn = document.querySelector(".chat-send-btn");
};

// 初始化手机聊天界面
window.phoneModule.initPhoneChat = function() {
  const { phoneImage, chatCloseBtn, chatSendBtn, chatInput } = window.phoneModule;
  
  // 点击手机图像显示聊天界面
  if (phoneImage) {
    phoneImage.addEventListener("click", (e) => {
      e.stopPropagation(); // 阻止事件冒泡
      
      // 如果是等待手机响应的状态，处理手机响应
      if (window.phoneModule.waitingForPhoneResponse) {
        window.phoneModule.handlePhoneResponse();
        return;
      }
      
      window.phoneModule.openChatInterface();
    });
  }

  // 关闭聊天界面
  if (chatCloseBtn) {
    chatCloseBtn.addEventListener("click", () => {
      window.phoneModule.closeChatInterface();
    });
  }

  // 发送消息功能
  if (chatSendBtn) {
    chatSendBtn.addEventListener("click", window.phoneModule.sendMessage);
  }

  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        window.phoneModule.sendMessage();
      }
    });
  }

  // 加载聊天记录
  window.phoneModule.loadChatMessages();
};

// 打开聊天界面
window.phoneModule.openChatInterface = function() {
  const { phoneChatInterface, chatMessages } = window.phoneModule;
  
  if (phoneChatInterface) {
    phoneChatInterface.classList.add("show");
    // 暂停游戏
    if (window.stopAutoPlay) {
      window.stopAutoPlay();
    }
    if (window.typingInterval) {
      clearInterval(window.typingInterval);
    }
    
    // 确保聊天界面滚动到底部
    setTimeout(() => {
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }
};

// 关闭聊天界面
window.phoneModule.closeChatInterface = function() {
  const { phoneChatInterface } = window.phoneModule;
  
  if (phoneChatInterface) {
    phoneChatInterface.classList.remove("show");
  }
};

// 让手机震动并显示通知
window.phoneModule.makePhoneVibrate = function() {
  const { phoneImage } = window.phoneModule;
  
  if (!phoneImage) return;
  
  // 添加震动动画
  phoneImage.classList.add("phone-vibrating");
  
  // 添加通知标记
  window.phoneModule.phoneNotification = document.createElement("div");
  window.phoneModule.phoneNotification.classList.add("phone-notification");
  window.phoneModule.phoneNotification.textContent = "1";
  phoneImage.appendChild(window.phoneModule.phoneNotification);
  
  // 设置等待手机响应的状态
  window.phoneModule.waitingForPhoneResponse = true;
  
  // 暂停自动播放
  if (window.stopAutoPlay) {
    window.stopAutoPlay();
  }
  setTimeout(() => {
  if (window.onPhoneVibrationComplete) {
    window.onPhoneVibrationComplete();
  }
}, 20000); 
};

// 处理手机响应
window.phoneModule.handlePhoneResponse = function() {
  const { phoneImage, phoneNotification } = window.phoneModule;
  
  // 移除震动效果和通知
  if (phoneImage) {
    phoneImage.classList.remove("phone-vibrating");
    if (phoneNotification && phoneImage.contains(phoneNotification)) {
      phoneImage.removeChild(phoneNotification);
    }
  }
  
  // 添加最后的消息到聊天记录
  window.phoneModule.addFinalMessageToChat();
  
  // 自动打开聊天界面
  window.phoneModule.openChatInterface();
  
  // 继续对话
  window.phoneModule.waitingForPhoneResponse = false;
  
  // 2秒后自动关闭聊天界面，不再自动推进剧情
  setTimeout(() => {
    window.phoneModule.closeChatInterface();
    // 不自动调用 showDialogue
  }, 5000);
};

// 加载聊天消息
window.phoneModule.loadChatMessages = function() {
  const { chatMessages, chatData } = window.phoneModule;
  
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
};


  


// 发送消息
window.phoneModule.sendMessage = function() {
  const { chatInput, chatMessages } = window.phoneModule;
  
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
    window.phoneModule.simulateReply();
  }, 1000);
};

// 模拟回复
window.phoneModule.simulateReply = function() {
  const { chatMessages } = window.phoneModule;
  
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
};
window.phoneModule.addFinalMessageToChat = function() {
  if (window.phoneModule.hasReceivedFinalMessage) return;
  
  window.phoneModule.hasReceivedFinalMessage = true;
  
  // 添加特定的消息序列
  const finalMessages = [
    { sender: "received", text: "今天有空吗 我有点事情想找你商量一下...", time: "12:30" },500,
    { sender: "sent", text: "我还在学校 随时听候差遣！", time: "12:31" },500,
    { sender: "received", text: "那就在操场见吧 我等你哦", time: "12:32" },500,
  ];
  
  // 添加到聊天数据
  window.phoneModule.chatData.push(...finalMessages);
  
  // 重新加载聊天消息
  window.phoneModule.loadChatMessages();
};

// 修改handlePhoneResponse函数（应该在文件顶部附近定义）
window.phoneModule.handlePhoneResponse = function() {
  const { phoneImage, phoneNotification } = window.phoneModule;
  
  // 移除震动效果和通知
  if (phoneImage) {
    phoneImage.classList.remove("phone-vibrating");
    if (phoneNotification && phoneImage.contains(phoneNotification)) {
      phoneImage.removeChild(phoneNotification);
    }
  }
  
  // 添加特定的消息到聊天记录
  window.phoneModule.addFinalMessageToChat();
  
  // 自动打开聊天界面
  window.phoneModule.openChatInterface();
  
  // 继续对话
  window.phoneModule.waitingForPhoneResponse = false;
  
  // 2秒后自动关闭聊天界面，不再自动推进剧情
  setTimeout(() => {
    window.phoneModule.closeChatInterface();
    // 不自动调用 showDialogue
  }, 5000);
};

// 自动发送"再见了"消息并关闭手机
window.phoneModule.autoSendFarewellMessage = function(showDialogueFunc, currentIndexParam) {
  console.log('autoSendFarewellMessage triggered');
  
  const { phoneChatInterface, chatInput, chatMessages } = window.phoneModule;
  
  // 使用传入的参数或从window对象获取
  const showDialogue = showDialogueFunc || window.showDialogue;
  const currentIndex = currentIndexParam !== undefined ? currentIndexParam : window.index;
  
  // 强制暂停游戏：暂停自动播放、清除打字效果、设置暂停标志
  if (window.stopAutoPlay) {
    window.stopAutoPlay();
  }
  if (window.typingInterval) {
    clearInterval(window.typingInterval);
  }
  window.gamePaused = true; // 添加一个暂停标志
  
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
      window.gamePaused = false;
      setTimeout(() => {
  // 不再自动推进剧情
      }, 500);
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
            window.phoneModule.simulateReply();
            
            // 发送后等待2秒再关闭手机界面并继续剧情
            setTimeout(function() {
              if (phoneChatInterface) {
                console.log('Closing chat interface...');
                phoneChatInterface.classList.remove('show');
              }
              
              // 重置暂停标志
              window.gamePaused = false;
              
              // 不再自动推进剧情
            }, 2000);
          }, 1500);
        } else {
          console.error('Cannot add message: chatMessages not found or message is empty');
          // 如果无法添加消息，直接关闭界面并继续剧情
          setTimeout(() => {
            if (phoneChatInterface) phoneChatInterface.classList.remove('show');
            window.gamePaused = false; // 重置暂停标志
            // 不再自动推进剧情
          }, 1000);
        }
      }, 500);
    } else {
      console.error('Chat input not found');
      // 如果找不到输入框，直接关闭界面并继续剧情
      setTimeout(() => {
        if (phoneChatInterface) phoneChatInterface.classList.remove('show');
        window.gamePaused = false; // 重置暂停标志
  // 不再自动推进剧情
      }, 1000);
    }
  }, 300);
};

// 获取手机响应状态
window.phoneModule.isWaitingForPhoneResponse = function() {
  return window.phoneModule.waitingForPhoneResponse;
};
  if (window.phoneModule) {
    window.phoneModule.initPhoneElements();
    window.phoneModule.initPhoneChat();
  }

// 导出主要函数供外部使用
window.openChatInterface = window.phoneModule.openChatInterface;
window.closeChatInterface = window.phoneModule.closeChatInterface;
window.makePhoneVibrate = window.phoneModule.makePhoneVibrate;
window.handlePhoneResponse = window.phoneModule.handlePhoneResponse;
window.autoSendFarewellMessage = window.phoneModule.autoSendFarewellMessage;
window.isWaitingForPhoneResponse = window.phoneModule.isWaitingForPhoneResponse;
// 登录状态管理函数
const auth = {
    // 检查登录状态
    isLoggedIn: function() {
        const status = localStorage.getItem('isLoggedIn');
        return status === 'true';
    },
    
    // 登录
    login: function() {
        localStorage.setItem('isLoggedIn', 'true');
        console.log('✅ 用户已登录');
    },
    
    // 登出
    logout: function() {
        localStorage.setItem('isLoggedIn', 'false');
        console.log('✅ 用户已登出');
    },
    
    // 清除状态
    clear: function() {
        localStorage.removeItem('isLoggedIn');
        console.log('✅ 登录状态已清除');
    },
    
    // 显示当前状态
    getStatus: function() {
        return localStorage.getItem('isLoggedIn');
    }
};

// 功能列表点击事件
document.addEventListener('DOMContentLoaded', function() {
    // 开始游戏按钮的事件处理已在login.js中实现，这里不再重复添加
    // 仅保留登录状态检查函数
    window.checkLoginStatus = function() {
        const status = localStorage.getItem('isLoggedIn');
        return status === 'true';
    };

    // 加载存档
    document.getElementById('load').addEventListener('click', function() {
        // 检查存档系统是否可用，如果可用则显示模态框，否则跳转到原存档页面
        if (window.saveSystem) {
            window.saveSystem.showModal();
        } else {
            // 如果存档系统不可用，回退到原来的跳转逻辑
            window.location.href = './savepage/save.htm';
        }
    });

    // 成就页面
    document.getElementById('achievement').addEventListener('click', function() {
        if (window.achievementSystem) {
            window.achievementSystem.showModal();
            window.achievementSystem.unlockAchievement('achievement_hunter');
        }
    });

    // 退出游戏
    document.getElementById('exit').addEventListener('click', function() {
        if (confirm('确定要退出游戏吗？')) {
            window.close();
            // 如果window.close()不起作用，显示提示
            if (!window.closed) {
                alert('请手动关闭浏览器标签页');
            }
        }
    });

    // 团队信息
    document.getElementById('team').addEventListener('click', function() {
        window.location.href = 'team.htm';
    });

    // 为除开始游戏外的功能项添加点击反馈动画
    const functionItems = document.querySelectorAll('.function-item:not(#start)');
    functionItems.forEach(item => {
        item.addEventListener('click', function() {
            // 添加点击反馈动画
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
});
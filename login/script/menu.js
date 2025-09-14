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
        // 未登录则阻止进入存档，提示并弹出登录框
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('currentUser');
        if (!isLoggedIn) {
            if (typeof window.showToast === 'function') {
                window.showToast('请先登录后再查看存档');
            } else {
                alert('请先登录后再查看存档');
            }
            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.style.display = 'flex';
            return;
        }
        // 已登录：检查存档系统是否可用，如果可用则显示模态框，否则跳转到原存档页面
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

    // 退出登录（无确认弹窗）
    document.getElementById('exit').addEventListener('click', function() {
        try {
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('currentUser');
            const loginUser = document.getElementById('login-username');
            const loginPwd = document.getElementById('login-password');
            if (loginUser) loginUser.value = '';
            if (loginPwd) loginPwd.value = '';
            // 轻量提示（如存在）
            if (typeof showToast === 'function') {
                showToast('已退出登录');
            }
            // 弹出居中的登录框（如存在）
            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.style.display = 'flex';
        } catch (e) {
            console.warn('退出登录时发生异常：', e);
        }
    });

    // 团队信息
    document.getElementById('team').addEventListener('click', function() {
        // 从根目录 index.html 进入，需要跳转到 login/team.htm
        window.location.href = './login/team.htm';
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
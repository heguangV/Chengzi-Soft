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

// 使用新的登录检查
document.getElementById('start').onclick = function() {
    if (auth.isLoggedIn()) {
        window.location.href = "./storypage/storypage.html";
    } else {
        window.location.href = './login/login.html';
    }
};

document.getElementById('team').onclick = function() {
    window.location.href = 'team.htm';
};
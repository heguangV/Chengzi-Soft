// 登录系统
class LoginSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 关闭按钮事件
        const closeBtn = document.getElementById('closeLogin');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }

        // 点击模态框外部关闭
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) {
                    this.hideModal();
                }
            });
        }
    }

    // 显示登录模态框
    showModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'flex';
            // 确保显示登录表单
            this.showLogin();
        }
    }

    // 隐藏登录模态框
    hideModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
            this.clearErrors();
        }
    }

    // 获取本地存储的用户列表
    getUsers() {
        return JSON.parse(localStorage.getItem("users")) || [];
    }

    // 保存用户列表到 localStorage
    saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }

    // 显示注册表单
    showSignup() {
        document.getElementById('login-form-content').style.display = 'none';
        document.getElementById('signup-form-content').style.display = 'flex';
        this.clearErrors();
    }

    // 显示登录表单
    showLogin() {
        document.getElementById('signup-form-content').style.display = 'none';
        document.getElementById('login-form-content').style.display = 'flex';
        this.clearErrors();
    }

    // 清空所有错误信息
    clearErrors() {
        const loginError = document.getElementById('login-error');
        const signupError = document.getElementById('signup-error');
        if (loginError) loginError.style.display = 'none';
        if (signupError) signupError.style.display = 'none';
    }

    // 登录验证
    goNextPage() {
        const email = document.getElementById('login-username').value.trim();
        localStorage.setItem('isLoggedIn', 'False');
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById("login-error");

        const users = this.getUsers();

        // 邮箱格式校验
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            errorDiv.innerText = "请输入正确的邮箱格式";
            errorDiv.style.display = "block";
            return;
        }

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.hideModal();
            localStorage.setItem('isLoggedIn', 'true');
            
            // 如果成就系统可用，解锁"初次登录"成就
            if (window.achievementSystem) {
                window.achievementSystem.unlockAchievement('first_login');
            }
            
            // 延迟跳转到故事页面
            setTimeout(() => {
                window.location.href = "./storypage/storypage.html";
            }, 500);
        } else {
            errorDiv.innerText = "账号或密码错误";
            errorDiv.style.display = "block";
        }
    }

    // 注册并回到登录表单，同时回显账号密码
    signUpAndGoBack() {
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const errorDiv = document.getElementById("signup-error");

        // 每次点击前清空错误提示，但不清空输入框
        errorDiv.style.display = "none";
        errorDiv.innerText = "";

        // 邮箱格式校验
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            errorDiv.innerText = "请输入正确的邮箱格式";
            errorDiv.style.display = "block";
            return;
        }

        if (!email || !password || !confirmPassword) {
            errorDiv.innerText = "请填写完整信息";
            errorDiv.style.display = "block";
            return;
        }

        if (password !== confirmPassword) {
            errorDiv.innerText = "密码与确认密码不一致";
            errorDiv.style.display = "block";
            return;
        }

        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            errorDiv.innerText = "账号已存在";
            errorDiv.style.display = "block";
            return;
        }

        // 保存用户
        users.push({ email, password });
        this.saveUsers(users);

        // 回到登录表单并回显
        this.showLogin();
        document.getElementById('login-username').value = email;
        document.getElementById('login-password').value = password;
    }
}

// 在DOM加载完成后初始化登录系统
document.addEventListener('DOMContentLoaded', function() {
    // 初始化登录系统
    window.loginSystem = new LoginSystem();
});
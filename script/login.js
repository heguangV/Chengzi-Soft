// login.js - 登录系统功能实现

// 登录系统
class LoginSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeUserData();
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

        // 注册按钮事件
        const signupBtn = document.getElementById('signup-btn');
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                this.showSignup();
            });
        }

        // 登录按钮事件
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.goNextPage();
            });
        }

        // 注册账号按钮事件
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.signUpAndGoBack();
            });
        }

        // 返回登录按钮事件
        const backToLoginBtn = document.getElementById('back-to-login-btn');
        if (backToLoginBtn) {
            backToLoginBtn.addEventListener('click', () => {
                this.showLogin();
            });
        }

        // 开始游戏按钮点击事件
        const startBtn = document.getElementById('start');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                // 检查登录状态
                const isLoggedIn = localStorage.getItem('isLoggedIn');
                if (isLoggedIn === 'true') {
                    // 添加黑屏转场效果
                    const fadeTransition = document.getElementById('fadeTransition');
                    fadeTransition.classList.add('active');
                    
                    // 延迟跳转，等待转场效果完成
                    setTimeout(() => {
                        window.location.href = ".\\与学姐好感度不足分支\\storypage2.0 与学姐好感度不足1\\storypage.html";
                    }, 500);
                } else {
                    this.showModal();
                }
            });
        }
    }

    // 初始化用户数据
    initializeUserData() {
        if (!localStorage.getItem('users')) {
            // 初始化示例用户
            const initialUsers = [
                { email: 'player1@example.com', password: '123456' },
                { email: 'gamer2023@example.com', password: 'abcdef' }
            ];
            localStorage.setItem('users', JSON.stringify(initialUsers));
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
        // 移除错误的登录状态设置
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
            // 设置登录状态为已登录
            localStorage.setItem('isLoggedIn', 'true');
            console.log('✅ 用户登录成功:', email);
            
            // 如果成就系统可用，解锁"初次登录"成就
            if (window.achievementSystem) {
                window.achievementSystem.unlockAchievement('first_login');
            }
            
            // 隐藏模态框
            this.hideModal();
            
            // 添加黑屏转场效果
            const fadeTransition = document.getElementById('fadeTransition');
            fadeTransition.classList.add('active');
            
            // 跳转到故事页面，与已登录用户跳转目标保持一致
            setTimeout(() => {
                window.location.href = ".\\与学姐好感度不足分支\\storypage2.0 与学姐好感度不足1\\storypage.html";
            }, 500);
        } else {
            // 设置登录状态为未登录
            localStorage.setItem('isLoggedIn', 'false');
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
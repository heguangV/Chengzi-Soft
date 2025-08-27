// 获取本地存储的用户列表
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

// 保存用户列表到 localStorage
function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

// 显示注册表单
function showSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'flex';
    clearErrors();
}

// 显示登录表单
function showLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'flex';
    clearErrors();
}

// 清空所有错误信息
function clearErrors() {
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    if (loginError) loginError.style.display = 'none';
    if (signupError) signupError.style.display = 'none';
}

// 登录验证
function goNextPage() {
    const email = document.querySelector("#login-form input[name='email']").value.trim();
    const password = document.querySelector("#login-form input[name='password']").value;
    const errorDiv = document.getElementById("login-error");

    const users = getUsers();

    // ⭐新增：邮箱格式校验
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errorDiv.innerText = "请输入正确的邮箱格式";
        errorDiv.style.display = "block";
        return;
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        /*const body = document.body;
        body.classList.add("fade-out");
    
        body.addEventListener("animationend", () => {
            window.location.href = "main.html";
        }, { once: true });*/
           // 隐藏表单
           /*document.querySelector("#login-form").style.display = "none";
           // 显示加载动画
           document.getElementById("loader").style.display = "block";
   
           // 模拟加载延迟，比如 1.5 秒后跳转
           setTimeout(() => {
               window.location.href = "main.html";
           }, 1500);*/
           const loaderWrapper = document.getElementById('loader-wrapper');
           loaderWrapper.style.display = 'block';
       
           // 隐藏表单
           document.querySelector('.form').style.display = 'none';
       
           // 模拟加载时间，然后跳转
           setTimeout(() => {
               window.location.href = "main.html";
           }, 1500); // 1.5秒加载动画
   
    }
     else {
        errorDiv.innerText = "账号或密码错误";
        errorDiv.style.display = "block";
    }
}

// 注册并回到登录表单，同时回显账号密码
function signUpAndGoBack() {
    const email = document.querySelector("#signup-form input[name='email']").value.trim();
    const password = document.querySelector("#signup-form input[name='password']").value;
    const confirmPassword = document.querySelector("#signup-form input[name='confirm-password']").value;
    const errorDiv = document.getElementById("signup-error");

    // 每次点击前清空错误提示，但不清空输入框
    errorDiv.style.display = "none";
    errorDiv.innerText = "";

    // ⭐新增：邮箱格式校验
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

    const users = getUsers();
    if (users.find(u => u.email === email)) {
        errorDiv.innerText = "账号已存在";
        errorDiv.style.display = "block";
        return;
    }

    // 保存用户
    users.push({ email, password });
    saveUsers(users);

    // 回到登录表单并回显
    showLogin();
    document.querySelector("#login-form input[name='email']").value = email;
    document.querySelector("#login-form input[name='password']").value = password;
}

const musicBtn = document.getElementById("music");
const bgMusic = document.getElementById("bg-music");

musicBtn.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicBtn.textContent = "⏸"; // 切换为暂停符号
  } else {
    bgMusic.pause();
    musicBtn.textContent = "▶"; // 切换为播放符号
  }
});
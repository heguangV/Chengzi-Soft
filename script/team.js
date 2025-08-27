// 修复后的透明度控制代码
window.addEventListener('DOMContentLoaded', function() {
    let timer = null;
    
    const centerArea = document.querySelector('.center-area');
    if (!centerArea) {
        console.error('找不到 .center-area 元素');
        return;
    }
    function isInSideArea(e) {
        const rect = centerArea.getBoundingClientRect();
        const x = e.clientX;
        // 检测鼠标是否在.center-area元素的左侧或右侧
        return x < rect.left || x > rect.right;
    }
    
    document.addEventListener('mousemove', function(e) {
        if (isInSideArea(e)) {
            console.log('鼠标在两侧区域');
            if (!timer) {
                timer = setTimeout(() => {
                    centerArea.classList.add('transparent');
                    console.log('内容区域变透明');
                }, 3000);
            }
        } else {
            console.log('鼠标在内容区域');
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            centerArea.classList.remove('transparent');
        }
    });
    
    // 添加鼠标离开页面时的清理
    document.addEventListener('mouseleave', function() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        centerArea.classList.remove('transparent');
    });
});

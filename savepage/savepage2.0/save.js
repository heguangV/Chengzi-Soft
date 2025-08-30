// 初始化存档界面
function initSaveUI() {
    const storeWin = document.querySelector(".saves");
    const saves = JSON.parse(localStorage.getItem("storySaves") || "[]");

    // 按时间戳降序排序存档
    saves.sort((a, b) => b.timestamp - a.timestamp);

    const saveSlots = storeWin.querySelectorAll('.save');

    saveSlots.forEach((slot, index) => {
        const h5 = slot.querySelector('h5');
        const dateDiv = slot.querySelector('.save-date');
        const nodeDiv = slot.querySelector('.save-nodeId');
        const bgImg = slot.querySelector('.save-bgr');

        if (index < saves.length) {
            const save = saves[index];
            h5.textContent = `存档 ${index + 1}`;
            dateDiv.textContent = new Date(save.timestamp).toLocaleString();
            nodeDiv.textContent = `进度: ${save.dialogueIndex}`;
            bgImg.src = "6.png";
        } else {
            h5.textContent = "空存档位";
            dateDiv.textContent = "";
            nodeDiv.textContent = "";
            bgImg.src = "6.png";
        }
    });
}

/**
 * 读取选定的存档
 * @param {number} index - 存档索引(0-based)
 */
function readSave(index) {
    const saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
    if (index >= saves.length) return;

    const save = saves[index];
    // 跳转回故事页面并加载存档
    window.location.href = `storypage.html?load=${save.timestamp}`;
}

/**
 * 删除指定存档
 * @param {number} index - 存档索引(0-based)
 */
function deleteSave(index) {
    let saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
    if (index >= saves.length) return;

    if (confirm("确定要删除这个存档吗？")) {
        saves.splice(index, 1);
        localStorage.setItem("storySaves", JSON.stringify(saves));
        initSaveUI();
    }
}

// 绑定存档选择事件
document.querySelectorAll('.save-bgr').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        readSave(index);
    });
});

// 绑定删除按钮事件
document.querySelectorAll('.save-delete').forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteSave(index);
    });
});

// 页面加载完成后初始化存档界面
window.addEventListener('DOMContentLoaded', initSaveUI);
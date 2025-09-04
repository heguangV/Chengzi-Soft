// -------------------- 多存档功能整合 --------------------

// 🔹 初始化存档界面（显示多存档信息）
function initSaveUI() {
    const storeWin = document.querySelector(".saves");
    if (!storeWin) return;

    const saves = JSON.parse(localStorage.getItem("storySaves") || "[]");

    // 按时间戳降序排序
    saves.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem("storySaves", JSON.stringify(saves));

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
            bgImg.src = save.background || "6.png"; // 优先使用存档的背景图，如果没有则用默认
        } else {
            h5.textContent = "空存档位";
            dateDiv.textContent = "";
            nodeDiv.textContent = "";
            bgImg.src = "6.png";
        }
    });

    // 🔹 绑定点击事件（先解绑防止重复绑定）
    saveSlots.forEach((slot, idx) => {
        const bgBtn = slot.querySelector('.save-bgr');
        const delBtn = slot.querySelector('.save-delete');

        if (bgBtn) {
            bgBtn.onclick = () => readSave(idx);
        }
        if (delBtn) {
            delBtn.onclick = (e) => {
                e.stopPropagation();
                deleteSave(idx);
            };
        }
    });
}


function readSave(idx) {
    const saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
    if (idx >= saves.length) return;

    const save = saves[idx];

    // 如果存档里有绝对路径，就直接跳转到该页面并传 load 参数
    if (save.scene) {
        window.location.href = `${save.scene}?load=${save.timestamp}`;
    } else {
        console.error("存档路径无效！");
        alert("该存档无法读取！");
    }
}


// 🔹 删除指定存档
function deleteSave(idx) {
    let saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
    if (idx >= saves.length) return;

    if (confirm("确定要删除这个存档吗？")) {
        saves.splice(idx, 1);
        localStorage.setItem("storySaves", JSON.stringify(saves));
        initSaveUI();
    }
}

// -------------------- 页面加载时检查 URL 是否有读档参数 --------------------
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const loadTimestamp = urlParams.get("load");
    if (loadTimestamp) {
        const saves = JSON.parse(localStorage.getItem("storySaves") || "[]");
        const save = saves.find(s => s.timestamp == loadTimestamp);
        if (save) {
            currentBranch = save.branch;
            index = save.dialogueIndex;
            Object.assign(affectionData, save.affectionData);
            updateAffection('senpai', affectionData.senpai);
            showDialogue(currentBranch, index);
            alert("读档成功！");
        }
    }

    // 初始化存档界面
    initSaveUI();
});

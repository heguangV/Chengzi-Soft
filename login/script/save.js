// 存档系统
class SaveSystem {
    constructor() {
        this.maxSaveSlots = 6;
        this.currentSaves = [];
        this.init();
    }

    init() {
        this.loadSaves();
        this.setupEventListeners();
        this.renderSaveSlots();
    }

    setupEventListeners() {
        // 注意：load按钮的事件监听器已在menu.js中设置，这里不需要重复绑定
        
        // 关闭按钮事件
        const closeBtn = document.getElementById('closeSave');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }

        // 新建存档按钮
        const newSaveBtn = document.getElementById('newSaveBtn');
        if (newSaveBtn) {
            newSaveBtn.addEventListener('click', () => {
                this.createNewSave();
            });
        }

        // 导入存档按钮
        const importSaveBtn = document.getElementById('importSaveBtn');
        if (importSaveBtn) {
            importSaveBtn.addEventListener('click', () => {
                this.importSave();
            });
        }

        // 点击模态框外部关闭
        const saveModal = document.getElementById('saveModal');
        if (saveModal) {
            saveModal.addEventListener('click', (e) => {
                if (e.target === saveModal) {
                    this.hideModal();
                }
            });
        }
    }

    getCurrentUserKey() {
        const user = localStorage.getItem('currentUser');
        return user ? 'storySaves_' + user : 'storySaves_guest';
    }

    loadSaves() {
        const savedData = localStorage.getItem(this.getCurrentUserKey());
        this.currentSaves = savedData ? JSON.parse(savedData) : [];
        // 按时间戳降序排序
        this.currentSaves.sort((a, b) => b.timestamp - a.timestamp);
    }

    saveSaves() {
        localStorage.setItem(this.getCurrentUserKey(), JSON.stringify(this.currentSaves));
    }

    renderSaveSlots() {
        const container = document.getElementById('saveContainer');
        if (!container) return;

        container.innerHTML = '';

        // 创建存档位
        for (let i = 0; i < this.maxSaveSlots; i++) {
            const saveSlot = this.createSaveSlot(i);
            container.appendChild(saveSlot);
        }
    }

    createSaveSlot(index) {
        const slot = document.createElement('div');
        slot.className = 'save-slot';
        
        const save = this.currentSaves[index];
        
        if (save) {
            // 有存档数据
            slot.innerHTML = `
                <div class="save-slot-header">
                    <h5 class="save-slot-title">存档 ${index + 1}</h5>
                    <button class="save-delete-btn" data-index="${index}">×</button>
                </div>
                <div class="save-slot-content">
                    <div class="save-slot-image">💾</div>
                    <div class="save-slot-info">
                        <div class="save-slot-date">${this.formatDate(save.timestamp)}</div>
                        <div class="save-slot-progress">进度: ${save.dialogueIndex || 0}</div>
                        <div class="save-slot-progress">角色: ${save.characterName || '未知'}</div>
                    </div>
                </div>
            `;

            // 绑定存档点击事件
            slot.addEventListener('click', () => {
                this.loadSave(index);
            });

            // 绑定删除按钮事件
            const deleteBtn = slot.querySelector('.save-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSave(index);
            });
        } else {
            // 空存档位
            slot.classList.add('empty');
            slot.innerHTML = `
                <div class="save-slot-header">
                    <h5 class="save-slot-title">空存档位</h5>
                </div>
                <div class="save-slot-content">
                    <div class="save-slot-image">+</div>
                    <div class="save-slot-info">
                        <div class="save-slot-progress">点击创建新存档</div>
                    </div>
                </div>
            `;

            // 绑定创建存档事件
            slot.addEventListener('click', () => {
                this.createNewSave();
            });
        }

        return slot;
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    createNewSave() {
        if (this.currentSaves.length >= this.maxSaveSlots) {
            alert('存档位已满，请删除一些旧存档后再试。');
            return;
        }

        const newSave = {
            timestamp: Date.now(),
            dialogueIndex: 0,
            characterName: '学姐',
            storyProgress: '开始',
            affectionData: {
                fang: 50,
                other: 30
            }
        };

        this.currentSaves.push(newSave);
        this.saveSaves();
        this.renderSaveSlots();

        alert('新存档创建成功！');
    }

    loadSave(index) {
        const save = this.currentSaves[index];
        if (!save) return;

        // 跳转到存档对应的剧情页
        if (save.scene) {
            window.location.href = `${save.scene}?load=${save.timestamp}`;
        } else {
            alert("该存档无法读取！");
        }

        // 关闭模态框
        this.hideModal();
    }

    deleteSave(index) {
        const save = this.currentSaves[index];
        if (!save) return;

        if (confirm(`确定要删除存档 ${index + 1} 吗？\n删除后无法恢复。`)) {
            this.currentSaves.splice(index, 1);
            this.saveSaves();
            this.renderSaveSlots();
        }
    }

    importSave() {
        // 创建文件输入元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    if (this.currentSaves.length >= this.maxSaveSlots) {
                        alert('存档位已满，无法导入新存档。');
                        return;
                    }

                    // 验证导入数据的格式
                    if (this.validateSaveData(importedData)) {
                        this.currentSaves.push(importedData);
                        this.saveSaves();
                        this.renderSaveSlots();
                        alert('存档导入成功！');
                    } else {
                        alert('导入的存档数据格式不正确。');
                    }
                } catch (error) {
                    alert('导入失败：文件格式错误。');
                }
            };
            
            reader.readAsText(file);
        });

        fileInput.click();
    }

    validateSaveData(data) {
        return data && 
               typeof data.timestamp === 'number' && 
               typeof data.dialogueIndex === 'number' &&
               typeof data.characterName === 'string';
    }

    showModal() {
        const modal = document.getElementById('saveModal');
        if (!modal) return;

        // 刷新存档数据
        this.loadSaves();
        this.renderSaveSlots();

        modal.style.display = 'block';
        
        // 添加动画类
        setTimeout(() => {
            modal.classList.add('modal-visible');
        }, 10);
    }

    hideModal() {
        const modal = document.getElementById('saveModal');
        if (!modal) return;

        modal.classList.add('modal-hiding');
        
        setTimeout(() => {
            modal.classList.remove('modal-visible', 'modal-hiding');
            modal.style.display = 'none';
        }, 300);
    }

    // 外部调用方法：保存当前游戏状态
    saveCurrentGame(dialogueIndex, characterName, storyProgress, affectionData) {
        const save = {
            timestamp: Date.now(),
            dialogueIndex: dialogueIndex || 0,
            characterName: characterName || '学姐',
            storyProgress: storyProgress || '进行中',
            affectionData: affectionData || {
                fang: 50,
                other: 30
            }
        };

        // 如果存档位已满，替换最旧的存档
        if (this.currentSaves.length >= this.maxSaveSlots) {
            this.currentSaves.shift(); // 删除最旧的存档
        }

        this.currentSaves.push(save);
        this.saveSaves();
        
        return save;
    }

    // 外部调用方法：获取存档数量
    getSaveCount() {
        return this.currentSaves.length;
    }

    // 外部调用方法：检查是否有存档
    hasSaves() {
        return this.currentSaves.length > 0;
    }
}

// 页面加载完成后初始化存档系统
document.addEventListener('DOMContentLoaded', () => {
    window.saveSystem = new SaveSystem();
});

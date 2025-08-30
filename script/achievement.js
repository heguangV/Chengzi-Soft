// 成就系统
class AchievementSystem {
    constructor() {
        this.achievements = [
            {
                id: 'first_login',
                name: '初次登录',
                description: '第一次进入游戏',
                completed: false,
                completedTime: null,
                icon: '🎮'
            },
            {
                id: 'story_progress',
                name: '故事探索者',
                description: '完成第一个故事章节',
                completed: false,
                completedTime: null,
                icon: '📖'
            },
            {
                id: 'music_lover',
                name: '音乐爱好者',
                description: '播放背景音乐',
                completed: false,
                completedTime: null,
                icon: '🎵'
            },
            {
                id: 'team_viewer',
                name: '团队观察者',
                description: '查看团队信息页面',
                completed: false,
                completedTime: null,
                icon: '👥'
            },
            {
                id: 'achievement_hunter',
                name: '成就猎人',
                description: '查看成就页面',
                completed: false,
                completedTime: null,
                icon: '🏆'
            },
            {
                id: 'game_master',
                name: '游戏大师',
                description: '完成所有主要功能',
                completed: false,
                completedTime: null,
                icon: '👑'
            }
        ];
        
        this.currentTab = 'completed';
        this.init();
    }

    init() {
        this.loadAchievements();
        this.setupEventListeners();
        this.renderAchievements();
        
        // 自动解锁一些成就
        this.autoUnlockAchievements();
    }

    setupEventListeners() {
        // 成就按钮点击事件
        const achievementBtn = document.getElementById('achievement');
        if (achievementBtn) {
            achievementBtn.addEventListener('click', () => {
                this.showModal();
                this.unlockAchievement('achievement_hunter');
            });
        }

        // 关闭按钮事件
        const closeBtn = document.getElementById('closeAchievement');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }

        // 标签页切换事件
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 点击模态框外部关闭
        const modal = document.getElementById('achievementModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }

    showModal() {
        const modal = document.getElementById('achievementModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal() {
        const modal = document.getElementById('achievementModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // 更新标签页状态
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        this.renderAchievements();
    }

    renderAchievements() {
        const achievementList = document.getElementById('achievementList');
        if (!achievementList) return;

        const filteredAchievements = this.achievements.filter(achievement => {
            if (this.currentTab === 'completed') {
                return achievement.completed;
            } else {
                return !achievement.completed;
            }
        });

        if (filteredAchievements.length === 0) {
            achievementList.innerHTML = `
                <div class="achievement-item" style="text-align: center; color: rgba(255,255,255,0.7);">
                    ${this.currentTab === 'completed' ? '还没有完成的成就' : '所有成就都已完成！'}
                </div>
            `;
            return;
        }

        achievementList.innerHTML = filteredAchievements.map(achievement => {
            const timeStr = achievement.completedTime 
                ? new Date(achievement.completedTime).toLocaleString('zh-CN')
                : '未完成';
            
            return `
                <div class="achievement-item ${achievement.completed ? 'completed' : 'uncompleted'}">
                    <div class="achievement-name">
                        ${achievement.icon} ${achievement.name}
                    </div>
                    <div class="achievement-description">
                        ${achievement.description}
                    </div>
                    <div class="achievement-time">
                        完成时间: ${timeStr}
                    </div>
                    ${achievement.completed ? '' : `
                        <div class="achievement-progress">
                            <div class="progress-bar" style="width: 0%"></div>
                        </div>
                    `}
                </div>
            `;
        }).join('');
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.completed) {
            achievement.completed = true;
            achievement.completedTime = new Date().toISOString();
            this.saveAchievements();
            this.renderAchievements();
            
            // 显示解锁提示
            this.showUnlockNotification(achievement);
        }
    }

    showUnlockNotification(achievement) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🏆</span>
                <div class="notification-text">
                    <div class="notification-title">成就解锁！</div>
                    <div class="notification-desc">${achievement.name}</div>
                </div>
            </div>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 3000;
            transform: translateX(400px);
            transition: transform 0.5s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
    // 在成就对象中添加进度字段
{
    id: 'story_progress',
    name: '故事探索者',
    description: '完成故事章节',
    completed: false,
    completedTime: null,
    icon: '📖',
    progress: 0,        // 新增进度字段
    target: 5           // 新增目标值
}

// 更新解锁方法以支持进度
    updateAchievementProgress(achievementId, progress) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.completed) {
        achievement.progress = Math.min(progress, achievement.target);
        
        if (achievement.progress >= achievement.target) {
            this.unlockAchievement(achievementId);
        }
        
        this.saveAchievements();
        this.renderAchievements();
    }
}
    autoUnlockAchievements() {
        // 自动解锁初次登录成就
        this.unlockAchievement('first_login');
        
        // 检查其他可能的成就
        this.checkMusicAchievement();
        this.checkTeamAchievement();
    }

    checkMusicAchievement() {
        const musicBtn = document.getElementById('music');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                this.unlockAchievement('music_lover');
            });
        }
    }

    checkTeamAchievement() {
        const teamBtn = document.getElementById('team');
        if (teamBtn) {
            teamBtn.addEventListener('click', () => {
                this.unlockAchievement('team_viewer');
            });
        }
    }

    saveAchievements() {
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }

    loadAchievements() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            try {
                this.achievements = JSON.parse(saved);
            } catch (e) {
                console.error('加载成就数据失败:', e);
            }
        }
    }

    // 外部调用的解锁方法
    unlockStoryProgress() {
        this.unlockAchievement('story_progress');
    }

    unlockGameMaster() {
        // 检查是否所有主要成就都已完成
        const mainAchievements = ['first_login', 'story_progress', 'music_lover', 'team_viewer', 'achievement_hunter'];
        const allCompleted = mainAchievements.every(id => 
            this.achievements.find(a => a.id === id)?.completed
        );
        
        if (allCompleted) {
            this.unlockAchievement('game_master');
        }
    }
}

// 初始化成就系统
let achievementSystem;

// 等待DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    achievementSystem = new AchievementSystem();
});

// 导出成就系统供其他脚本使用
window.achievementSystem = achievementSystem;

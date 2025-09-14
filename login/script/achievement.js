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
                icon: '🎮',
                progress: 0,
                target: 1
            },
            {
                id: 'story_progress',
                name: '故事探索者',
                description: '完成第一个故事章节',
                completed: false,
                completedTime: null,
                icon: '📖',
                progress: 0,
                target: 5
            },
            {
                id: 'music_lover',
                name: '音乐爱好者',
                description: '播放背景音乐',
                completed: false,
                completedTime: null,
                icon: '🎵',
                progress: 0,
                target: 1
            },
            {
                id: 'team_viewer',
                name: '团队观察者',
                description: '查看团队信息页面',
                completed: false,
                completedTime: null,
                icon: '👥',
                progress: 0,
                target: 1
            },
            {
                id: 'achievement_hunter',
                name: '成就猎人',
                description: '查看成就页面',
                completed: false,
                completedTime: null,
                icon: '🏆',
                progress: 0,
                target: 1
            },

            {
                id: 'missed_chance',
                name: '给你机会你不中用',
                description: '选择继续睡觉或转身离开并触发结局',
                completed: false,
                completedTime: null,
                icon: '😴',
                progress: 0,
                target: 1
            },
                {
                    id: 'zhongwei_molu',
                    name: '终为陌路',
                    description: '北湖分支触发结局',
                    completed: false,
                    completedTime: null,
                    icon: '🧊',
                    progress: 0,
                    target: 1
                },
                {
                    id: 'qiyun_zhizi',
                    name: '气运之子',
                    description: '抢课返回值为 5 时解锁',
                    icon: '🍀',
                    progress: 0,
                    target: 1
                },
                {
                    id: 'pofang_gaoshou',
                    name: '破防高手',
                    description: '冰红茶得分大于 2000 时解锁',
                    icon: '🥤',
                    progress: 0,
                    target: 1
                },
                {
                    id: 'youming_wufen',
                    name: '有命无分',
                    description: '在不足分支触发 BE「此情可待成追忆，只是当时已惘然。」',
                    completed: false,
                    completedTime: null,
                    icon: '🍂',
                    progress: 0,
                    target: 1
                },
                {
                    id: 'kaichuang_weilai',
                    name: '开创未来',
                    description: '在温软的对话渐亮的结局中点亮希望',
                    completed: false,
                    completedTime: null,
                    icon: '🌟',
                    progress: 0,
                    target: 1
                },
                {
                    id: 'ending_master',
                    name: '结局掌控者',
                    description: '集齐所有结局成就',
                    completed: false,
                    completedTime: null,
                    icon: '👑',
                    progress: 0,
                    target: 1
                },
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

    // 初始化后检查一次是否已集齐所有结局成就
    this.checkEndingMaster();
    }

    // 登录校验：必须存在 currentUser 且 isLoggedIn === 'true'
    isUserLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('currentUser');
    }

    setupEventListeners() {
        // 成就按钮点击事件
        const achievementBtn = document.getElementById('achievement');
        if (achievementBtn) {
            achievementBtn.addEventListener('click', () => {
                this.showModal();
                // 仅登录后才记录“成就猎人”
                if (this.isUserLoggedIn()) {
                    this.unlockAchievement('achievement_hunter');
                }
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
            
            // 添加出现动画类
            setTimeout(() => {
                modal.classList.add('modal-visible');
            }, 10);
        }
    }

    hideModal() {
        const modal = document.getElementById('achievementModal');
        if (modal) {
            modal.classList.remove('modal-visible');
            modal.classList.add('modal-hiding');
            
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('modal-hiding');
                document.body.style.overflow = 'auto';
            }, 300);
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
                <div class="achievement-item empty-state">
                    <div class="empty-text">
                        ${this.currentTab === 'completed' ? '还没有完成的成就' : '所有成就都已完成！'}
                    </div>
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
                            <div class="progress-bar" style="width: ${(achievement.progress / achievement.target) * 100}%"></div>
                        </div>
                    `}
                </div>
            `;
        }).join('');
    }

    unlockAchievement(achievementId) {
        // 未登录不允许解锁成就
        if (!this.isUserLoggedIn()) {
            return;
        }
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.completed) {
            achievement.completed = true;
            achievement.completedTime = new Date().toISOString();
            this.saveAchievements();
            this.renderAchievements();
            
            // 显示解锁提示
            this.showUnlockNotification(achievement);

            // 任一成就解锁后，检查是否满足“结局掌控者”
            this.checkEndingMaster();
        }
    }

    updateAchievementProgress(achievementId, progress) {
        // 未登录不记录进度
        if (!this.isUserLoggedIn()) {
            return;
        }
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
            background: linear-gradient(45deg, #8B7355, #A0522D);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 3000;
            transform: translateX(400px);
            transition: transform 0.5s ease;
            max-width: 300px;
            font-family: 'ZCOOL XiaoWei', sans-serif;
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

    autoUnlockAchievements() {
        // 只有已登录账号才自动解锁初次登录成就
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.unlockAchievement('first_login');
        }
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

    getCurrentUserKey() {
        const user = localStorage.getItem('currentUser');
        return user ? 'achievements_' + user : null; // 未登录不返回 guest key
    }

    saveAchievements() {
        const key = this.getCurrentUserKey();
        if (!key) return; // 未登录不保存
        localStorage.setItem(key, JSON.stringify(this.achievements));
    }

    loadAchievements() {
        const key = this.getCurrentUserKey();
        if (!key) return; // 未登录时使用默认内存状态（全部未完成）
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const savedAchievements = JSON.parse(saved);
                // 合并新成就
                this.achievements.forEach(ach => {
                    const savedAch = savedAchievements.find(a => a.id === ach.id);
                    if (savedAch) {
                        ach.completed = savedAch.completed;
                        ach.completedTime = savedAch.completedTime;
                        ach.progress = savedAch.progress;
                    }
                });
            } catch (e) {
                console.error('加载成就数据失败:', e);
            }
        }
    }
    
    // 检查是否集齐所有结局成就（自动点亮“结局掌控者”）
    checkEndingMaster() {
        const endingIds = ['missed_chance', 'zhongwei_molu', 'youming_wufen', 'kaichuang_weilai'];
        const allCompleted = endingIds.every(id => this.achievements.find(a => a.id === id)?.completed);
        if (allCompleted) {
            this.unlockAchievement('ending_master');
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

document.addEventListener('DOMContentLoaded', () => {
    const achievementSystemInstance = new AchievementSystem();
    // 全局可访问
    window.achievementSystem = achievementSystemInstance;
});

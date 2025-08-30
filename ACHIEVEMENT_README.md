# 🏆 成就系统使用说明

## 功能概述

这是一个隐藏的成就页面系统，点击"成就页面"按钮后会显示一个美观的模态框，展示已完成的成就和未完成的成就。

## 主要特性

- **隐藏式设计**: 成就页面默认隐藏，只有点击按钮才会显示
- **分类显示**: 分为"已完成"和"未完成"两个标签页
- **时间记录**: 记录每个成就的完成时间
- **自动解锁**: 某些成就会在特定操作后自动解锁
- **本地存储**: 成就进度保存在浏览器的localStorage中
- **响应式设计**: 支持不同屏幕尺寸

## 成就列表

### 自动解锁成就
1. **初次登录** 🎮 - 第一次进入游戏时自动解锁
2. **音乐爱好者** 🎵 - 点击音乐按钮时解锁
3. **团队观察者** 👥 - 点击团队信息按钮时解锁
4. **成就猎人** 🏆 - 查看成就页面时解锁

### 手动解锁成就
1. **故事探索者** 📖 - 需要调用 `achievementSystem.unlockStoryProgress()`
2. **游戏大师** 👑 - 完成所有主要成就后自动解锁

## 使用方法

### 基本使用
1. 点击主菜单中的"成就页面"按钮
2. 在弹出的模态框中查看成就
3. 使用标签页切换查看已完成/未完成的成就
4. 点击关闭按钮或按ESC键关闭页面

### 开发者集成
在其他页面中解锁成就：

```javascript
// 解锁故事进度成就
if (window.achievementSystem) {
    window.achievementSystem.unlockStoryProgress();
}

// 解锁游戏大师成就
if (window.achievementSystem) {
    window.achievementSystem.unlockGameMaster();
}
```

## 文件结构

```
├── index.html                    # 主页面，包含成就按钮
├── asset/styles/achievement.css  # 成就页面样式
├── script/achievement.js         # 成就系统逻辑
└── script/menu.js               # 菜单交互逻辑
```

## 自定义成就

要添加新的成就，在 `achievement.js` 中的 `achievements` 数组添加：

```javascript
{
    id: 'unique_id',
    name: '成就名称',
    description: '成就描述',
    completed: false,
    completedTime: null,
    icon: '🎯'
}
```

## 样式定制

成就页面的样式可以通过修改 `achievement.css` 文件来自定义：
- 颜色主题
- 动画效果
- 布局样式
- 响应式断点

## 浏览器兼容性

- 支持现代浏览器（Chrome, Firefox, Safari, Edge）
- 使用localStorage进行数据持久化
- 支持触摸设备的响应式设计

## 注意事项

1. 成就数据保存在浏览器的localStorage中，清除浏览器数据会丢失进度
2. 成就系统需要在页面加载完成后才能使用
3. 建议在游戏的关键节点调用相应的解锁方法

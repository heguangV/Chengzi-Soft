// 音乐播放器系统
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('bg-music');
        this.playBtn = document.getElementById('music-btn');
        this.musicIcon = this.playBtn.querySelector('.music-icon');
        this.volumeSlider = document.getElementById('volume-range');
        this.volumeIcon = document.querySelector('.volume-icon');
        this.musicPlayer = document.querySelector('.music-player');
        this.visualizerBars = document.querySelectorAll('.visualizer-bar');
        
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 0.5;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.updateUI();
        this.setupVisualizer();
    }
    
    setupEventListeners() {
        // 播放/暂停按钮事件
        this.playBtn.addEventListener('click', () => {
            this.togglePlay();
        });
        
        // 音量控制事件
        this.volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });
        
        // 音量图标点击事件（静音/取消静音）
        this.volumeIcon.addEventListener('click', () => {
            this.toggleMute();
        });
        
        // 音频事件监听
        this.audio.addEventListener('play', () => {
            this.onPlay();
        });
        
        this.audio.addEventListener('pause', () => {
            this.onPause();
        });
        
        this.audio.addEventListener('ended', () => {
            this.onEnded();
        });
        
        this.audio.addEventListener('error', () => {
            this.onError();
        });
        
        this.audio.addEventListener('loadeddata', () => {
            this.onLoaded();
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }
    
    setupVisualizer() {
        // 设置可视化器条的高度
        this.visualizerBars.forEach((bar, index) => {
            const baseHeight = 15 + (index * 2);
            bar.style.height = `${baseHeight}px`;
        });
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        if (this.audio.src && this.audio.src !== 'about:blank') {
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updateUI();
                this.startVisualizer();
            }).catch(error => {
                console.error('播放失败:', error);
                this.showError();
            });
        } else {
            console.warn('没有音频文件');
            this.showError();
        }
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updateUI();
        this.stopVisualizer();
    }
    
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        this.audio.volume = this.volume;
        this.updateVolumeUI();
        this.saveSettings();
        
        // 如果音量为0，自动静音
        if (this.volume === 0) {
            this.isMuted = true;
            this.updateMuteUI();
        } else if (this.isMuted) {
            this.isMuted = false;
            this.updateMuteUI();
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.audio.volume = 0;
        } else {
            this.audio.volume = this.volume;
        }
        
        this.updateMuteUI();
        this.saveSettings();
    }
    
    startVisualizer() {
        this.musicPlayer.classList.add('playing');
        this.playBtn.classList.add('playing');
    }
    
    stopVisualizer() {
        this.musicPlayer.classList.remove('playing');
        this.playBtn.classList.remove('playing');
    }
    
    updateUI() {
        if (this.isPlaying) {
            this.musicIcon.textContent = '⏸';
            this.playBtn.classList.add('playing');
        } else {
            this.musicIcon.textContent = '▶';
            this.playBtn.classList.remove('playing');
        }
    }
    
    updateVolumeUI() {
        this.volumeSlider.value = this.volume * 100;
    }
    
    updateMuteUI() {
        if (this.isMuted) {
            this.musicPlayer.classList.add('muted');
            this.volumeIcon.textContent = '🔇';
        } else {
            this.musicPlayer.classList.remove('muted');
            this.volumeIcon.textContent = '🔊';
        }
    }
    
    onPlay() {
        this.isPlaying = true;
        this.updateUI();
        this.startVisualizer();
    }
    
    onPause() {
        this.isPlaying = false;
        this.updateUI();
        this.stopVisualizer();
    }
    
    onEnded() {
        // 由于设置了loop，这个事件通常不会触发
        this.isPlaying = false;
        this.updateUI();
        this.stopVisualizer();
    }
    
    onError() {
        console.error('音频播放错误');
        this.showError();
    }
    
    onLoaded() {
        console.log('音频加载完成');
        this.playBtn.classList.remove('loading');
    }
    
    showError() {
        this.playBtn.classList.add('error');
        setTimeout(() => {
            this.playBtn.classList.remove('error');
        }, 2000);
    }
    
    handleKeyboard(e) {
        // 空格键：播放/暂停
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            this.togglePlay();
        }
        
        // M键：静音/取消静音
        if (e.code === 'KeyM' && e.target === document.body) {
            e.preventDefault();
            this.toggleMute();
        }
        
        // 上下箭头：音量控制
        if (e.code === 'ArrowUp' && e.target === document.body) {
            e.preventDefault();
            this.setVolume(this.volume + 0.1);
        }
        
        if (e.code === 'ArrowDown' && e.target === document.body) {
            e.preventDefault();
            this.setVolume(this.volume - 0.1);
        }
    }
    
    loadSettings() {
        const savedVolume = localStorage.getItem('musicVolume');
        const savedMuted = localStorage.getItem('musicMuted');
        
        if (savedVolume !== null) {
            this.volume = parseFloat(savedVolume);
        }
        
        if (savedMuted !== null) {
            this.isMuted = savedMuted === 'true';
        }
        
        this.audio.volume = this.isMuted ? 0 : this.volume;
        this.updateVolumeUI();
        this.updateMuteUI();
    }
    
    saveSettings() {
        localStorage.setItem('musicVolume', this.volume.toString());
        localStorage.setItem('musicMuted', this.isMuted.toString());
    }
    
    // 公共方法：外部调用
    getStatus() {
        return {
            isPlaying: this.isPlaying,
            isMuted: this.isMuted,
            volume: this.volume,
            currentTime: this.audio.currentTime,
            duration: this.audio.duration
        };
    }
    
    setAudioSource(src) {
        this.audio.src = src;
        this.audio.load();
    }
    
    seekTo(time) {
        if (time >= 0 && time <= this.audio.duration) {
            this.audio.currentTime = time;
        }
    }
}

// 页面加载完成后初始化音乐播放器
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
    
    // 自动播放（需要用户交互）
    document.addEventListener('click', () => {
        if (window.musicPlayer && !window.musicPlayer.isPlaying) {
            // 延迟自动播放，避免干扰用户
            setTimeout(() => {
                if (!window.musicPlayer.isPlaying) {
                    window.musicPlayer.play();
                }
            }, 1000);
        }
    }, { once: true });
});


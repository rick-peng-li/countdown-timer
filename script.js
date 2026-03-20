/**
 * 倒计时计时器 - 主逻辑
 * 功能：支持实时每秒倒计时、数字翻牌动画、Toast 提示
 */

class CountdownTimer {
    constructor() {
        this.totalSeconds = 0;
        this.remainingSeconds = 0;
        this.intervalId = null;
        this.isRunning = false;
        this.isPaused = false;

        // 缓存 DOM 元素
        this.elements = {
            hoursInput: document.getElementById('hours'),
            minutesInput: document.getElementById('minutes'),
            secondsInput: document.getElementById('seconds'),
            displayHours: document.getElementById('display-hours'),
            displayHoursBack: document.getElementById('display-hours-back'),
            displayMinutes: document.getElementById('display-minutes'),
            displayMinutesBack: document.getElementById('display-minutes-back'),
            displaySeconds: document.getElementById('display-seconds'),
            displaySecondsBack: document.getElementById('display-seconds-back'),
            hoursCard: document.getElementById('hours-card'),
            minutesCard: document.getElementById('minutes-card'),
            secondsCard: document.getElementById('seconds-card'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            toastContainer: document.getElementById('toast-container')
        };

        this.previousTime = { hours: 0, minutes: 0, seconds: 0 };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay(0);
    }

    bindEvents() {
        // 开始按钮
        this.elements.startBtn.addEventListener('click', () => this.start());

        // 暂停按钮
        this.elements.pauseBtn.addEventListener('click', () => this.pause());

        // 重置按钮
        this.elements.resetBtn.addEventListener('click', () => this.reset());

        // 快速设置按钮
        document.querySelectorAll('.btn-small').forEach(btn => {
            btn.addEventListener('click', (e) => this.quickSet(parseInt(e.target.dataset.time)));
        });

        // 输入框限制
        [this.elements.hoursInput, this.elements.minutesInput, this.elements.secondsInput].forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
            input.addEventListener('change', () => {
                if (!this.isRunning && !this.isPaused) {
                    this.updateFromInputs();
                }
            });
        });
    }

    validateInput(input) {
        let value = parseInt(input.value) || 0;
        const max = parseInt(input.max);
        const min = parseInt(input.min);

        if (value > max) input.value = max;
        if (value < min) input.value = min;
    }

    updateFromInputs() {
        const hours = parseInt(this.elements.hoursInput.value) || 0;
        const minutes = parseInt(this.elements.minutesInput.value) || 0;
        const seconds = parseInt(this.elements.secondsInput.value) || 0;

        this.totalSeconds = hours * 3600 + minutes * 60 + seconds;
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay(this.remainingSeconds);
    }

    quickSet(seconds) {
        if (this.isRunning) {
            this.showToast('请先暂停或重置当前计时器', 'warning');
            return;
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        this.elements.hoursInput.value = hours;
        this.elements.minutesInput.value = minutes;
        this.elements.secondsInput.value = secs;

        this.totalSeconds = seconds;
        this.remainingSeconds = seconds;
        this.updateDisplay(seconds);

        this.showToast(`已设置为 ${this.formatTimeText(seconds)}`, 'info');
    }

    formatTimeText(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours}小时`);
        if (minutes > 0) parts.push(`${minutes}分钟`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}秒`);

        return parts.join('');
    }

    start() {
        if (this.isRunning) return;

        if (!this.isPaused) {
            this.updateFromInputs();
        }

        if (this.remainingSeconds <= 0) {
            this.showToast('请设置有效的时间', 'error');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;

        // 更新按钮状态
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;

        // 禁用输入框
        this.setInputsDisabled(true);

        this.showToast('倒计时开始！', 'success');

        // 记录当前时间用于翻牌动画
        this.previousTime = this.getTimeParts(this.remainingSeconds);

        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.isPaused = true;

        clearInterval(this.intervalId);

        // 更新按钮状态
        this.elements.startBtn.disabled = false;
        this.elements.startBtn.innerHTML = '<span class="btn-icon">▶</span><span>继续</span>';
        this.elements.pauseBtn.disabled = true;

        this.showToast('倒计时已暂停', 'warning');
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;

        clearInterval(this.intervalId);

        // 重置按钮状态
        this.elements.startBtn.disabled = false;
        this.elements.startBtn.innerHTML = '<span class="btn-icon">▶</span><span>开始</span>';
        this.elements.pauseBtn.disabled = true;

        // 启用输入框
        this.setInputsDisabled(false);

        // 移除完成样式
        document.querySelectorAll('.flip-card').forEach(card => {
            card.classList.remove('completed');
        });

        this.updateFromInputs();

        if (this.remainingSeconds > 0) {
            this.showToast('倒计时已重置', 'info');
        }
    }

    tick() {
        if (this.remainingSeconds > 0) {
            this.remainingSeconds--;
            this.updateDisplay(this.remainingSeconds);

            if (this.remainingSeconds === 0) {
                this.complete();
            }
        }
    }

    complete() {
        this.isRunning = false;
        clearInterval(this.intervalId);

        // 更新按钮状态
        this.elements.startBtn.disabled = false;
        this.elements.startBtn.innerHTML = '<span class="btn-icon">▶</span><span>开始</span>';
        this.elements.pauseBtn.disabled = true;

        // 启用输入框
        this.setInputsDisabled(false);

        // 添加完成动画
        document.querySelectorAll('.flip-card').forEach(card => {
            card.classList.add('completed');
        });

        this.showToast('⏰ 倒计时结束！', 'success');

        // 播放提示音（如果浏览器支持）
        this.playNotificationSound();
    }

    playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            // 浏览器不支持音频 API，静默处理
        }
    }

    setInputsDisabled(disabled) {
        this.elements.hoursInput.disabled = disabled;
        this.elements.minutesInput.disabled = disabled;
        this.elements.secondsInput.disabled = disabled;
    }

    getTimeParts(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { hours, minutes, seconds };
    }

    updateDisplay(totalSeconds) {
        const { hours, minutes, seconds } = this.getTimeParts(totalSeconds);

        // 更新显示（带翻牌动画）
        this.updateFlipCard('hours', hours, this.previousTime.hours);
        this.updateFlipCard('minutes', minutes, this.previousTime.minutes);
        this.updateFlipCard('seconds', seconds, this.previousTime.seconds);

        // 更新进度条
        this.updateProgress(totalSeconds);

        // 记录当前时间
        this.previousTime = { hours, minutes, seconds };
    }

    updateFlipCard(type, newValue, oldValue) {
        const display = this.elements[`display${type.charAt(0).toUpperCase() + type.slice(1)}`];
        const displayBack = this.elements[`display${type.charAt(0).toUpperCase() + type.slice(1)}Back`];
        const card = this.elements[`${type}Card`];

        const formattedValue = String(newValue).padStart(2, '0');
        const formattedOldValue = String(oldValue).padStart(2, '0');

        if (newValue !== oldValue) {
            // 正面显示旧值，背面显示新值
            // 这样翻转时从正面(旧值)翻到背面(新值)
            display.textContent = formattedOldValue;
            displayBack.textContent = formattedValue;

            // 触发翻牌动画
            card.classList.remove('flipping');
            void card.offsetWidth; // 强制重绘
            card.classList.add('flipping');

            // 动画结束后，将正面更新为新值，准备下一次翻转
            setTimeout(() => {
                display.textContent = formattedValue;
                card.classList.remove('flipping');
            }, 600);
        } else {
            display.textContent = formattedValue;
            displayBack.textContent = formattedValue;
        }
    }

    updateProgress(remaining) {
        if (this.totalSeconds === 0) {
            this.elements.progressFill.style.width = '0%';
            this.elements.progressText.textContent = '0%';
            return;
        }

        const progress = ((this.totalSeconds - remaining) / this.totalSeconds) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = `${Math.round(progress)}%`;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = {
            success: '✓',
            warning: '⚠',
            error: '✕',
            info: 'ℹ'
        }[type];

        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

        this.elements.toastContainer.appendChild(toast);

        // 3秒后自动移除
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new CountdownTimer();
});

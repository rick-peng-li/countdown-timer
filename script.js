class CountdownTimer {
    constructor() {
        this.totalSeconds = 0;
        this.remainingSeconds = 0;
        this.intervalId = null;
        this.isRunning = false;
        this.isPaused = false;
        this.previousValues = { hours: '00', minutes: '00', seconds: '00' };

        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.hoursInput = document.getElementById('hours');
        this.minutesInput = document.getElementById('minutes');
        this.secondsInput = document.getElementById('seconds');

        this.displayHours = document.getElementById('display-hours');
        this.displayMinutes = document.getElementById('display-minutes');
        this.displaySeconds = document.getElementById('display-seconds');

        this.displayHoursBack = document.getElementById('display-hours-back');
        this.displayMinutesBack = document.getElementById('display-minutes-back');
        this.displaySecondsBack = document.getElementById('display-seconds-back');

        this.cardHours = document.getElementById('card-hours');
        this.cardMinutes = document.getElementById('card-minutes');
        this.cardSeconds = document.getElementById('card-seconds');

        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');

        this.toastContainer = document.getElementById('toast-container');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());

        document.querySelectorAll('.btn-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const seconds = parseInt(e.target.dataset.time);
                this.setPresetTime(seconds);
            });
        });

        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
            input.addEventListener('change', () => this.updateDisplay());
        });
    }

    validateInput(input) {
        let value = parseInt(input.value) || 0;
        const max = parseInt(input.max);
        const min = parseInt(input.min);

        if (value > max) value = max;
        if (value < min) value = min;

        input.value = value;
    }

    getInputSeconds() {
        const hours = parseInt(this.hoursInput.value) || 0;
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;

        return hours * 3600 + minutes * 60 + seconds;
    }

    setPresetTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        this.hoursInput.value = hours;
        this.minutesInput.value = minutes;
        this.secondsInput.value = seconds;

        this.updateDisplay();
        this.showToast(`已设置 ${minutes > 0 ? minutes + '分钟' : ''} ${seconds > 0 ? seconds + '秒' : ''}`, 'info');
    }

    formatNumber(num) {
        return num.toString().padStart(2, '0');
    }

    updateDisplay(animate = false) {
        const hours = Math.floor(this.remainingSeconds / 3600);
        const minutes = Math.floor((this.remainingSeconds % 3600) / 60);
        const seconds = this.remainingSeconds % 60;

        const newHours = this.formatNumber(hours);
        const newMinutes = this.formatNumber(minutes);
        const newSeconds = this.formatNumber(seconds);

        if (animate) {
            if (this.previousValues.hours !== newHours) {
                this.flipCard('hours', newHours);
            }
            if (this.previousValues.minutes !== newMinutes) {
                this.flipCard('minutes', newMinutes);
            }
            if (this.previousValues.seconds !== newSeconds) {
                this.flipCard('seconds', newSeconds);
            }
        } else {
            this.displayHours.textContent = newHours;
            this.displayHoursBack.textContent = newHours;
            this.displayMinutes.textContent = newMinutes;
            this.displayMinutesBack.textContent = newMinutes;
            this.displaySeconds.textContent = newSeconds;
            this.displaySecondsBack.textContent = newSeconds;
        }

        this.previousValues = { hours: newHours, minutes: newMinutes, seconds: newSeconds };
    }

    flipCard(type, newValue) {
        const card = this[`card${type.charAt(0).toUpperCase() + type.slice(1)}`];
        const displayFront = this[`display${type.charAt(0).toUpperCase() + type.slice(1)}`];
        const displayBack = this[`display${type.charAt(0).toUpperCase() + type.slice(1)}Back`];

        displayBack.textContent = newValue;

        card.classList.add('flipped');

        setTimeout(() => {
            const cardInner = card.querySelector('.card-inner');
            cardInner.style.transition = 'none';
            displayFront.textContent = newValue;
            card.classList.remove('flipped');
            
            setTimeout(() => {
                cardInner.style.transition = '';
            }, 50);
        }, 600);
    }

    start() {
        if (this.isRunning && !this.isPaused) {
            return;
        }

        if (!this.isPaused) {
            this.totalSeconds = this.getInputSeconds();
            this.remainingSeconds = this.totalSeconds;

            if (this.totalSeconds === 0) {
                this.showToast('请设置倒计时时间', 'warning');
                return;
            }
        }

        this.isRunning = true;
        this.isPaused = false;

        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.disableInputs(true);

        this.showToast('倒计时开始', 'success');

        this.intervalId = setInterval(() => {
            this.remainingSeconds--;
            this.updateDisplay(true);

            if (this.remainingSeconds <= 0) {
                this.complete();
            }
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;

        clearInterval(this.intervalId);
        this.isPaused = true;
        this.isRunning = false;

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;

        this.showToast('倒计时已暂停', 'warning');
    }

    reset() {
        clearInterval(this.intervalId);
        this.isRunning = false;
        this.isPaused = false;
        this.remainingSeconds = 0;
        this.totalSeconds = 0;

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.disableInputs(false);

        this.hoursInput.value = 0;
        this.minutesInput.value = 5;
        this.secondsInput.value = 0;

        this.updateDisplay();
        this.showToast('已重置', 'info');
    }

    complete() {
        clearInterval(this.intervalId);
        this.isRunning = false;
        this.isPaused = false;

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.disableInputs(false);

        this.showToast('倒计时结束！', 'success');

        this.playSound();
    }

    disableInputs(disabled) {
        this.hoursInput.disabled = disabled;
        this.minutesInput.disabled = disabled;
        this.secondsInput.disabled = disabled;

        document.querySelectorAll('.btn-preset').forEach(btn => {
            btn.disabled = disabled;
        });
    }

    playSound() {
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

        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 1000;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.5);
        }, 200);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '✓',
            warning: '⚠',
            info: 'ℹ',
            error: '✕'
        };

        toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CountdownTimer();
});

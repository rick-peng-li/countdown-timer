let countdownInterval = null;
let remainingTime = 60;
let isRunning = false;

const countdownInput = document.getElementById('countdown-input');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const statusText = document.getElementById('status-text');

const hoursCard = document.getElementById('hours-card');
const minutesCard = document.getElementById('minutes-card');
const secondsCard = document.getElementById('seconds-card');

// Toast 提示函数
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.appendChild(toast);
    
    document.body.appendChild(container);
    
    // 触发动画
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 3秒后移除
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(container);
        }, 300);
    }, 3000);
}

// 成功提示
function showSuccess(message) {
    showToast(message, 'success');
}

// 错误提示
function showError(message) {
    showToast(message, 'error');
}

// 信息提示
function showInfo(message) {
    showToast(message, 'info');
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
        hours: String(hrs).padStart(2, '0'),
        minutes: String(mins).padStart(2, '0'),
        seconds: String(secs).padStart(2, '0')
    };
}

function updateDisplay(time, animate = true) {
    const { hours, minutes, seconds } = formatTime(time);
    
    updateCard(hoursCard, hours, animate);
    updateCard(minutesCard, minutes, animate);
    updateCard(secondsCard, seconds, animate);
}

function updateCard(cardElement, newValue, animate = true) {
    const front = cardElement.querySelector('.flip-card-front');
    const back = cardElement.querySelector('.flip-card-back');
    const currentValue = front.textContent;
    
    if (currentValue !== newValue) {
        if (animate) {
            back.textContent = newValue;
            cardElement.parentElement.classList.add('flipping');
            
            setTimeout(() => {
                front.textContent = newValue;
                cardElement.parentElement.classList.remove('flipping');
                back.textContent = currentValue;
            }, 600);
        } else {
            front.textContent = newValue;
            back.textContent = newValue;
        }
    }
}

function startCountdown() {
    if (isRunning) return;
    
    const inputValue = parseInt(countdownInput.value);
    if (isNaN(inputValue) || inputValue < 1 || inputValue > 3600) {
        showError('请输入有效的倒计时时间（1-3600秒）');
        return;
    }
    
    if (remainingTime === 0) {
        remainingTime = inputValue;
    }
    
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    countdownInput.disabled = true;
    
    statusText.textContent = '倒计时进行中...';
    showSuccess('倒计时开始！');
    
    countdownInterval = setInterval(() => {
        remainingTime--;
        updateDisplay(remainingTime);
        
        if (remainingTime <= 0) {
            stopCountdown();
            statusText.textContent = '倒计时结束！';
            showSuccess('倒计时结束！您设置的倒计时已完成！');
        }
    }, 1000);
}

function pauseCountdown() {
    if (!isRunning) return;
    
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.textContent = '继续';
    
    clearInterval(countdownInterval);
    statusText.textContent = '倒计时已暂停';
    showInfo('倒计时已暂停');
}

function stopCountdown() {
    isRunning = false;
    clearInterval(countdownInterval);
    countdownInterval = null;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    countdownInput.disabled = false;
    startBtn.textContent = '开始倒计时';
}

function resetCountdown() {
    stopCountdown();
    remainingTime = parseInt(countdownInput.value) || 60;
    updateDisplay(remainingTime, false);
    statusText.textContent = '准备开始倒计时';
    showInfo('倒计时已重置');
}

startBtn.addEventListener('click', startCountdown);
pauseBtn.addEventListener('click', pauseCountdown);
resetBtn.addEventListener('click', resetCountdown);

countdownInput.addEventListener('change', () => {
    const value = parseInt(countdownInput.value);
    if (!isNaN(value) && value >= 1 && value <= 3600) {
        remainingTime = value;
        updateDisplay(remainingTime, false);
    }
});

updateDisplay(remainingTime, false);
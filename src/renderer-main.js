import { Timer } from "./timer.js";
import { TIMER_CONFIG } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {

  const timeNowEl = document.getElementById("current-time");
  const timerValueEl = document.querySelector(".timer-remaining-value");
  const progressBar = document.getElementById("progressBar");
  const startBtn = document.getElementById("startBtn");
  const clearBtn = document.getElementById("clearBtn");
  const mainCloseBtn = document.getElementById("mainCloseBtn");

  // 現在時刻
  function updateCurrentTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    timeNowEl.textContent = `${hh}:${mm}`;
  }
  setInterval(updateCurrentTime, 1000);
  updateCurrentTime();

  // Timer
  const timer = new Timer(updateUI, finishTimer);

  function updateUI(remaining, total) {
    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    timerValueEl.textContent = `${m}:${s}`;

    const percent = (remaining / total) * 100;
    progressBar.style.width = percent + "%";
  }

  function finishTimer() {
    document.querySelector(".timer-circle").classList.add("flash");
    const audio = new Audio(TIMER_CONFIG.alarmSound);
    audio.play();
  }

// 設定画面を開く（円の中心座標を渡す）
timerValueEl.addEventListener("click", () => {
  const circle = document.querySelector(".timer-circle");
  const rect = circle.getBoundingClientRect();

  // 円の中心（画面上の絶対座標）
  const centerX = window.screenX + rect.left + rect.width / 2;
  const centerY = window.screenY + rect.top + rect.height / 2;

  window.mainAPI.openSettingsAt(centerX, centerY);
});

timerValueEl.addEventListener("click", () => {
    window.mainAPI.openSettings();
  });

// ★ カウントアップ用の変数
let mode = "down";      // "down" or "up"
let elapsed = 0;        // カウントアップ用
let countUpTimer = null;

// ★ カウントアップの表示更新
function updateDisplay(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  timerValueEl.textContent = `${m}:${s}`;
}

function startCountUp() {
  countUpTimer = setInterval(() => {

    // 上限 999:59（59,999秒）
    if (elapsed >= 59999) {
      stopCountUp(true);
      return;
    }

    elapsed++;
    updateDisplay(elapsed);

  }, 1000);
}

function stopCountUp(fullStop = false) {
  clearInterval(countUpTimer);
  countUpTimer = null;

  if (fullStop) {
    // 完全停止 → アプリ起動時の状態に戻す
    mode = "down";
    elapsed = 0;
    updateDisplay(0);
    progressBar.style.width = "100%"; // 細い線のまま
    startBtn.textContent = "スタート";
  }
}

startBtn.addEventListener("click", () => {

  if (mode === "down") {
    // ★ カウントダウン
    if (timer.interval) {
      timer.stop();
      startBtn.textContent = "スタート";
    } else {
      timer.start();
      startBtn.textContent = "一時停止";
      document.querySelector(".timer-circle").classList.remove("flash");
    }

  } else {
    // ★ カウントアップ
    if (countUpTimer) {
      stopCountUp(); // 一時停止
      startBtn.textContent = "スタート";
    } else {
      startCountUp();
      startBtn.textContent = "一時停止";
    }
  }
});
// ★ 一時停止状態でダブルクリック → 完全停止
startBtn.addEventListener("dblclick", () => {
  // カウントアップモード かつ 一時停止状態（＝countUpTimer が null）
  if (mode === "up" && countUpTimer === null) {
    stopCountUp(true);
  }
});
 // ★ シングルクリック → カウントダウン用リセット
clearBtn.addEventListener("click", () => {
  stopCountUp(true); // カウントアップ中なら完全停止
  mode = "down";
  timer.reset();
  startBtn.textContent = "スタート";
  document.querySelector(".timer-circle").classList.remove("flash");
});
// ★ ダブルクリック → カウントアップモードへ
clearBtn.addEventListener("dblclick", () => {
  mode = "up";
  elapsed = 0;
  updateDisplay(0);

  // バーは細い線のまま（非アニメーション）
  progressBar.style.width = "100%";

  startBtn.textContent = "スタート";
});


  // 設定画面からの反映
  window.mainAPI.onApplyTime((data) => {
    timer.set(data.minutes, data.seconds);

    timerValueEl.textContent =
      `${String(data.minutes).padStart(2, "0")}:${String(data.seconds).padStart(2, "0")}`;

    document.querySelector(".timer-circle").classList.remove("flash");
  });

  // ★ メイン画面の × ボタン
  mainCloseBtn.addEventListener("click", () => {
    window.mainAPI.closeApp();
  });

    // ★ 円全体でウィンドウをドラッグする（自前ドラッグ）

  const timerCircle = document.querySelector(".timer-circle");

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;

  timerCircle.addEventListener("mousedown", (e) => {
    // 左クリックのみ
    if (e.button !== 0) return;

    // ★ × ボタンを押したときはドラッグしない
    if (e.target === mainCloseBtn || e.target.closest('#mainCloseBtn')) {
      return;
    }

    isDragging = true;
    dragStartX = e.screenX;
    dragStartY = e.screenY;

    window.mainAPI.startDrag(dragStartX, dragStartY);
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    window.mainAPI.updateDrag(e.screenX, e.screenY);
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;

    isDragging = false;
    window.mainAPI.endDrag();
  });


// 現在の縮尺
let currentScale = 1.0;

// Ctrl + ホイールでサイズ変更
window.addEventListener("wheel", (e) => {
  if (!e.ctrlKey) return;

  e.preventDefault();

  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  currentScale = Math.min(2.0, Math.max(0.4, currentScale + delta));

  window.mainAPI.changeScale(currentScale);
});

// 右クリックでサイズパネル表示
window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  sizePanel.classList.toggle("hidden");
});

// range スライダー
const sizePanel = document.getElementById("sizePanel");
const sizeRange = document.getElementById("sizeRange");

sizeRange.addEventListener("input", () => {
  currentScale = parseFloat(sizeRange.value);
  window.mainAPI.changeScale(currentScale);
});


});
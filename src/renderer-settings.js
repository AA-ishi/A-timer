window.addEventListener("DOMContentLoaded", () => {
  const applyBtn = document.getElementById("applyBtn");
  const minutesInput = document.getElementById("minutes");
  const secondsInput = document.getElementById("seconds");
  const closeBtn = document.getElementById("closeBtn");
  closeBtn.addEventListener("click", () => {
    window.settingsAPI.close();
  });

  applyBtn.addEventListener("click", () => {
    const m = Number(minutesInput.value || 0);
    const s = Number(secondsInput.value || 0);

    // preload-settings.js の API を使う
    window.settingsAPI.setTimer({ minutes: m, seconds: s });

    // 設定ウィンドウを閉じる
    window.settingsAPI.close();
  });
});
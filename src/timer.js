export class Timer {
  constructor(updateUI, finishTimer) {
    this.updateUI = updateUI;       // UI更新関数（renderer.js から渡される）
    this.finishTimer = finishTimer; // 終了時の処理（renderer.js から渡される）

    this.total = 0;       // セットされた合計秒数
    this.remaining = 0;   // 残り秒数
    this.interval = null; // setInterval のID
  }

  // 分と秒をセット
  set(minutes, seconds) {
    const total = minutes * 60 + seconds;

    if (isNaN(total) || total <= 0) {
      alert("正しい時間を入力してください");
      return;
    }

    this.total = total;
    this.remaining = total;

    this.updateUI(this.remaining, this.total);
  }

  // スタート
  start() {
    if (this.interval || this.remaining <= 0) return;

    this.interval = setInterval(() => {
      this.remaining--;

      this.updateUI(this.remaining, this.total);

      if (this.remaining <= 0) {
        this.stop();
        this.finishTimer(); // 終了時の処理（音・キラキラ）
      }
    }, 1000);
  }

  // 一時停止
  stop() {
    clearInterval(this.interval);
    this.interval = null;
  }

  // リセット（初期値に戻す）
  reset() {
    this.stop();
    this.remaining = this.total;
    this.updateUI(this.remaining, this.total);
  }
}
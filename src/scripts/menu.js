// ハンバーガーボタンでモバイル用ナビゲーションの表示状態を切り替える。
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".nav-links").classList.toggle("expanded");
});

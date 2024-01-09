const checkToggle = document.getElementById('js_mode_toggle');
const rotateIcon = document.getElementById('js_rotate');
const keyLocalStorage = 'whike-theme-mode';

const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const localTheme = localStorage.getItem(keyLocalStorage);

let nowRotate = 0;

// ローカルストレージの中身と、端末がライトモードかどうか（ie,edgeには無意味）をチェック
if(isLight) {
  changeMode('light');
} else if(localTheme === 'light') {
  changeMode('light');
} else {
  changeMode('dark');
}

// チェックボックスでの切り替え、選択をローカルストレージに保存
checkToggle.addEventListener('change', function(e) {
  if(e.target.checked) {
    changeMode('light');
    localStorage.setItem(keyLocalStorage,'light');
  } else {
    changeMode('dark');
    localStorage.setItem(keyLocalStorage,'dark');
  }
});

/**
 * ダークorライトテーマ切り替え
 * @param {String} mode 'light' もしくは 'dark'
 */
function changeMode(mode) {
  if(mode === 'light') {
    changeIcon('light');
    document.body.setAttribute('data-theme', 'light');
    checkToggle.checked = true;
  } else if(mode === 'dark') {
    changeIcon('dark');
    document.body.setAttribute('data-theme', 'dark');
    checkToggle.checked = false;
  }
}

function changeIcon(mode) {
  if(mode === 'light') {
    rotateIcon.innerText = '🌄';
  } else if(mode === 'dark') {
    rotateIcon.innerText = '🌙';
  }
}

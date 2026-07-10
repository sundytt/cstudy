/*
 * 公共导航组件 QNav
 * 用法：
 *   1. 在页面 body 中放置一个容器 <div id="qnav"></div>
 *   2. 引入本脚本 <script src="nav.js"></script>
 *   3. 调用 QNav.init('页面key') 渲染导航
 * 在小屏设备（如 iPhone 15）上，顶部只显示当前模块的紧凑胶囊按钮，
 * 点击后从底部弹出全部模块的网格面板，方便切换，避免横向 tab 挤成一排。
 */
(function () {
  var ITEMS = [
    { key: 'chinese', href: 'chinese.html', icon: '📝', label: '汉字学习' },
    { key: 'pinyin', href: 'pinyin.html', icon: '🈶', label: '拼音学习' },
    { key: 'idiom', href: 'idiom.html', icon: '🏮', label: '成语学习' },
    { key: 'english', href: 'english.html', icon: '🔤', label: '单词学习' },
    { key: 'phonics', href: 'phonics.html', icon: '🔠', label: '自然拼读' },
    { key: 'math_vocab', href: 'math_vocab.html', icon: '🔢', label: '数字词汇' },
    { key: 'math_addition', href: 'math_addition.html', icon: '➕', label: '加法思路' },
    { key: 'math_subtraction', href: 'math_subtraction.html', icon: '➖', label: '减法思路' },
    { key: 'game', href: 'game.html', icon: '🎮', label: '趣味游戏' }
  ];

  var STYLE = ''
    + '#qnav{margin-bottom:1rem;font-family:inherit;}'
    + '.qnav-bar{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:8px 10px;box-shadow:0 1px 3px rgba(0,0,0,0.06);}'
    + '.qnav-home{flex-shrink:0;width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:#F3F4F6;text-decoration:none;font-size:18px;}'
    + '.qnav-current{flex:1;display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 12px;border-radius:10px;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;border:none;min-width:0;}'
    + '.qnav-current-icon{font-size:18px;flex-shrink:0;}'
    + '.qnav-current-label{font-weight:600;font-size:15px;flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'
    + '.qnav-caret{font-size:12px;opacity:.85;flex-shrink:0;transition:transform .2s ease;}'
    + '.qnav-current.open .qnav-caret{transform:rotate(180deg);}'
    + '.qnav-count{flex-shrink:0;font-size:12px;color:#9CA3AF;white-space:nowrap;}'
    + '@media (max-width:480px){.qnav-count{display:none;}}'
    + '.qnav-overlay{position:fixed;inset:0;background:rgba(17,24,39,0.45);opacity:0;visibility:hidden;transition:opacity .25s ease;z-index:999;}'
    + '.qnav-overlay.show{opacity:1;visibility:visible;}'
    + '.qnav-sheet{position:fixed;left:0;right:0;bottom:0;background:#fff;border-radius:20px 20px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom));transform:translateY(100%);transition:transform .3s ease;z-index:1000;max-height:80vh;overflow-y:auto;box-shadow:0 -8px 30px rgba(0,0,0,0.15);}'
    + '.qnav-sheet.show{transform:translateY(0);}'
    + '.qnav-sheet-header{display:flex;align-items:center;justify-content:space-between;font-size:15px;font-weight:700;color:#1F2937;margin-bottom:12px;}'
    + '.qnav-close{border:none;background:#F3F4F6;width:28px;height:28px;border-radius:8px;font-size:14px;cursor:pointer;color:#6B7280;}'
    + '.qnav-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}'
    + '.qnav-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:14px 6px;border-radius:14px;background:#F9FAFB;border:2px solid transparent;cursor:pointer;transition:all .15s ease;text-align:center;}'
    + '.qnav-card:active{transform:scale(0.96);}'
    + '.qnav-card-icon{font-size:26px;}'
    + '.qnav-card-label{font-size:12.5px;font-weight:600;color:#374151;}'
    + '.qnav-card.active{background:linear-gradient(135deg,#EEF2FF,#F5F3FF);border-color:#8B5CF6;}'
    + '.qnav-card.active .qnav-card-label{color:#6366F1;}'
    + '@media (max-width:380px){.qnav-grid{gap:8px;}.qnav-card{padding:12px 4px;}.qnav-card-icon{font-size:22px;}.qnav-card-label{font-size:11px;}}';

  function injectStyle() {
    if (document.getElementById('qnav-style')) return;
    var s = document.createElement('style');
    s.id = 'qnav-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function buildHTML(activeKey) {
    var active = null;
    for (var i = 0; i < ITEMS.length; i++) { if (ITEMS[i].key === activeKey) { active = ITEMS[i]; break; } }
    if (!active) active = ITEMS[0];

    var cards = ITEMS.map(function (it) {
      var isActive = it.key === activeKey;
      var cls = 'qnav-card' + (isActive ? ' active' : '');
      var attr = isActive ? '' : ' onclick="window.location.href=\'' + it.href + '\'"';
      return '<div class="' + cls + '"' + attr + '>'
        + '<span class="qnav-card-icon">' + it.icon + '</span>'
        + '<span class="qnav-card-label">' + it.label + '</span>'
        + '</div>';
    }).join('');

    return ''
      + '<div class="qnav-bar">'
      +   '<a class="qnav-home" href="index.html" title="返回首页">🏠</a>'
      +   '<button type="button" class="qnav-current" id="qnavToggle">'
      +     '<span class="qnav-current-icon">' + active.icon + '</span>'
      +     '<span class="qnav-current-label">' + active.label + '</span>'
      +     '<span class="qnav-caret">▾</span>'
      +   '</button>'
      +   '<span class="qnav-count">共' + ITEMS.length + '个模块</span>'
      + '</div>'
      + '<div class="qnav-overlay" id="qnavOverlay"></div>'
      + '<div class="qnav-sheet" id="qnavSheet">'
      +   '<div class="qnav-sheet-header">'
      +     '<span>选择学习模块</span>'
      +     '<button type="button" class="qnav-close" id="qnavClose">✕</button>'
      +   '</div>'
      +   '<div class="qnav-grid">' + cards + '</div>'
      + '</div>';
  }

  function init(activeKey) {
    injectStyle();
    var root = document.getElementById('qnav');
    if (!root) return;
    root.innerHTML = buildHTML(activeKey);

    var toggle = document.getElementById('qnavToggle');
    var overlay = document.getElementById('qnavOverlay');
    var sheet = document.getElementById('qnavSheet');
    var closeBtn = document.getElementById('qnavClose');

    function open() {
      overlay.classList.add('show');
      sheet.classList.add('show');
      toggle.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('show');
      sheet.classList.remove('show');
      toggle.classList.remove('open');
      document.body.style.overflow = '';
    }
    toggle.addEventListener('click', function () {
      if (sheet.classList.contains('show')) close(); else open();
    });
    overlay.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  window.QNav = { init: init, ITEMS: ITEMS };
})();

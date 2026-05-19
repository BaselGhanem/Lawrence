/**
 * Lawrence For PC — Shared Scripts
 * يحتوي على: Theme · Toast · Modal · Sidebar · Barcode Scanner · Print Receipt
 */

/* ═══════════════════════════════════════════════════════════════
   1. THEME
   ═══════════════════════════════════════════════════════════════ */

// تطبيق الثيم فوراً قبل رسم الصفحة
(function initTheme() {
  const t = localStorage.getItem('lpc_theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();

window.toggleTheme = function () {
  const curr = document.documentElement.getAttribute('data-theme');
  const next = curr === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('lpc_theme', next);
  _updateThemeBtn(next);
};

function _updateThemeBtn(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

document.addEventListener('DOMContentLoaded', function () {
  _updateThemeBtn(localStorage.getItem('lpc_theme') || 'light');
});

/* ═══════════════════════════════════════════════════════════════
   2. TOAST
   ═══════════════════════════════════════════════════════════════ */

window.toast = function (msg, duration) {
  duration = duration || 3000;
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(function () { el.classList.remove('show'); }, duration);
};

/* ═══════════════════════════════════════════════════════════════
   3. MODAL  (X-only — no outside-click close)
   ═══════════════════════════════════════════════════════════════ */

window.openModal = function (id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
};

window.closeModal = function (id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
};

/* ═══════════════════════════════════════════════════════════════
   4. SIDEBAR (used by all pages except index & customer)
   ═══════════════════════════════════════════════════════════════ */

const LOGO_URL = 'https://raw.githubusercontent.com/BaselGhanem/Lawrence/refs/heads/main/logo.jpg';

const NAV_LINKS = [
  { key: 'admin',      href: 'admin.html',      icon: '🏠', label: 'لوحة الإدارة',    adminOnly: true  },
  { key: 'inventory',  href: 'inventory.html',  icon: '📦', label: 'المخزون',          adminOnly: false },
  { key: 'sales',      href: 'sales.html',      icon: '🛒', label: 'المبيعات',         adminOnly: false },
  { key: 'returns',    href: 'returns.html',    icon: '↩️', label: 'المرتجعات',        adminOnly: false },
  { key: 'reports',    href: 'reports.html',    icon: '📊', label: 'التقارير',         adminOnly: true  },
  { key: 'customer',   href: 'customer.html',   icon: '🔍', label: 'بوابة العملاء',    adminOnly: false, target: '_blank' },
];

/**
 * يرسم السايدبار في #app-sidebar
 * @param {string} activePage  - مفتاح الصفحة النشطة (مثل: 'inventory')
 * @param {object} [sections]  - اختياري، للصفحات التي تعرض sections داخلية
 */
window.renderSidebar = function (activePage, sections) {
  const container = document.getElementById('app-sidebar');
  if (!container) return;

  const user    = JSON.parse(sessionStorage.getItem('lpc_user') || 'null');
  const isAdmin = user && user.role === 'admin';
  const theme   = localStorage.getItem('lpc_theme') || 'light';

  // بناء روابط التنقل
  const linksHtml = NAV_LINKS
    .filter(function (l) { return !l.adminOnly || isAdmin; })
    .map(function (l) {
      const isActive = l.key === activePage;
      const target   = l.target ? ' target="' + l.target + '"' : '';
      return '<a class="nav-item' + (isActive ? ' active' : '') + '" href="' + l.href + '"' + target + '>'
           + '<span class="ni">' + l.icon + '</span> ' + l.label
           + '</a>';
    })
    .join('');

  // sections داخلية (للصفحات المركبة مثل admin)
  let sectionsHtml = '';
  if (sections && sections.length) {
    sectionsHtml = '<div class="nav-section" style="margin-top:12px">إدارة</div>';
    sectionsHtml += sections.map(function (s) {
      const isActive = s.key === activePage;
      return '<div class="nav-item' + (isActive ? ' active' : '') + '" onclick="showSection(\'' + s.key + '\',this)">'
           + '<span class="ni">' + s.icon + '</span> ' + s.label + '</div>';
    }).join('');
  }

  const roleLabel = isAdmin ? 'مدير النظام' : 'فني صيانة';
  const avatar    = isAdmin ? '👑' : '🔧';

  container.innerHTML =
    '<div class="sidebar">' +
      '<div class="sb-brand">' +
        '<div class="sb-icon"><img src="' + LOGO_URL + '" onerror="this.parentElement.textContent=\'💻\'"></div>' +
        '<div class="sb-info"><h2>Lawrence For PC</h2><p>نظام الإدارة</p></div>' +
        '<button class="theme-btn" id="themeToggle" onclick="toggleTheme()" title="تبديل المظهر">' +
          (theme === 'dark' ? '☀️' : '🌙') +
        '</button>' +
      '</div>' +
      '<nav class="sb-nav">' +
        linksHtml +
        sectionsHtml +
      '</nav>' +
      '<div class="sb-user">' +
        '<div class="sb-user-info">' +
          '<div class="sb-avatar">' + avatar + '</div>' +
          '<div>' +
            '<div class="sb-user-name">' + (user && user.displayName ? user.displayName : '—') + '</div>' +
            '<div class="sb-user-role">' + roleLabel + '</div>' +
          '</div>' +
        '</div>' +
        '<button class="logout-btn" onclick="doLogout()">تسجيل الخروج 🚪</button>' +
      '</div>' +
    '</div>';

  // تطبيق body class للـ layout
  document.body.classList.add('has-sidebar');
};

// logout الافتراضي — يُستبدل في كل صفحة لها Firebase
window.doLogout = function () {
  sessionStorage.removeItem('lpc_user');
  location.href = 'index.html';
};

/* ═══════════════════════════════════════════════════════════════
   5. BARCODE SCANNER (USB Keyboard Wedge)
   ═══════════════════════════════════════════════════════════════ */

(function setupBarcodeScanner() {
  var buf = '', timer = null;

  document.addEventListener('keydown', function (e) {
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === 'Enter') {
      clearTimeout(timer);
      var code = buf.trim();
      buf = '';
      if (code.length >= 3) {
        // استدعاء المعالج الخاص بالصفحة
        if (typeof window.onBarcodeInput === 'function') {
          window.onBarcodeInput(code);
        }
        // عرض مؤشر المسح
        var ind  = document.getElementById('scanIndicator');
        var span = document.getElementById('scanCode');
        if (ind && span) {
          span.textContent = code;
          ind.classList.add('show');
          setTimeout(function () { ind.classList.remove('show'); }, 2500);
        }
        toast('📡 باركود: ' + code);
      }
      return;
    }

    if (e.key.length === 1) {
      buf += e.key;
      clearTimeout(timer);
      timer = setTimeout(function () { buf = ''; }, 200);
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════
   6. HELPERS
   ═══════════════════════════════════════════════════════════════ */

window.statusLabel = function (s) {
  var map = {
    pending:    '⏳ انتظار',
    inspecting: '🔍 فحص',
    in_repair:  '🔧 تصليح',
    ready:      '✅ جاهز',
    delivered:  '📦 مُسلَّم',
  };
  return map[s] || s;
};

window.slaHours = function (ts) {
  if (!ts || typeof ts.toDate !== 'function') return '—';
  return Math.floor((Date.now() - ts.toDate().getTime()) / 3600000);
};

window.slaClass = function (ts, status) {
  if (status === 'delivered' || status === 'ready') return 'sla-ok';
  var h = (ts && typeof ts.toDate === 'function')
        ? Math.floor((Date.now() - ts.toDate().getTime()) / 3600000)
        : 0;
  if (h >= 48) return 'sla-over';
  if (h >= 24) return 'sla-warn';
  return 'sla-ok';
};

window.fmtDate = function (ts) {
  if (!ts || typeof ts.toDate !== 'function') return '—';
  return ts.toDate().toLocaleDateString('ar-JO', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

window.fmtDateTime = function (ts) {
  if (!ts || typeof ts.toDate !== 'function') return '—';
  return ts.toDate().toLocaleDateString('ar-JO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// v() - قراءة قيمة input بسرعة
window.v = function (id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
};

// escapeHtml لمنع XSS
window.escapeHtml = function (str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/* ═══════════════════════════════════════════════════════════════
   7. PRINT RECEIPT  (وصل استلام الصيانة)
   ═══════════════════════════════════════════════════════════════ */

window.printTicketReceipt = function (ticket, techName) {
  var w = window.open('', '_blank', 'width=560,height=720');
  if (!w) { toast('⚠️ يرجى السماح بالنوافذ المنبثقة'); return; }

  var brandLine = '';
  if (ticket.brand) {
    brandLine = '<div class="row"><span class="lbl">البراند / الموديل</span>'
              + '<span class="val">' + escapeHtml(ticket.brand)
              + (ticket.model ? ' ' + escapeHtml(ticket.model) : '')
              + '</span></div>';
  }

  w.document.write(
    '<!DOCTYPE html><html lang="ar" dir="rtl"><head>' +
    '<meta charset="UTF-8"><title>وصل — ' + escapeHtml(ticket.ticketId) + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">' +
    '<style>' +
      'body{font-family:Tajawal,Arial,sans-serif;padding:22px;max-width:460px;margin:0 auto;color:#111}' +
      '.hdr{text-align:center;border-bottom:3px solid #F59E0B;padding-bottom:14px;margin-bottom:16px}' +
      '.logo{width:60px;height:60px;border-radius:12px;object-fit:cover;margin-bottom:6px}' +
      'h1{font-size:20px;color:#B45309;margin:0}h2{font-size:13px;color:#777;margin:4px 0 0}' +
      '.tid{background:#FEF3C7;border:2px solid #F59E0B;border-radius:9px;padding:9px 18px;' +
           'text-align:center;font-size:22px;font-weight:900;color:#B45309;margin-bottom:16px}' +
      '.row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px dashed #ddd;font-size:13px}' +
      '.lbl{color:#666}.val{font-weight:700}' +
      '.cbox{background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:10px;margin:12px 0}' +
      '.cbox h4{color:#D97706;margin:0 0 5px;font-size:12px}.cbox p{font-size:12px;color:#555;margin:0;line-height:1.6}' +
      '.ftr{text-align:center;margin-top:16px;font-size:11px;color:#888;border-top:1px dashed #ddd;padding-top:12px}' +
      '.ftr strong{color:#B45309}' +
      '@media print{body{margin:0}}' +
    '</style></head><body>' +
    '<div class="hdr">' +
      '<img class="logo" src="' + LOGO_URL + '" onerror="this.style.display=\'none\'">' +
      '<h1>Lawrence For PC</h1><h2>وصل استلام جهاز للصيانة</h2>' +
    '</div>' +
    '<div class="tid">🎫 ' + escapeHtml(ticket.ticketId) + '</div>' +
    '<div class="row"><span class="lbl">العميل</span><span class="val">' + escapeHtml(ticket.customerName) + '</span></div>' +
    '<div class="row"><span class="lbl">الهاتف</span><span class="val" dir="ltr">' + escapeHtml(ticket.phone) + '</span></div>' +
    '<div class="row"><span class="lbl">الجهاز</span><span class="val">' + escapeHtml(ticket.device) + '</span></div>' +
    brandLine +
    '<div class="row"><span class="lbl">العطل</span><span class="val">' + escapeHtml(ticket.issue) + '</span></div>' +
    '<div class="row"><span class="lbl">الفني المعين</span><span class="val">' + escapeHtml(techName || 'بانتظار التعيين') + '</span></div>' +
    '<div class="row"><span class="lbl">التكلفة التقديرية</span><span class="val">' + (ticket.estimatedCost || 0).toFixed(2) + ' د.أ</span></div>' +
    '<div class="row"><span class="lbl">تاريخ الاستلام</span><span class="val">' +
      new Date().toLocaleDateString('ar-JO', {year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}) +
    '</span></div>' +
    '<div class="cbox"><h4>⚠️ الحالة الخارجية عند الاستلام</h4><p>' + escapeHtml(ticket.externalCondition) + '</p></div>' +
    '<div class="ftr">' +
      '<p>احتفظ بهذا الوصل لاستلام جهازك</p>' +
      '<p>رقم الطلب: <strong>' + escapeHtml(ticket.ticketId) + '</strong></p>' +
      '<p style="margin-top:6px">شكراً لثقتك بـ <strong>Lawrence For PC</strong></p>' +
    '</div>' +
    '<script>window.onload=function(){window.print()}<\/script>' +
    '</body></html>'
  );
  w.document.close();
};

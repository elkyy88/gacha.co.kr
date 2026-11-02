/* ============================================================
   창업·구매 문의 팝업 (모든 페이지 공통)
   - "창업 문의", "창업 문의하기", "구매 문의하기" 버튼을 누르면 팝업이 열립니다.
   - 접수 연결: 아래 FORM 설정에 구글 설문지 주소와 항목 ID를 넣으면
     팝업에서 보낸 내용이 설문지(= 구글 시트)로 자동 저장됩니다.
   ============================================================ */
(function () {
  'use strict';

  var FORM = {
    /* 구글 설문지 "미디어캡슐 창업 문의"의 formResponse 주소 */
    action: 'https://docs.google.com/forms/d/e/1FAIpQLScoQHkmNGn8AVeGNozVSdDCfmLgEmWlBgMudRt-3vhLdqgWLQ/formResponse',
    /* 설문지 각 질문의 항목 ID (휴대폰 번호 / 성함 또는 회사명 / 문의 종류 / 문의 페이지) */
    fields: { phone: 'entry.1053297654', name: 'entry.1740194914', type: 'entry.349837658', page: 'entry.1700384703' }
  };
  /* claude.ai 미리보기 주소에서는 보안 제한으로 뒤에서 조용히 보내는 방식이 막혀 있어,
     구글 설문지의 '응답이 기록되었습니다' 페이지를 새 창으로 열어 접수합니다.
     실제 호스팅(자체 도메인)에 올리면 새 창 없이 조용히 전송됩니다. */
  var PREVIEW_HOST = /(^|\.)claudeusercontent\.com$|(^|\.)claude\.ai$/.test(location.hostname);

  var CSS = [
    '.iq-modal{position:fixed;inset:0;z-index:70;display:grid;place-items:center;padding:16px;padding-bottom:max(16px,env(safe-area-inset-bottom,0px))}',
    '.iq-modal[hidden]{display:none}',
    '.iq-backdrop{position:absolute;inset:0;background:rgba(27,42,74,.6)}',
    '.iq-box{position:relative;background:#FFFFFF;color:#1B2A4A;border-radius:22px;width:min(460px,100%);max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);overflow:auto;-webkit-overflow-scrolling:touch;box-shadow:0 20px 60px rgba(27,42,74,.3);padding:28px 24px 24px;font-family:"Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif;font-size:16px;line-height:1.5;word-break:keep-all;outline:none}',
    '@media (max-width:480px){.iq-box{padding:24px 18px 20px;border-radius:18px}}',
    '.iq-close{position:absolute;top:10px;right:10px;width:40px;height:40px;border:0;background:transparent;border-radius:50%;cursor:pointer;color:#5C6678;display:grid;place-items:center;padding:0}',
    '.iq-close:hover{background:#F3F5F9;color:#1B2A4A}',
    '.iq-close svg{width:20px;height:20px}',
    '.iq-view[hidden]{display:none}',
    '.iq-title{margin:0 0 20px;padding-right:32px;font-size:19px;font-weight:700;line-height:1.45;letter-spacing:-.01em;color:#1B2A4A}',
    '.iq-title em{display:block;font-style:normal;font-size:23px;font-weight:800;color:#FF6B35;margin-top:2px}',
    '@media (max-width:480px){.iq-title em{font-size:21px}}',
    '@media (max-width:360px){.iq-title{font-size:17px}.iq-title em{font-size:19px}}',
    '.iq-form{display:grid;gap:14px}',
    '.iq-field{display:grid;gap:6px}',
    '.iq-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    '.iq-input{display:block;width:100%;min-width:0;height:52px;border:1px solid #DFE4EC;border-radius:10px;padding:0 16px;font:inherit;font-size:16px;color:#1B2A4A;background:#FFFFFF;-webkit-appearance:none;appearance:none}',
    '.iq-input::placeholder{color:#A4A8C2}',
    '.iq-input:focus{outline:none;border-color:#FF6B35;box-shadow:0 0 0 3px #FFEDE4}',
    '.bad .iq-input{border-color:#E8352B}',
    '.iq-err{display:none;color:#C62828;font-size:13px}',
    '.bad>.iq-err{display:block}',
    '.iq-agree{display:grid;gap:8px;margin-top:6px}',
    '.iq-check{display:flex;align-items:center;gap:10px;font-size:15px;cursor:pointer;color:#1B2A4A;min-height:28px}',
    '.iq-check input{width:20px;height:20px;accent-color:#FF6B35;margin:0;flex:none;cursor:pointer}',
    '.iq-check b{color:#FF6B35;font-weight:700;margin-right:2px}',
    '.iq-row2{display:flex;justify-content:space-between;align-items:center;gap:10px;padding-left:30px;font-size:14px;color:#5C6678}',
    '.iq-link{border:0;background:none;font:inherit;font-size:14px;color:#8A93A5;text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:8px 10px;margin:-8px -10px;border-radius:8px;flex:none}',
    '.iq-link:hover{color:#1B2A4A;background:#F3F5F9}',
    '.iq-submit{display:block;width:100%;border:0;border-radius:999px;background:#FF6B35;color:#FFFFFF;font:inherit;font-size:18px;font-weight:700;padding:15px 22px;line-height:1.2;cursor:pointer;margin-top:10px}',
    '.iq-submit:hover{background:#E4551F}',
    '.iq-submit[disabled]{opacity:.6;cursor:default}',
    '.iq-submit-link{text-align:center;text-decoration:none;box-sizing:border-box}',
    '.iq-submit-link[hidden]{display:none}',
    '.iq-fail{display:none;margin:0;color:#C62828;font-size:13px;text-align:center}',
    '.iq-fail.show{display:block}',
    '.iq-title2{margin:0 0 14px;padding-right:32px;font-size:20px;font-weight:800;line-height:1.3}',
    '.iq-terms{border:1px solid #DFE4EC;border-radius:12px;padding:14px 16px;font-size:14px;color:#1B2A4A;display:grid;gap:12px;max-height:48vh;overflow:auto;background:#F9FAFC;line-height:1.6}',
    '.iq-terms p{margin:0;color:#5C6678}',
    '.iq-terms dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:8px 12px}',
    '.iq-terms dt{font-weight:700;white-space:nowrap}',
    '.iq-terms dd{margin:0}',
    '.iq-done{text-align:center;display:grid;gap:8px;padding-top:6px}',
    '.iq-done svg{width:64px;height:64px;margin:0 auto 4px;display:block}',
    '.iq-done h2{margin:0;font-size:22px;font-weight:800;line-height:1.3}',
    '.iq-done p{margin:0;color:#5C6678;font-size:15px}',
    '.iq-note{margin:12px 0 0;font-size:12px;color:#8A93A5;text-align:center}'
  ].join('\n');

  var CLOSE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  var HTML = [
    '<div class="iq-backdrop" data-iq-close></div>',
    '<div class="iq-box" role="dialog" aria-modal="true" aria-labelledby="iq-title" tabindex="-1">',
    '  <button class="iq-close" type="button" aria-label="닫기" data-iq-close>' + CLOSE_SVG + '</button>',

    '  <div class="iq-view" data-view="form">',
    '    <h2 class="iq-title" id="iq-title">연락처를 남겨주시면<em>담당자가 신속하게 연락드릴게요.</em></h2>',
    '    <form class="iq-form" id="iq-form" novalidate>',
    '      <div class="iq-field" data-field="phone">',
    '        <label class="iq-sr" for="iq-phone">휴대폰 번호</label>',
    '        <input class="iq-input" id="iq-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="휴대폰 번호" maxlength="13">',
    '        <span class="iq-err">휴대폰 번호를 정확히 입력해 주세요.</span>',
    '      </div>',
    '      <div class="iq-field" data-field="name">',
    '        <label class="iq-sr" for="iq-name">성함 또는 회사명</label>',
    '        <input class="iq-input" id="iq-name" name="name" type="text" autocomplete="name" placeholder="성함 또는 회사명" maxlength="40">',
    '        <span class="iq-err">성함 또는 회사명을 입력해 주세요.</span>',
    '      </div>',
    '      <div class="iq-agree" data-field="agree">',
    '        <label class="iq-check"><input type="checkbox" id="iq-agree" name="agree"><span><b>필수</b> 필수 항목에 모두 동의합니다.</span></label>',
    '        <div class="iq-row2"><span>· 개인정보 수집·이용 동의</span><button type="button" class="iq-link" data-iq-view="consent">보기</button></div>',
    '        <span class="iq-err">개인정보 수집·이용에 동의해 주세요.</span>',
    '      </div>',
    '      <button class="iq-submit" id="iq-submit" type="submit">문의하기</button>',
    '      <a class="iq-submit iq-submit-link" id="iq-submit-link" href="#" target="_blank" rel="noopener" role="button" hidden>문의하기</a>',
    '      <p class="iq-fail" id="iq-fail">전송에 실패했어요. 잠시 후 다시 시도해 주세요.</p>',
    '    </form>',
    '  </div>',

    '  <div class="iq-view" data-view="consent" hidden>',
    '    <h2 class="iq-title2" id="iq-consent-title">개인정보 수집·이용 동의</h2>',
    '    <div class="iq-terms">',
    '      <p>(주)미디어캡슐은 문의 상담을 위해 아래와 같이 개인정보를 수집·이용합니다.</p>',
    '      <dl>',
    '        <dt>수집 항목</dt><dd>휴대폰 번호, 성함 또는 회사명</dd>',
    '        <dt>이용 목적</dt><dd>문의 내용 확인, 상담 연락, 창업·설치 안내</dd>',
    '        <dt>보유 기간</dt><dd>문의 접수일로부터 1년 보관 후 지체 없이 파기 (관계 법령에 따라 보존이 필요한 경우 해당 기간까지 보관)</dd>',
    '      </dl>',
    '      <p>개인정보 수집·이용 동의를 거부할 수 있습니다. 다만 동의하지 않으시면 문의 접수와 상담 연락이 어렵습니다.</p>',
    '    </div>',
    '    <div class="iq-terms" data-lang="en" hidden>',
    '      <p>Media Capsule Co., Ltd. collects and uses the personal information below to respond to your inquiry.</p>',
    '      <dl>',
    '        <dt>Items</dt><dd>Phone number, name or company name</dd>',
    '        <dt>Purpose</dt><dd>Confirming your inquiry and contacting you for consultation</dd>',
    '        <dt>Retention</dt><dd>Kept for 1 year from the date of inquiry, then deleted without delay (or longer where required by law)</dd>',
    '      </dl>',
    '      <p>You may refuse consent; however, without it we cannot receive your inquiry or contact you.</p>',
    '    </div>',
    '    <button class="iq-submit" type="button" data-iq-view="form">확인</button>',
    '  </div>',

    '  <div class="iq-view iq-done" data-view="done" hidden>',
    '    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#FFEDE4"/><path d="M20 33l8 8 16-18" stroke="#FF6B35" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '    <h2 id="iq-done-title">문의가 접수됐어요</h2>',
    '    <p>남겨주신 연락처로 담당자가 빠르게 연락드릴게요.</p>',
    '    <button class="iq-submit" type="button" data-iq-close>확인</button>',
    '    <p class="iq-note" id="iq-note" hidden>※ 실제 접수 연결(구글 설문지 등)은 다음 단계에서 이어집니다.</p>',
    '    <p class="iq-note" id="iq-preview-note" hidden>새로 열린 창에 "응답이 기록되었습니다"가 보이면 정상 접수된 것입니다.</p>',
    '  </div>',
    '</div>'
  ].join('\n');

  var modal, box, form, phone, name, agree, submitBtn, failMsg;
  var state = { type: 'business', standalone: false, prevFocus: null };

  function $(sel, root) { return (root || modal).querySelector(sel); }

  function build() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    modal = document.createElement('div');
    modal.className = 'iq-modal';
    modal.id = 'iq-modal';
    modal.hidden = true;
    modal.innerHTML = HTML;
    document.body.appendChild(modal);

    box = $('.iq-box'); form = $('#iq-form'); phone = $('#iq-phone'); name = $('#iq-name');
    agree = $('#iq-agree'); submitBtn = $('#iq-submit'); failMsg = $('#iq-fail');
    if (!FORM.action) $('#iq-note').hidden = false;

    modal.addEventListener('click', function (e) {
      var t = e.target.closest('[data-iq-close],[data-iq-view]');
      if (!t) return;
      if (t.hasAttribute('data-iq-close')) { close(); return; }
      var v = t.getAttribute('data-iq-view');
      if (v === 'form' && state.standalone) { close(); return; }
      showView(v);
    });
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var items = box.querySelectorAll('button:not([disabled]),input:not([disabled]),[tabindex="0"]');
      var list = [];
      for (var i = 0; i < items.length; i++) if (items[i].offsetParent !== null) list.push(items[i]);
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === box)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    phone.addEventListener('input', function () { phone.value = formatPhone(phone.value); clearBad('phone'); syncLink(); });
    name.addEventListener('input', function () { clearBad('name'); syncLink(); });
    agree.addEventListener('change', function () { clearBad('agree'); syncLink(); });
    form.addEventListener('submit', onSubmit);

    /* 미리보기 주소에서는 '문의하기'가 진짜 링크(새 창)로 동작해야 하므로 버튼을 링크로 바꿔 보여줍니다. */
    if (PREVIEW_HOST && FORM.action) {
      submitBtn.hidden = true;
      submitLink = $('#iq-submit-link');
      submitLink.hidden = false;
      submitLink.addEventListener('click', function (e) {
        if (!validate()) { e.preventDefault(); return; }
        submitLink.href = submitUrl();   /* 클릭 직전 최신 값으로 */
        setTimeout(function () {
          form.reset(); syncLink();
          $('#iq-preview-note').hidden = false;
          showView('done');
        }, 0);
      });
    }
  }

  var submitLink = null;

  function validate() {
    var digits = phone.value.replace(/\D/g, '');
    var badPhone = setBad('phone', !(digits.length >= 9 && digits.length <= 11 && digits.charAt(0) === '0'));
    var badName = setBad('name', name.value.trim() === '');
    var badAgree = setBad('agree', !agree.checked);
    if (badPhone) { phone.focus(); return false; }
    if (badName) { name.focus(); return false; }
    if (badAgree) { agree.focus(); return false; }
    return true;
  }

  function currentPayload() {
    return {
      phone: phone.value,
      name: name.value.trim(),
      type: state.type === 'purchase' ? '구매 문의' : '창업 문의',
      page: (document.title || '') + ' · ' + location.href.replace(/[?#].*$/, '')
    };
  }

  function submitUrl() {
    return FORM.action + '?' + encode(currentPayload()).toString() + '&submit=Submit';
  }

  /* 링크 주소를 입력값에 맞춰 항상 최신으로 유지 (값이 유효할 때만 실제 주소) */
  function syncLink() {
    if (!submitLink) return;
    var digits = phone.value.replace(/\D/g, '');
    var ok = digits.length >= 9 && digits.length <= 11 && digits.charAt(0) === '0' && name.value.trim() !== '' && agree.checked;
    submitLink.href = ok ? submitUrl() : '#';
  }

  function formatPhone(v) {
    var d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length < 4) return d;
    if (d.slice(0, 2) === '02') {
      if (d.length <= 5) return d.slice(0, 2) + '-' + d.slice(2);
      if (d.length <= 9) return d.slice(0, 2) + '-' + d.slice(2, 5) + '-' + d.slice(5);
      return d.slice(0, 2) + '-' + d.slice(2, 6) + '-' + d.slice(6, 10);
    }
    if (d.length <= 7) return d.slice(0, 3) + '-' + d.slice(3);
    if (d.length <= 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  }

  function setBad(key, bad) { var el = $('[data-field="' + key + '"]'); if (el) el.classList.toggle('bad', !!bad); return !!bad; }
  function clearBad(key) { setBad(key, false); }

  function showView(v) {
    var views = modal.querySelectorAll('.iq-view');
    for (var i = 0; i < views.length; i++) views[i].hidden = views[i].getAttribute('data-view') !== v;
    box.setAttribute('aria-labelledby', v === 'consent' ? 'iq-consent-title' : v === 'done' ? 'iq-done-title' : 'iq-title');
    if (v === 'consent') {
      var en = state.standalone && document.documentElement.lang === 'en';
      var terms = modal.querySelectorAll('.iq-terms');
      for (var j = 0; j < terms.length; j++) terms[j].hidden = (terms[j].getAttribute('data-lang') === 'en') !== en;
      $('#iq-consent-title').textContent = en ? 'Consent to Collection and Use of Personal Information' : '개인정보 수집·이용 동의';
      $('[data-view="consent"] .iq-submit').textContent = en ? 'OK' : '확인';
    }
    box.scrollTop = 0;
    if (v === 'form') {
      if (window.matchMedia('(min-width:768px)').matches) { (phone.value ? name : phone).focus(); } else { box.focus(); }
    } else {
      box.focus();
    }
  }

  function open(type, view) {
    state.type = type || 'business';
    state.standalone = view === 'consent';
    state.prevFocus = document.activeElement;
    failMsg.classList.remove('show');
    $('#iq-preview-note').hidden = true;
    syncLink();
    modal.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    showView(view || 'form');
  }

  function close() {
    modal.hidden = true;
    document.documentElement.style.overflow = '';
    if (state.prevFocus && state.prevFocus.focus) { try { state.prevFocus.focus(); } catch (e) {} }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    var payload = currentPayload();
    failMsg.classList.remove('show');

    /* 미리보기 주소: Enter 키로 제출된 경우 — 링크를 대신 눌러 새 창으로 접수 */
    if (PREVIEW_HOST && FORM.action) {
      submitLink.href = submitUrl();
      submitLink.click();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '접수 중…';
    send(payload).then(function () {
      form.reset();
      showView('done');
    }, function () {
      failMsg.classList.add('show');
    }).then(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = '문의하기';
    });
  }

  function encode(data) {
    var body = new URLSearchParams();
    for (var k in FORM.fields) if (FORM.fields[k] && data[k] !== undefined) body.append(FORM.fields[k], data[k]);
    return body;
  }

  function send(data) {
    if (!FORM.action) return Promise.resolve();
    return fetch(FORM.action, { method: 'POST', mode: 'no-cors', body: encode(data) });
  }

  function closeMobileNav() {
    var nav = document.getElementById('nav'), btn = document.getElementById('menu-btn');
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      if (btn) {
        btn.setAttribute('aria-expanded', 'false');
        var p = btn.querySelector('path');
        if (p) p.setAttribute('d', 'M4 7h16M4 12h16M4 17h16');
      }
    }
  }

  function init() {
    if (!document.body || !window.fetch || !window.Promise || !Element.prototype.closest) return;
    build();
    /* 캡처 단계에서 가로채어, 기존 안내 토스트보다 먼저 처리합니다. */
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('a,button') : null;
      if (!t || modal.contains(t)) return;
      var df = t.getAttribute('data-form');
      var href = t.getAttribute('href') || '';
      if (df === 'business' || df === 'purchase') {
        e.preventDefault(); e.stopPropagation();
        closeMobileNav();
        open(df);
      } else if (/#contact$/.test(href)) {
        e.preventDefault();
        closeMobileNav();
        open(/구매/.test(t.textContent) ? 'purchase' : 'business');
      } else if (df === 'privacy' && t.closest('.agree')) {
        e.preventDefault(); e.stopPropagation();
        open('business', 'consent');
      }
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

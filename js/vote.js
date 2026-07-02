// ------------------------------------------------------------------
// Brew U 投票頁 — 前端介面示範
// 注意：這裡的票數／登入狀態只存在使用者自己瀏覽器的 localStorage，
// 沒有串接真正的後台資料庫，重新整理／換裝置後票數不會同步。
// 正式上線時，這段邏輯需要換成呼叫真正的會員系統 + 投票 API。
// ------------------------------------------------------------------

const CANDIDATES = [
  { id: 'jay',    name: '周杰倫套餐',     combo: '焦糖拿鐵 ＋ 可麗露', creator: '@lulu_coffee', emoji: '🎤' },
  { id: 'tnua',   name: '我愛北藝套餐',   combo: '抹茶拿鐵 ＋ 軟餅乾', creator: '@tnua_life',   emoji: '🎨' },
  { id: 'allnighter', name: '熬夜趕作業套餐', combo: 'Cold Brew ＋ 布朗尼', creator: '@deadline.kiki', emoji: '📚' },
  { id: 'offday', name: '今天不想上班套餐', combo: '榛果拿鐵 ＋ 瑪德蓮', creator: '@mon.blue',    emoji: '😮‍💨' },
  { id: 'cat',    name: '貓咪店長推薦套餐', combo: '手沖單品 ＋ 可麗露', creator: '@brewu_cat',   emoji: '🐾' },
];

const BASE_VOTES = { jay: 128, tnua: 96, allnighter: 141, offday: 74, cat: 110 };

const el = (id) => document.getElementById(id);

function getUser() {
  return localStorage.getItem('brewu_user') || '';
}
function setUser(name) {
  localStorage.setItem('brewu_user', name);
}
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
function hasVotedToday(user) {
  return localStorage.getItem('brewu_vote_' + user + '_' + todayKey()) || null;
}
function markVotedToday(user, candidateId) {
  localStorage.setItem('brewu_vote_' + user + '_' + todayKey(), candidateId);
}
function getVoteCounts() {
  const stored = localStorage.getItem('brewu_vote_counts');
  return stored ? JSON.parse(stored) : { ...BASE_VOTES };
}
function saveVoteCounts(counts) {
  localStorage.setItem('brewu_vote_counts', JSON.stringify(counts));
}

function renderLogin() {
  const user = getUser();
  el('loginStatus').textContent = user ? `目前登入：${user}` : '尚未登入';
  el('nameInput').value = user || '';
}

function renderCandidates() {
  const user = getUser();
  const votedId = user ? hasVotedToday(user) : null;
  const counts = getVoteCounts();
  const grid = el('voteGrid');
  grid.innerHTML = '';

  CANDIDATES.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'vote-card';

    const alreadyVotedThis = votedId === c.id;
    const disabled = !user || !!votedId;

    card.innerHTML = `
      <div class="vote-card-photo">${c.emoji}</div>
      <div class="vote-card-name">${c.name}</div>
      <div class="vote-card-combo">${c.combo}</div>
      <div class="vote-card-creator">創作者 ${c.creator}</div>
      <div class="vote-card-count">${counts[c.id]} 票</div>
      <button type="button" class="btn ${alreadyVotedThis ? 'btn-secondary' : 'btn-primary'} vote-card-btn" data-id="${c.id}" ${disabled ? 'disabled' : ''}>
        ${alreadyVotedThis ? '✓ 今日已投給這款' : (!user ? '請先登入' : (votedId ? '今日票數已用完' : '看廣告投 1 票'))}
      </button>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('button[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => openAdModal(btn.getAttribute('data-id')));
  });
}

function openAdModal(candidateId) {
  const user = getUser();
  if (!user) return;
  const candidate = CANDIDATES.find((c) => c.id === candidateId);
  el('adCandidateName').textContent = candidate ? `${candidate.name}（${candidate.combo}）` : '';
  el('adModal').classList.add('open');

  let seconds = 5;
  el('adTimer').textContent = seconds;
  const timer = setInterval(() => {
    seconds -= 1;
    el('adTimer').textContent = seconds > 0 ? seconds : '✓';
    if (seconds <= 0) {
      clearInterval(timer);
      const counts = getVoteCounts();
      counts[candidateId] = (counts[candidateId] || 0) + 1;
      saveVoteCounts(counts);
      markVotedToday(user, candidateId);
      setTimeout(() => {
        el('adModal').classList.remove('open');
        renderCandidates();
      }, 500);
    }
  }, 1000);
}

document.addEventListener('DOMContentLoaded', function () {
  renderLogin();
  renderCandidates();

  el('loginBtn').addEventListener('click', () => {
    const name = el('nameInput').value.trim();
    if (!name) {
      alert('請先輸入暱稱再登入（示範用，不需要密碼）。');
      return;
    }
    setUser(name);
    renderLogin();
    renderCandidates();
  });
});
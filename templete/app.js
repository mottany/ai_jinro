const socket = io();
let joined = false;

function joinRoom() {
  const room = document.getElementById('room').value.trim();
  const user = document.getElementById('user').value.trim();
  if (!room) { alert('ルーム名を入力してください'); return; }
  socket.emit('join', { room, user });
  joined = true;
  document.getElementById('msg').disabled = false;
  document.getElementById('sendBtn').disabled = false;
  document.getElementById('status').textContent = `参加中: ${room}`;
}

function sendMsg() {
  if (!joined) return;
  const room = document.getElementById('room').value.trim();
  const message = document.getElementById('msg').value;
  if (!message) return;
  socket.emit('chat', { room, message });
  document.getElementById('msg').value = '';
}

socket.on('chat', ({ user, message }) => {
  const box = document.getElementById('chat-box');
  const cls = user === 'AI' ? 'ai' : 'user';
  box.innerHTML += `<div class='${cls}'>${user}: ${escapeHtml(message)}</div>`;
  box.scrollTop = box.scrollHeight;
});

socket.on('system', (msg) => {
  const box = document.getElementById('chat-box');
  box.innerHTML += `<div style='color:#aaa;'>⚙ ${escapeHtml(msg)}</div>`;
  box.scrollTop = box.scrollHeight;
});

function escapeHtml(str){
  return str.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

// グローバルに公開
window.joinRoom = joinRoom;
window.sendMsg = sendMsg;
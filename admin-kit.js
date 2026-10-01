// 게임 관리 페이지 공용 모듈: Firebase 초기화, 구글 로그인, 관리자 확인, 날짜·이스케이프 도우미.
// 접근 제어는 Realtime Database 규칙이 한다(관리자 이메일만 쓰기). 여기 값은 공개돼도 된다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
export { ref, get, set, remove } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

export const ADMIN = "wjs9280@gmail.com";
export const $ = (id) => document.getElementById(id);
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const todayYmd = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
export const ymdToInput = (n) => `${String(n).slice(0, 4)}-${String(n).slice(4, 6)}-${String(n).slice(6, 8)}`;
export const inputToYmd = (s) => Number(String(s || "").replaceAll("-", ""));
export const daysLater = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
// Firebase 키에 못 쓰는 문자: . $ # [ ] /
export const validKey = (k) => !!k && !/[.$#\[\]\/]/.test(k);

// 페이지에 #who #login #logout #status #app 요소가 있어야 한다. 관리자로 로그인되면 onAdmin(db) 를 부른다.
export function startAdmin(firebaseConfig, onAdmin) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);
  const status = (text, cls = "muted") => { $("status").className = cls; $("status").textContent = text; };
  $("login").onclick = () => signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => status("로그인 실패: " + e.message, "err"));
  $("logout").onclick = () => signOut(auth);
  onAuthStateChanged(auth, (user) => {
    const isAdmin = !!user && user.email === ADMIN && user.emailVerified;
    $("who").textContent = user ? user.email : "로그인되어 있지 않습니다.";
    $("login").classList.toggle("hidden", !!user);
    $("logout").classList.toggle("hidden", !user);
    $("app").classList.toggle("hidden", !isAdmin);
    if (user && !isAdmin) status(`관리자 계정이 아닙니다. ${ADMIN} 계정으로 로그인해주세요.`, "err");
    else status("");
    if (isAdmin) onAdmin(db);
  });
  return { db, status };
}

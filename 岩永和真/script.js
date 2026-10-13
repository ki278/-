// ========================================
// かんたん家計簿
// JavaScript
// ========================================

// ========================================
// HTMLの要素を取得
// ========================================

const loginScreen = document.getElementById("loginScreen");
const kakeiboScreen = document.getElementById("kakeiboScreen");

const kakeiboForm = document.getElementById("kakeiboForm");

const typeInput = document.getElementById("type");
const dateInput = document.getElementById("date");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const memoInput = document.getElementById("memo");

const kakeiboList = document.getElementById("kakeiboList");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balance = document.getElementById("balance");

const welcomeUser = document.getElementById("welcomeUser");

// ========================================
// 現在ログインしているユーザー
// ========================================

let currentUser = localStorage.getItem("currentUser");

// ========================================
// ページを開いたとき
// ========================================

window.addEventListener("load", function () {
  if (currentUser) {
    showKakeiboScreen();
  } else {
    showLoginScreen();
  }
});

// ========================================
// 新規登録
// ========================================

function register() {
  const username = document.getElementById("registerUsername").value.trim();

  const password = document.getElementById("registerPassword").value;

  // 入力チェック

  if (username === "" || password === "") {
    document.getElementById("registerMessage").textContent =
      "ユーザー名とパスワードを入力してください。";

    return;
  }

  // すでに登録されているユーザーを取得

  let users = JSON.parse(localStorage.getItem("users")) || {};

  // ユーザー名が存在するか確認

  if (users[username]) {
    document.getElementById("registerMessage").textContent =
      "このユーザー名はすでに使用されています。";

    return;
  }

  // ユーザーを登録

  users[username] = {
    password: password,
  };

  localStorage.setItem("users", JSON.stringify(users));

  document.getElementById("registerMessage").textContent =
    "登録しました！ログインしてください。";

  // 入力欄を空にする

  document.getElementById("registerUsername").value = "";
  document.getElementById("registerPassword").value = "";
}

// ========================================
// ログイン
// ========================================

function login() {
  const username = document.getElementById("loginUsername").value.trim();

  const password = document.getElementById("loginPassword").value;

  // ユーザー情報を取得

  let users = JSON.parse(localStorage.getItem("users")) || {};

  // ユーザーが存在しない

  if (!users[username]) {
    document.getElementById("loginMessage").textContent =
      "ユーザー名またはパスワードが違います。";

    return;
  }

  // パスワード確認

  if (users[username].password !== password) {
    document.getElementById("loginMessage").textContent =
      "ユーザー名またはパスワードが違います。";

    return;
  }

  // ログイン成功

  currentUser = username;

  localStorage.setItem("currentUser", currentUser);

  document.getElementById("loginMessage").textContent = "";

  showKakeiboScreen();
}

// ========================================
// ログアウト
// ========================================

function logout() {
  localStorage.removeItem("currentUser");

  currentUser = null;

  showLoginScreen();
}

// ========================================
// ログイン画面を表示
// ========================================

function showLoginScreen() {
  loginScreen.classList.remove("hidden");

  kakeiboScreen.classList.add("hidden");
}

// ========================================
// 家計簿画面を表示
// ========================================

function showKakeiboScreen() {
  loginScreen.classList.add("hidden");

  kakeiboScreen.classList.remove("hidden");

  welcomeUser.textContent = currentUser + " さん";

  // 今日の日付を設定

  const today = new Date().toISOString().split("T")[0];

  dateInput.value = today;

  displayKakeibo();
}

// ========================================
// 家計簿データを取得
// ========================================

function getKakeiboData() {
  const key = "kakeibo_" + currentUser;

  return JSON.parse(localStorage.getItem(key)) || [];
}

// ========================================
// 家計簿データを保存
// ========================================

function saveKakeiboData(data) {
  const key = "kakeibo_" + currentUser;

  localStorage.setItem(key, JSON.stringify(data));
}

// ========================================
// 家計簿を登録
// ========================================

kakeiboForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const type = typeInput.value;

  const date = dateInput.value;

  const category = categoryInput.value;

  const amount = Number(amountInput.value);

  const memo = memoInput.value;

  // 入力チェック

  if (!date || !amount) {
    alert("日付と金額を入力してください。");

    return;
  }

  // 家計簿データを取得

  const data = getKakeiboData();

  // 新しいデータ

  const newData = {
    id: Date.now(),

    type: type,

    date: date,

    category: category,

    amount: amount,

    memo: memo,
  };

  // データを追加

  data.push(newData);

  // 保存

  saveKakeiboData(data);

  // フォームをリセット

  kakeiboForm.reset();

  // 日付を今日に戻す

  const today = new Date().toISOString().split("T")[0];

  dateInput.value = today;

  // 表示を更新

  displayKakeibo();
});

// ========================================
// 家計簿を表示
// ========================================

function displayKakeibo() {
  const data = getKakeiboData();

  // 一覧を空にする

  kakeiboList.innerHTML = "";

  let income = 0;

  let expense = 0;

  // データを表示

  data.forEach(function (item) {
    const tr = document.createElement("tr");

    // 収入・支出の計算

    if (item.type === "income") {
      income += item.amount;
    } else {
      expense += item.amount;
    }

    // 種類の表示

    const typeText = item.type === "income" ? "収入" : "支出";

    const typeClass = item.type === "income" ? "income-text" : "expense-text";

    // HTMLを作成

    tr.innerHTML = `

            <td>${item.date}</td>

            <td class="${typeClass}">
                ${typeText}
            </td>

            <td>${item.category}</td>

            <td>
                ¥${item.amount.toLocaleString()}
            </td>

            <td>${item.memo}</td>

            <td>
                <button
                    class="delete-button"
                    onclick="deleteKakeibo(${item.id})"
                >
                    削除
                </button>
            </td>

        `;

    kakeiboList.appendChild(tr);
  });

  // 残高

  const result = income - expense;

  // 画面に表示

  totalIncome.textContent = "¥" + income.toLocaleString();

  totalExpense.textContent = "¥" + expense.toLocaleString();

  balance.textContent = "¥" + result.toLocaleString();
}

// ========================================
// 家計簿を削除
// ========================================

function deleteKakeibo(id) {
  const result = confirm("このデータを削除しますか？");

  if (!result) {
    return;
  }

  // データ取得

  let data = getKakeiboData();

  // 指定されたIDを削除

  data = data.filter(function (item) {
    return item.id !== id;
  });

  // 保存

  saveKakeiboData(data);

  // 表示更新

  displayKakeibo();
}

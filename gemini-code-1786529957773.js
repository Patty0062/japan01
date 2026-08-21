import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ⚠️ 請替換為您在 Firebase Console 申請的設定檔
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const expensesRef = ref(database, 'tokyo_group_expenses');

window.cloudGroupExpenses = [];
let currentJpyToTwdRate = 0.21;

// 預設行李清單
const defaultPackingList = [
    { id: 1, text: "🛂 護照正本 + 影本", checked: false },
    { id: 2, text: "📱 日本 eSIM / 網卡 / Wi-Fi 機", checked: false },
    { id: 3, text: "💳 信用卡 + 少量日幣現金", checked: false },
    { id: 4, text: "🔋 行動電源 + 充電線", checked: false },
    { id: 5, text: "🔌 日本雙孔插頭轉接頭", checked: false },
    { id: 6, text: "💊 個人常備藥品 / 胃藥 / 止痛藥", checked: false },
    { id: 7, text: "👔 替換衣物 + 舒適走路鞋", checked: false },
    { id: 8, text: "☂️ 折疊傘 / 雨具", checked: false }
];

let packingItems = JSON.parse(localStorage.getItem("my_tokyo_packing_list")) || defaultPackingList;

// 景點攻略資料庫
const spotGuides = {
    kinshicho: {
        title: "🏨 錦糸町周邊攻略",
        img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80",
        eat: [
            "<strong>真鯛拉麵 麵魚 (麺魚):</strong> 超人氣鯛魚湯頭拉麵，濃郁鮮美！",
            "<strong>山田家 人形燒:</strong> 錦糸町傳統黑心人形燒，紅豆餡甜而不膩。"
        ],
        buy: [
            "<strong>ARCAKIT 購物中心:</strong> 超大平價 Uniqlo 與 大創 (DAISO) 旗艦店。",
            "<strong>錦糸町 PARCO:</strong> 無印良品與各式日本流行雜貨。"
        ],
        go: [
            "<strong>錦糸公園:</strong> 晴空塔絕佳遠眺拍照點，春天也是賞櫻熱點。",
            "<strong>墨田江戶切子館:</strong> 體驗傳統玻璃工藝精緻之美。"
        ]
    },
    pokemon_dx: {
        title: "⚡ Pokémon Center TOKYO DX (日本橋)",
        img: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=600&q=80",
        eat: [
            "<strong>Pokémon Cafe (需預約):</strong> 皮卡丘造型蛋包飯、伊布甜點與造型飲料。",
            "<strong>皮卡丘拿鐵:</strong> 就算沒預約咖啡廳，也可在外帶區購買圖案拉花飲品。"
        ],
        buy: [
            "<strong>東京 DX 限定紳士皮卡丘:</strong> 穿著紳士西裝、戴禮帽的限定版公仔。",
            "<strong>日本橋傳統合作週邊:</strong> 與百年老店合作的印傳皮件與扇子。"
        ],
        go: [
            "<strong>巨型卡比獸拍照區:</strong> 入口處 1:1 等身大卡比獸與皮卡丘雕像必拍！",
            "<strong>觸控式圖鑑牆:</strong> 互動式數位牆，可搜尋全世代寶可夢詳細資料。"
        ]
    },
    nihonbashi: {
        title: "🍜 日本橋美食與古蹟攻略",
        img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
        eat: [
            "<strong>金子半之助 本店:</strong> 超高 CP 值豪華天丼，酥脆炸蝦與秘製醬汁！",
            "<strong>日本橋 玉井 (Tamai):</strong> 百年穴子（星鰻）飯老店，高湯茶泡飯兩吃。"
        ],
        buy: [
            "<strong>山本山 海苔:</strong> 日本百年老字號頂級海苔與煎茶禮盒。",
            "<strong>榛原 (Haibara) 和紙:</strong> 傳承百年的手工和紙信封信紙與文房具。"
        ],
        go: [
            "<strong>日本橋道路原標基點:</strong> 日本國道的起點標誌，具有歷史紀念意義。",
            "<strong>三井本館 / 誠品生活日本橋:</strong> 結合古典歐式建築與現代文創雜貨。"
        ]
    },
    mega_tokyo: {
        title: "⚡ Pokémon Center MEGA TOKYO (池袋)",
        img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
        eat: [
            "<strong>Pikachu Sweets 甜點店:</strong> 皮卡丘泡芙、造型杯子蛋糕與季節限定冰淇淋。",
            "<strong>Sunshine City 美食街:</strong> 陽光城內有各式知名日式定食與甜點店。"
        ],
        buy: [
            "<strong>Mega 噴火龍皮卡丘:</strong> 披著 Mega 噴火龍披風的超萌皮卡丘玩偶。",
            "<strong>Pokémon GO Lab 限定商品:</strong> 全球首家 PGO 實體概念店限定卡牌與週邊。"
        ],
        go: [
            "<strong>噴火龍與皮卡丘巨型雕像:</strong> 超霸氣的主題雕像，寶可夢迷必打卡！",
            "<strong>Sunshine City 陽光城:</strong> 包含水族館、展望台與動漫一番賞天堂。"
        ]
    },
    shibuya_parco: {
        title: "💚 Nintendo TOKYO ＆ 澀谷 PARCO",
        img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80",
        eat: [
            "<strong>極味屋 (Kiwamiya) 漢堡排:</strong> 澀谷 PARCO B1，自己在鐵板上煎製鮮嫩牛肉。",
            "<strong>CHAHO 抹茶專賣店:</strong> 濃郁日式抹茶冰淇淋與特調抹茶飲品。"
        ],
        buy: [
            "<strong>Nintendo TOKYO 限定瑪利歐週邊:</strong> 瑪利歐雕像公仔、薩爾達傳說休閒服飾。",
            "<strong>Capcom / JUMP Shop 獨家公仔:</strong> 怪物獵人、航海王與鬼滅之刃限定發售品。"
        ],
        go: [
            "<strong>等身大瑪利歐 / 薩爾達 / 擺設:</strong> 店內 1:1 實體角色雕像拍照打卡。",
            "<strong>澀谷 PARCO 頂樓花園 (ROOFTOP Park):</strong> 俯瞰澀谷街景與遠眺十字路口。"
        ]
    }
};

// 依附全域 window 方法（供 HTML 內建事件調用）
window.firebaseAddGroupExpense = function(item) {
    push(expensesRef, item);
};

window.firebaseDeleteGroupExpense = function(key) {
    const itemRef = ref(database, 'tokyo_group_expenses/' + key);
    remove(itemRef);
};

onValue(expensesRef, (snapshot) => {
    const data = snapshot.val();
    const groupList = [];
    if (data) {
        Object.keys(data).forEach(key => {
            groupList.push({ firebaseKey: key, ...data[key] });
        });
    }
    window.cloudGroupExpenses = groupList;
    if (typeof window.renderExpenses === 'function') {
        window.renderExpenses();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    fetchTokyoWeather();
    fetchJpyRate();
    renderExpenses();
    renderPackingList();
});

window.togglePayerInput = function() {
    const type = document.querySelector('input[name="expenseType"]:checked').value;
    document.getElementById("payerInputBox").style.display = (type === "group") ? "block" : "none";
};

window.openSpotModal = function(spotKey) {
    const data = spotGuides[spotKey];
    if (!data) return;

    document.getElementById("modalImg").src = data.img;
    document.getElementById("modalTitle").innerText = data.title;

    document.getElementById("modalEat").innerHTML = data.eat.map(item => `<li>${item}</li>`).join("");
    document.getElementById("modalBuy").innerHTML = data.buy.map(item => `<li>${item}</li>`).join("");
    document.getElementById("modalGo").innerHTML = data.go.map(item => `<li>${item}</li>`).join("");

    document.getElementById("spotModal").classList.add("active");
};

window.closeSpotModal = function() {
    document.getElementById("spotModal").classList.remove("active");
};

async function fetchTokyoWeather() {
    try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current_weather=true");
        const data = await res.json();
        const temp = data.current_weather.temperature;
        document.getElementById("weatherInfo").innerText = `🌡️ ${temp}°C (東京市區)`;
    } catch (e) {
        document.getElementById("weatherInfo").innerText = "☀️ 20°C (東京)";
    }
}

async function fetchJpyRate() {
    try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/JPY");
        const data = await res.json();
        currentJpyToTwdRate = data.rates.TWD;
        document.getElementById("rateBadge").innerText = `當前匯率：1 JPY ≈ ${currentJpyToTwdRate.toFixed(4)} TWD`;
    } catch (e) {
        document.getElementById("rateBadge").innerText = `預設匯率：1 JPY ≈ ${currentJpyToTwdRate} TWD`;
    }
}

window.switchPage = function(pageId) {
    document.querySelectorAll(".page-view").forEach(el => el.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");
};

window.switchTab = function(tabId) {
    document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    event.target.classList.add("active");
    document.getElementById(tabId).classList.add("active");
};

window.calcTwdPreview = function() {
    const jpy = parseFloat(document.getElementById("itemJpy").value) || 0;
    const twd = Math.round(jpy * currentJpyToTwdRate);
    document.getElementById("twdPreview").innerText = `≈ NT$ ${twd}`;
};

window.addExpense = function() {
    const desc = document.getElementById("itemDesc").value.trim();
    const jpy = parseFloat(document.getElementById("itemJpy").value);
    const type = document.querySelector('input[name="expenseType"]:checked').value;
    const name = document.getElementById("payerName").value.trim() || "成員";
    const day = document.getElementById("expenseDay").value;

    if (!desc || isNaN(jpy) || jpy <= 0) {
        alert("請輸入正確的項目與金額！");
        return;
    }

    const item = {
        id: Date.now(),
        day: day,
        payer: name,
        desc: desc,
        jpy: jpy,
        twd: Math.round(jpy * currentJpyToTwdRate),
        type: type
    };

    if (type === "group") {
        if (window.firebaseAddGroupExpense) {
            window.firebaseAddGroupExpense(item);
        }
    } else {
        let localPrivate = JSON.parse(localStorage.getItem("my_private_expenses")) || [];
        localPrivate.push(item);
        localStorage.setItem("my_private_expenses", JSON.stringify(localPrivate));
        renderExpenses();
    }

    document.getElementById("itemDesc").value = "";
    document.getElementById("itemJpy").value = "";
    document.getElementById("twdPreview").innerText = "≈ NT$ 0";
};

window.deletePrivateExpense = function(id) {
    let localPrivate = JSON.parse(localStorage.getItem("my_private_expenses")) || [];
    localPrivate = localPrivate.filter(item => item.id !== id);
    localStorage.setItem("my_private_expenses", JSON.stringify(localPrivate));
    renderExpenses();
};

window.deleteGroupExpense = function(firebaseKey) {
    if (window.firebaseDeleteGroupExpense) window.firebaseDeleteGroupExpense(firebaseKey);
};

window.renderExpenses = function() {
    const listEl = document.getElementById("expenseList");
    if (!listEl) return;
    listEl.innerHTML = "";

    const localPrivate = JSON.parse(localStorage.getItem("my_private_expenses")) || [];
    const allExpenses = [...window.cloudGroupExpenses, ...localPrivate];

    const filterDay = document.getElementById("filterDay") ? document.getElementById("filterDay").value : "all";

    let totalJpy = 0;
    let totalTwd = 0;

    allExpenses.forEach(item => {
        const itemDay = item.day || "1";
        
        if (filterDay !== "all" && itemDay.toString() !== filterDay) {
            return;
        }

        totalJpy += item.jpy;
        totalTwd += item.twd;

        const li = document.createElement("li");
        li.className = "expense-item";

        if (item.type === "group") {
            li.innerHTML = `
                <div>
                    <span class="tag-badge tag-day">Day ${itemDay}</span>
                    <span class="tag-badge tag-group">👥 群體公用</span>
                    <strong>[${item.payer} 墊付] ${item.desc}</strong>
                </div>
                <div>
                    <span>¥ ${item.jpy} <small style="color:#777;">(NT$ ${item.twd})</small></span>
                    <button onclick="deleteGroupExpense('${item.firebaseKey}')" style="border:none; background:none; color:red; cursor:pointer; margin-left:8px;">❌</button>
                </div>
            `;
        } else {
            li.innerHTML = `
                <div>
                    <span class="tag-badge tag-day">Day ${itemDay}</span>
                    <span class="tag-badge tag-personal">🙋‍♂️ 個人私有</span>
                    <strong>${item.desc}</strong>
                </div>
                <div>
                    <span>¥ ${item.jpy} <small style="color:#777;">(NT$ ${item.twd})</small></span>
                    <button onclick="deletePrivateExpense(${item.id})" style="border:none; background:none; color:red; cursor:pointer; margin-left:8px;">❌</button>
                </div>
            `;
        }
        listEl.appendChild(li);
    });

    document.getElementById("totalJpy").innerText = `¥ ${totalJpy}`;
    document.getElementById("totalTwd").innerText = `NT$ ${totalTwd}`;
    document.getElementById("quickTotalJpy").innerText = `¥ ${totalJpy}`;

    calculateAutoSplit();
};

function calculateAutoSplit() {
    const box = document.getElementById("splitResultBox");
    if (!box) return;

    const peopleCount = parseInt(document.getElementById("splitPeopleCount").value) || 1;

    let groupTotalJpy = 0;
    const payerTotals = {};

    window.cloudGroupExpenses.forEach(item => {
        groupTotalJpy += item.jpy;
        const payer = item.payer || "成員";
        payerTotals[payer] = (payerTotals[payer] || 0) + item.jpy;
    });

    const averagePerPerson = Math.round(groupTotalJpy / peopleCount);
    const averagePerPersonTwd = Math.round(averagePerPerson * currentJpyToTwdRate);

    let html = `
        <p style="margin-bottom: 12px;">👥 群體總公用花費：<strong>¥ ${groupTotalJpy}</strong></p>
        <p style="margin-bottom: 12px; font-size: 1rem; color: var(--accent-blue);">👉 每人應分攤：<strong>¥ ${averagePerPerson}</strong> <small>(約 NT$ ${averagePerPersonTwd})</small></p>
        <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 12px 0;">
    `;

    if (Object.keys(payerTotals).length === 0) {
        html += `<p style="color:#888; font-size:0.85rem;">尚無群體公用消費紀錄</p>`;
    } else {
        Object.keys(payerTotals).forEach(payer => {
            const paid = payerTotals[payer];
            const diff = paid - averagePerPerson;
            const diffTwd = Math.abs(Math.round(diff * currentJpyToTwdRate));

            if (diff > 0) {
                html += `
                    <div class="split-user-row">
                        <span><strong>${payer}</strong> (已先付 ¥ ${paid})</span>
                        <span class="amount-get">應拿回 ¥ ${diff} (約 NT$ ${diffTwd})</span>
                    </div>
                `;
            } else if (diff < 0) {
                html += `
                    <div class="split-user-row">
                        <span><strong>${payer}</strong> (已先付 ¥ ${paid})</span>
                        <span class="amount-pay">應補給別人 ¥ ${Math.abs(diff)} (約 NT$ ${diffTwd})</span>
                    </div>
                `;
            } else {
                html += `
                    <div class="split-user-row">
                        <span><strong>${payer}</strong> (已先付 ¥ ${paid})</span>
                        <span style="color:#666;">完美平帳，無需補退</span>
                    </div>
                `;
            }
        });
    }

    box.innerHTML = html;
}

function renderPackingList() {
    const listEl = document.getElementById("packingList");
    if (!listEl) return;
    listEl.innerHTML = "";

    let checkedCount = 0;

    packingItems.forEach(item => {
        if (item.checked) checkedCount++;

        const li = document.createElement("li");
        li.className = `packing-item ${item.checked ? 'checked' : ''}`;
        li.innerHTML = `
            <div class="packing-left" onclick="togglePackingItem(${item.id})">
                <input type="checkbox" ${item.checked ? 'checked' : ''} onclick="event.stopPropagation(); togglePackingItem(${item.id})">
                <span class="packing-text">${item.text}</span>
            </div>
            <button onclick="deletePackingItem(${item.id})" style="border:none; background:none; color:red; cursor:pointer; margin-left:8px;">❌</button>
        `;
        listEl.appendChild(li);
    });

    document.getElementById("packingProgress").innerText = `${checkedCount} / ${packingItems.length} 已完成`;
}

window.addPackingItem = function() {
    const text = document.getElementById("newPackingItem").value.trim();
    if (!text) {
        alert("請輸入物品名稱！");
        return;
    }

    const newItem = {
        id: Date.now(),
        text: text,
        checked: false
    };

    packingItems.push(newItem);
    savePackingItems();
    document.getElementById("newPackingItem").value = "";
    renderPackingList();
};

window.togglePackingItem = function(id) {
    packingItems = packingItems.map(item => {
        if (item.id === id) item.checked = !item.checked;
        return item;
    });
    savePackingItems();
    renderPackingList();
};

window.deletePackingItem = function(id) {
    packingItems = packingItems.filter(item => item.id !== id);
    savePackingItems();
    renderPackingList();
};

function savePackingItems() {
    localStorage.setItem("my_tokyo_packing_list", JSON.stringify(packingItems));
}
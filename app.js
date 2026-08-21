// 行程資料陣列
const scheduleData = [
    {
        time: "09:00",
        title: "🏨 錦糸町出發",
        transport: "🚇 半藏門線",
        type: "transit",
        // 起點與終點導航
        mapUrl: "https://www.google.com/maps/dir/?api=1&origin=Kinshicho+Station&destination=Pokemon+Center+TOKYO+DX&travelmode=transit"
    },
    {
        time: "09:30 – 11:00",
        title: "⚡ Pokémon Center TOKYO DX",
        transport: "🚶 步行",
        type: "walk",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Pokemon+Center+TOKYO+DX"
    },
    {
        time: "11:00 – 12:00",
        title: "🍜 日本橋午餐",
        transport: "🚶 步行",
        type: "walk",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Nihonbashi+Restaurants"
    },
    {
        time: "12:00 – 12:40",
        title: "日本橋 → 池袋",
        transport: "🚇 地鐵",
        type: "transit",
        mapUrl: "https://www.google.com/maps/dir/?api=1&origin=Nihombashi+Station&destination=Ikebukuro+Station&travelmode=transit"
    },
    {
        time: "12:40 – 15:00",
        title: "⚡ MEGA TOKYO",
        transport: "🚶 步行",
        type: "walk",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Pokemon+Center+Mega+Tokyo"
    },
    {
        time: "15:00 – 15:30",
        title: "🍰 Pikachu Sweets",
        transport: "🚶 步行",
        type: "walk",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Pikachu+Sweets+by+Pokemon+Cafe"
    },
    {
        time: "16:00 – 17:30",
        title: "🔥 池袋いちば",
        transport: "🚶 步行",
        type: "walk",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Ikebukuro"
    },
    {
        time: "17:30 – 18:00",
        title: "池袋 → 渋谷",
        transport: "🚃 JR 線",
        type: "transit",
        mapUrl: "https://www.google.com/maps/dir/?api=1&origin=Ikebukuro+Station&destination=Shibuya+Parco&travelmode=transit"
    },
    {
        time: "18:00 – 19:30",
        title: "💚 Nintendo TOKYO ＋ ⚡ Pokémon Center",
        transport: "🚶 步行",
        type: "walk",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Nintendo+Tokyo+Shibuya+Parco"
    },
    {
        time: "19:30 – 20:10",
        title: "渋谷 → 錦糸町",
        transport: "🚇 半藏門線",
        type: "transit",
        mapUrl: "https://www.google.com/maps/dir/?api=1&origin=Shibuya+Station&destination=Kinshicho+Station&travelmode=transit"
    }
];

// 動態渲染時間軸
function renderSchedule() {
    const container = document.getElementById('timeline-container');
    container.innerHTML = '';

    scheduleData.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'timeline-item';

        itemEl.innerHTML = `
            <div class="card">
                <div class="card-info">
                    <span class="card-time">${item.time}</span>
                    <span class="card-title">${item.title}</span>
                </div>
                <div class="card-actions">
                    <span class="tag ${item.type}">${item.transport}</span>
                    <a class="nav-btn" href="${item.mapUrl}" target="_blank" title="開啟 Google Maps 導航">
                        <i class="fa-solid fa-diamond-turn-right"></i>
                    </a>
                </div>
            </div>
        `;

        container.appendChild(itemEl);
    });
}

// 頁面載入後自動執行
document.addEventListener('DOMContentLoaded', () => {
    renderSchedule();
});
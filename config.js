// 環境變數配置
// 這個檔案會在 Vercel 部署時自動替換

window.ENV = {
    SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL || 'https://jjazipnkoccgmbpccalf.supabase.co',
    SUPABASE_ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqYXppcG5rb2NjZ21icGNjYWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MDMxOTIsImV4cCI6MjA3MTk3OTE5Mn0.jHH2Jf-gbx0UKqvUgxG-Nx2f_QwVqZBOFqtbAxzYvnY',
    APP_URL: import.meta.env?.VITE_APP_URL || window.location.origin,
    ENVIRONMENT: import.meta.env?.MODE || 'development'
};

// 單例模式 - 全域唯一Supabase客戶端
window.getSupabaseClient = function() {
    if (!window._supabaseClient && window.supabase && window.ENV.SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        window._supabaseClient = window.supabase.createClient(
            window.ENV.SUPABASE_URL,
            window.ENV.SUPABASE_ANON_KEY
        );
        console.log('✅ 單例Supabase客戶端已建立');
    }
    return window._supabaseClient;
};

// 確保 Supabase 已載入並立即初始化
function initSupabaseClient() {
    if (typeof window.supabase !== 'undefined' && window.ENV.SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        // Supabase 已載入，立即建立單例客戶端
        window.getSupabaseClient();
        console.log('🚀 Config.js 已初始化 Supabase 客戶端');
    } else if (window.ENV.SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        // 動態載入 Supabase
        console.log('📦 正在載入 Supabase...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            window.getSupabaseClient();
            console.log('🚀 Supabase 動態載入完成並初始化客戶端');
        };
        document.head.appendChild(script);
    }
}

// 立即嘗試初始化
initSupabaseClient();

// 如果頁面已載入完成但 Supabase 還沒初始化，再試一次
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initSupabaseClient, 100);
    });
} else {
    setTimeout(initSupabaseClient, 100);
}

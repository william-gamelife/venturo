// 環境變數配置
// 這個檔案會在 Vercel 部署時自動替換

window.ENV = {
    SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL',
    SUPABASE_ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
    APP_URL: import.meta.env?.VITE_APP_URL || window.location.origin,
    ENVIRONMENT: import.meta.env?.MODE || 'development'
};

// 確保 Supabase 已載入
if (typeof window.supabase === 'undefined' && window.ENV.SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    // 動態載入 Supabase
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
        window.supabaseClient = window.supabase.createClient(
            window.ENV.SUPABASE_URL,
            window.ENV.SUPABASE_ANON_KEY
        );
        console.log('Supabase 已連接');
    };
    document.head.appendChild(script);
}

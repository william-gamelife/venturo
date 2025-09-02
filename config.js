// 環境變數配置
// 這個檔案會在 Vercel 部署時自動替換

window.ENV = {
    SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL || 'https://jjazipnkoccgmbpccalf.supabase.co',
    SUPABASE_ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqYXppcG5rb2NjZ21icGNjYWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MDMxOTIsImV4cCI6MjA3MTk3OTE5Mn0.jHH2Jf-gbx0UKqvUgxG-Nx2f_QwVqZBOFqtbAxzYvnY',
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

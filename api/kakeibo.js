export default async function handler(req, res) {
  // CORSヘッダー設定（ブラウザの通信規制を解除）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // あなたのGASウェブアプリURL
  const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxX0i3RlNExordqsUB1t5Qxun_rdL5I_s3DSwFPdvLlWU5HjIWmq3AA0xtKcQZbpTn1/exec";

  try {
    const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    // ★ここが超重要★ redirect: 'manual' にして自動追従を止め、迷子を防ぐ
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: bodyData,
      redirect: 'manual' 
    });

    // GASが発行した「処理結果のURL（Location）」を確実に捕まえる
    if (response.status === 302 || response.status === 303) {
      const location = response.headers.get('location');
      if (location) {
        // 結果のURLに直接アクセスしてJSONを取得
        const resultResponse = await fetch(location);
        const data = await resultResponse.json();
        return res.status(200).json(data);
      }
    }
    
    // 万が一リダイレクトされなかった場合
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch(e) {
      return res.status(500).json({ success: false, error: "GASからの応答が不正です: " + text });
    }

  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    return res.status(500).json({ success: false, error: "中継サーバーエラー: " + error.message });
  }
}

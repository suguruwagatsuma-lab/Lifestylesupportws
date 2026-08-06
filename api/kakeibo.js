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
    
    // Vercelサーバーが代わりにGASへ通信し、Google特有のリダイレクト(302)をサーバー内で処理する
    const gasResponse = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: bodyData,
      redirect: 'follow' // ★ここがSafariのエラーを防ぐ一番の魔法です★
    });

    const data = await gasResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    return res.status(500).json({ success: false, error: "中継サーバーエラー: " + error.message });
  }
}

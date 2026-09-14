export const maxDuration = 60; 

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ★GASのWebアプリURL（一生固定）
  const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxX0i3RlNExordqsUB1t5Qxun_rdL5I_s3DSwFPdvLlWU5HjIWmq3AA0xtKcQZbpTn1/exec";

  try {
    const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    // redirect: 'manual' にして Vercel 側で確実にリダイレクト先を捕まえる
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: bodyData,
      redirect: 'manual' 
    });

    if (response.status === 302 || response.status === 303) {
      const location = response.headers.get('location');
      if (location) {
        const resultResponse = await fetch(location);
        const data = await resultResponse.json();
        return res.status(200).json(data);
      }
    }
    
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch(e) {
      return res.status(500).json({ success: false, error: "GAS応答エラー: " + text.substring(0, 100) });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: "中継サーバー通信エラー: " + error.message });
  }
}

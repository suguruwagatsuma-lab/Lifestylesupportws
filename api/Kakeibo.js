// ★Vercelのタイムアウトを60秒に延長し、Safariの通信ブロックを回避する最強設定★
export const maxDuration = 60; 

export default async function handler(req, res) {
  // CORSヘッダー設定（ブラウザの通信規制を解除）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GASのデプロイURL
  const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxX0i3RlNExordqsUB1t5Qxun_rdL5I_s3DSwFPdvLlWU5HjIWmq3AA0xtKcQZbpTn1/exec";

  try {
    const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    // Vercelサーバーが代わりにGASへ通信（Googleの警告ブロックを100%回避）
    const gasResponse = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: bodyData,
      redirect: 'follow'
    });

    const responseText = await gasResponse.text();

    try {
      const data = JSON.parse(responseText);
      return res.status(200).json(data);
    } catch (parseError) {
      console.error("JSON Parse Error:", responseText);
      return res.status(500).json({ 
        success: false, 
        error: "GASからの応答が不正です: " + responseText.substring(0, 100) 
      });
    }

  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    return res.status(500).json({ success: false, error: "中継サーバー通信エラー: " + error.message });
  }
}

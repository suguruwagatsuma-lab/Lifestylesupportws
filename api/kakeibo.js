export const maxDuration = 60; // タイムアウトを60秒に延長して画像解析の途切れを防ぐ

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ★GASのWebアプリURL（新しいデプロイをしてURLが変わったらここを書き換えてください）
  const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxX0i3RlNExordqsUB1t5Qxun_rdL5I_s3DSwFPdvLlWU5HjIWmq3AA0xtKcQZbpTn1/exec";

  try {
    const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    const gasResponse = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'text/plain',
        'User-Agent': 'Vercel-Proxy'
      },
      body: bodyData,
      redirect: 'follow'
    });

    const responseText = await gasResponse.text();

    // 【最強の防御】Googleログイン画面（HTML）を突き返されたら、専用エラーを返す
    if (responseText.includes("<!DOCTYPE html>") && responseText.includes("ppConfig")) {
      return res.status(403).json({
        success: false,
        error: "【権限エラー】GASがGoogleログインを要求してブロックしています。GAS側のデプロイ設定で「アクセスできるユーザー」を必ず『全員』にして、新バージョンとしてデプロイし直してください。"
      });
    }

    try {
      const data = JSON.parse(responseText);
      return res.status(200).json(data);
    } catch (parseError) {
      console.error("JSON Parse Error:", responseText);
      return res.status(500).json({ 
        success: false, 
        error: "GASからの応答が不正です。\n" + responseText.substring(0, 100) 
      });
    }

  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    return res.status(500).json({ success: false, error: "中継サーバー通信エラー: " + error.message });
  }
}

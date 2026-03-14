exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const body = JSON.parse(event.body);
    delete body.fotoData;
    delete body.kimlikData;

    const res = await fetch('https://zciraijmwxcwhryidlki.supabase.co/rest/v1/ogrenciler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'sb_publishable_G1M4C_upyM7SMh59AOEhEA_pJ4MvEou',
        'Authorization': 'Bearer sb_publishable_G1M4C_upyM7SMh59AOEhEA_pJ4MvEou',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ status: 'success' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

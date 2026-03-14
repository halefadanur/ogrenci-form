exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const body = JSON.parse(event.body);
    
    const SUPA_URL = 'https://zciraijmwxcwhryidlki.supabase.co';
    const SUPA_KEY = 'sb_publishable_G1M4C_upyM7SMh59AOEhEA_pJ4MvEou';

    // Fotoğraf yükle
    async function uploadFoto(base64Data, dosyaAdi) {
      try {
        const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64, 'base64');
        const res = await fetch(SUPA_URL + '/storage/v1/object/fotograflar/' + encodeURIComponent(dosyaAdi), {
          method: 'POST',
          headers: {
            'apikey': SUPA_KEY,
            'Authorization': 'Bearer ' + SUPA_KEY,
            'Content-Type': 'image/jpeg',
            'x-upsert': 'true'
          },
          body: buffer
        });
        if (res.ok) return SUPA_URL + '/storage/v1/object/public/fotograflar/' + encodeURIComponent(dosyaAdi);
        return '';
      } catch(e) { return ''; }
    }

    const ad = ((body.ad || '') + '_' + (body.soyad || '') + '_' + (body.gorusme_tarihi || '')).replace(/\s/g, '_');

    if (body.fotoData && body.fotoData.length > 100) {
      body.foto_url = await uploadFoto(body.fotoData, ad + '_foto.jpg');
    }
    if (body.kimlikData && body.kimlikData.length > 100) {
      body.kimlik_url = await uploadFoto(body.kimlikData, ad + '_kimlik.jpg');
    }

    delete body.fotoData;
    delete body.kimlikData;

    const res = await fetch(SUPA_URL + '/rest/v1/ogrenciler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
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

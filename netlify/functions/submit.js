const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zciraijmwxcwhryidlki.supabase.co',
  'sb_publishable_G1M4C_upyM7SMh59AOEhEA_pJ4MvEou'
);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body);
    
    // Fotoğraf varsa Storage'a yükle
    let fotoUrl = '';
    let kimlikUrl = '';
    
    if (body.fotoData && body.fotoData.length > 100) {
      const base64 = body.fotoData.split(',')[1];
      const buffer = Buffer.from(base64, 'base64');
      const dosyaAdi = (body.ad + '_' + body.soyad + '_foto_' + body.gorusme_tarihi + '.jpg').replace(/\s/g, '_');
      const { data } = await supabase.storage.from('fotograflar').upload(dosyaAdi, buffer, { contentType: 'image/jpeg', upsert: true });
      if (data) fotoUrl = 'https://zciraijmwxcwhryidlki.supabase.co/storage/v1/object/public/fotograflar/' + dosyaAdi;
    }

    if (body.kimlikData && body.kimlikData.length > 100) {
      const base64 = body.kimlikData.split(',')[1];
      const buffer = Buffer.from(base64, 'base64');
      const dosyaAdi = (body.ad + '_' + body.soyad + '_kimlik_' + body.gorusme_tarihi + '.jpg').replace(/\s/g, '_');
      const { data } = await supabase.storage.from('fotograflar').upload(dosyaAdi, buffer, { contentType: 'image/jpeg', upsert: true });
      if (data) kimlikUrl = 'https://zciraijmwxcwhryidlki.supabase.co/storage/v1/object/public/fotograflar/' + dosyaAdi;
    }

    delete body.fotoData;
    delete body.kimlikData;
    body.foto_url = fotoUrl;
    body.kimlik_url = kimlikUrl;

    const { error } = await supabase.from('ogrenciler').insert(body);
    if (error) throw error;

    return { statusCode: 200, headers, body: JSON.stringify({ status: 'success' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

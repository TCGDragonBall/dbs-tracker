const { GoogleAuth } = require('google-auth-library');

async function run() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  
  const client = await auth.getClient();
  const projectId = 'pruebas-texelman-1531156071599';
  
  try {
    const enableRes = await client.request({
      url: `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/firebaserules.googleapis.com:enable`,
      method: 'POST'
    });
    console.log("API Enabled:", enableRes.data);
  } catch(e) {
    console.error("Error enabling API:", e.message);
  }
}
run();

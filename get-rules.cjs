const { GoogleAuth } = require('google-auth-library');
async function run() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const projectId = 'pruebas-texelman-1531156071599';
  const url = `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`;
  const res = await client.request({ url });
  console.log(JSON.stringify(res.data, null, 2));
}
run().catch(console.error);

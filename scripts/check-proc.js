const { execSync } = require('child_process');

try {
  const out = execSync('powershell "Get-Process node | Select-Object Id"').toString();
  console.log('Node processes:\n', out);
} catch (e) {
  console.error(e);
}

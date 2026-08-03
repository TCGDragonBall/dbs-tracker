const fs = require('fs');
try {
  require('./dist/assets/index-DaVzL1c-.js');
  console.log("No syntax errors in dist");
} catch(e) {
  console.log("Error loading dist:", e.message);
}

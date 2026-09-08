const admin = require("firebase-admin");
const fs = require("fs");
const appConfig = JSON.parse(fs.readFileSync("firebase-applet-config.json"));

// we can't deploy rules without auth.

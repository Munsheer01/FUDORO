//process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
const admin = require("firebase-admin");
const serviceAccount = require("./fudoro-webapp-firebase-adminsdk-fbsvc-e2cb7b547b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "ZIpMeJzxipaEt5MufO4Ln3Mlp7G2"; // Replace with your UID

admin.auth().setCustomUserClaims(uid, { role: "admin" })
  .then(() => {
    console.log("Admin claim set!");
    process.exit();
  })
  .catch(console.error);
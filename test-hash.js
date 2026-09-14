const { scryptSync, randomBytes } = require("crypto");

const password = "adm123";

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");

console.log(`scrypt$${salt}$${hash}`);
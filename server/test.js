
const path = require("path");

console.log(require('path').basename(__dirname));
console.log(__dirname)
console.log(path.join(__dirname, "..", "out.csv"))
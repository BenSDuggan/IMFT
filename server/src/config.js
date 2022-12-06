// Manage config file

const fs = require('fs')
const os = require('os');

config_path = os.homedir() + "/.config/imft/config.json"

config = {};

let load_config = () => {
    if (fs.existsSync(config_path) || true) {
        let rawdata = fs.readFileSync(config_path);
        config = JSON.parse(rawdata);
    }
}

let save_config = () => {
    let data = JSON.stringify(config);
    fs.writeFileSync(config_path, data);
}

load_config();

module.exports = { config, load_config, save_config }

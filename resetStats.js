const fs = require("fs");

const FILE = "./utils/stats.json";

const WEEK = 7 * 24 * 60 * 60 * 1000;

function load() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({ start: Date.now(), users: {} }, null, 2));
  }

  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function checkWeeklyReset() {
  const data = load();

  if (!data.start) {
    data.start = Date.now();
    data.users = {};
    save(data);
    return data;
  }

  const now = Date.now();

  if (now - data.start >= WEEK) {
    console.log("🔄 RESET SETTIMANALE STATS");

    data.start = now;
    data.users = {}; // 🔥 RESET COMPLETO

    save(data);
  }

  return data;
}

module.exports = { checkWeeklyReset };

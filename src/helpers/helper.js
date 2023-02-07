let crypto = require("crypto");

let generateSalt = (rounds) => {
  if (rounds >= 15) {
    throw new Error(`${rounds} is greater than 15,Must be less that 15`);
  }
  if (typeof rounds !== "number") {
    throw new Error("rounds param must be a number");
  }
  if (rounds == null) {
    rounds = 12;
  }
  return crypto
    .randomBytes(Math.ceil(rounds / 2))
    .toString("hex")
    .slice(0, rounds);
};

let hasher = (password, salt) => {
  let hash = crypto.createHmac("sha512", salt);
  hash.update(password);
  let value = hash.digest("hex");
  return value;
};

let generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const getCookie = (cname, cookie) => {
  let name = cname + "=";
  let ca = cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

module.exports = {
  hasher,
  generateSalt,
  generateRandomToken,
  getCookie,
};

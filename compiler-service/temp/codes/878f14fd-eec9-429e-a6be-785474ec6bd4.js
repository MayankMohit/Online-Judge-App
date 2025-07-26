import fs from "node:fs";

const input = fs.readFileSync(0, "utf8").trim();

const isPrime = (num) => {
    if (num < 2 || (num % 2 === 0 && num !== 2)) return false;
    for (let i = 3, limit = Math.sqrt(num); i <= limit; i += 2) {
        if (num % i === 0) return false;
    }
    return true;
};

const num = parseInt(input, 10);
console.log(isPrime(num) ? "YES" : "NO");

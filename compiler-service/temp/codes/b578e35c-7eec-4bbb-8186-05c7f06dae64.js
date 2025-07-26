const isPrime = (num) => {
    if (num < 2 || (num % 2 === 0 && num !== 2)) return false;
    for (let i = 3, limit = Math.sqrt(num); i <= limit; i += 2) {
        if (num % i === 0) return false;
    }
    return true;
};

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const num = parseInt(input.trim(), 10);
    console.log(isPrime(num) ? "YES" : "NO");
});


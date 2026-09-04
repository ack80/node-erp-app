const n = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9);
const z = [0, 1, 2, 3, 4, 5];
const r = [7, 5, 1, 4, 2, 3, 6];

const paises = ["Venezuela", "Argentina", "EEUU", "Francia"];
console.log(paises)

paises.push("Canada");
console.log(paises);

paises.pop();
console.log(paises);

paises.shift();
console.log(paises);

paises.unshift("Alemania");
console.log(paises);

const p = paises.filter(x => x == "Argentina");
console.log(p);

const numero = z.filter(x => x < 1);
console.log("Metodo filter():", numero);

// Map
const m = z.map((x) => {
    return x * 2
});
console.log("Metodo map():", m);

// Fill
const f = z.fill(10, 20, 30);
console.log("Metodo fill():", f);

// find
const fx = z.find((x) => {
    return x > 4;
});
console.log(`Metodo find(): ${fx}`);

//
const fix = z.findIndex((x) => {
    return x < 1;
});
console.log("Metodo findIndex():", fix);

const sx = z.some(x => x > 4);
console.log("Metodo Some():", sx);

const rz = z.reverse();
console.log("Metodo reverse():", rz);

const ry = r.sort();
console.log("Metodo Sort():", ry);

const jx = z.reverse(z.join('-'));
console.log("Metodo join():", jx);

const flat = [z, n, r];

const flatx = flat.flat();
console.log("Metodo flat():", flatx);

const k = r.keys();
console.log("Metodo key():", k.toArray());

const c = flat.concat();
console.log("Metodo concat():", c);

const fxx = n.forEach(x =>  console.log("Metodo forEach()" , x));

//
const total = z.reduce((sum, n) => sum + n, 0);
console.log("Total:", total);


const unique = [... new Set(flat.flat())];
console.log("Unicos:", unique);
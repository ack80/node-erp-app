
// Fucnion suma dos numeros
function sumar(x, y) {
    const suma = x + y;
    return suma;
}

const suma = sumar(40, 50);
console.log("La suma es:", suma);

// Arrow functions
const sumaArrow = (x, y) => x + y;
console.log("Suma, ArrowFunction:", sumaArrow(25, 25));

//
const multiArrow = (x, y) => {
    multi = x * y;
    return multi;
}
console.log("Multi, ArrowFunction:", multiArrow(4, 5));

const saludar = setTimeout((nombre = "Sapin") => console.log(`Hola, ${nombre}`), 10000);
const welcome = setInterval((name = "Adonay...") => (console.log("Welcome:", name )), 1000)

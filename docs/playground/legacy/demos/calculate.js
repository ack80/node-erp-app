// Math operators
const add = (x, y) => x + y;
const rest = (x, y) => x > y ? x - y : `✖️ Error, El minuendo: ${x} debe ser mayor al sustraendo: ${y}`;
const multi = (x, y) => x * y;
const div = (x, y) => y > 0 ? x / y : `✖️ Error, El numero: ${y} usado como denominador, debe ser mayor a 0`;
const mod = (x, y) => y > 0 && x % y == 0 ? `✔️ La division de ${x} / ${y} es Par: ${x / y}` : `✖️ La division es impar`; 
const exp = (x, y) => x ** y;

module.exports = {add, rest, multi, div, mod, exp};
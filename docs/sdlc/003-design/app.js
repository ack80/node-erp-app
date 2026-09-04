require("../server.js");

console.log("\n");

// const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const events = require("events");
const stream = require("stream");
const util = require("util");
const calc = require("../src/modules/calculate.js");

// Welcome mesage
console.log("Hello, node.js...");
console.log("\n");

// functions call
const s = calc.add(45, 5);
const r = calc.rest(5, 10);
const m = calc.multi(45, 5);
const d = calc.div(45, -7);
const e = calc.exp(45, 5);
const p = calc.mod(100, 5)

// out 
console.log("Suma:", s);
console.log("Resta:", r);
console.log("Multiplicacion:", m);
console.log("Division:", d);
console.log("Exponente:", e);
console.log("Modulo:", p);

// out
console.log("\n");









// variable json
const jsonData = JSON.stringify({
    name: "Douglas",
    last: "Rujana"
});

// Objeto 
const objPerson = {
    name: "Douglas",
    last: "Rujana",
    address: "Bellavista"
}

// Object to Json
const jsonPerson = JSON.stringify(objPerson);

//
let data = JSON.parse(jsonData);

// out 
console.log("Objeto:", objPerson);
console.log("\n");
console.log("JSON:", jsonPerson);
console.log("\n");
console.log("Data:", data);

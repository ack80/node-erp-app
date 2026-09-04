//
const persona = {
    cedula: 12789653,
    pais: "Venezuela",
    nombre: "Douglas",
    apellido: "Rujana",
    edad: 1975 - Date('YYYY'),
    peso: 65,
    estatura: 1.65,
}

//
console.log("Persona:", persona);
console.log(persona.nombre);
console.log(persona.apellido);
console.log(Object.keys(persona));
console.log(Object.values(persona));
console.log(Object.entries(persona));
console.log(Object.assign({}, persona));

//
const {cedual, estatura} = persona;
console.log("Estatura:", estatura);

//
const newPersona = {...persona };
console.log( newPersona);

//
const jsonPersonas = JSON.stringify(persona);
console.log("JSON:", jsonPersonas);


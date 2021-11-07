let cant = process.argv[2];

const randoms = () => {
    let numeros = {};
    for(let i = 0; i <= cant; i++){
        let random = Math.floor(Math.random() * (1001 -  1) + 1);
        let existe = numeros[random];
        if(existe){
            numeros[random] = existe + 1;
        }else{
            numeros[random] = 1;
        }
    }
    return numeros;
}

process.on('message', msg => {
    const numeros = randoms()
    process.send(numeros)
})

document.addEventListener("DOMContentLoaded", function () {
    const socket = io();

    /* Chat */
    const msj = document.querySelector("#mensaje");
    const email = document.querySelector('#email');
    const envio = document.querySelector('#enviar-msg');
    const tipo = document.querySelector('#tipo');
    const mensajes = [];

    socket.on("mensaje-inicial", (data) => {
        mensajes.push(data.mensajes);    
        $('#chat').html('');    
        data.mensajes.forEach(e =>{
            $('#chat').append(
                `<div class="mensaje">
                    <p class="mensaje-datos"><span class="mensaje-email">${e.message.email}</span> <span class="mensaje-fecha">${e.message.dateStr}</span></p>
                    <p class="mensaje-texto">${e.message.value}</p>
                </div>`
            );
        });                    
    });

    // Recibo el mensajo del servidor y lo renderizo
    socket.on("actualizar-chat", (data) => {           
        mensajes[0].push(data);    
        $('#chat').html('');    
        console.log(mensajes);
        mensajes[0].forEach(e =>{
            $('#chat').append(
                `<div class="mensaje">
                    <p class="mensaje-datos"><span class="mensaje-email">${e.message.email}</span> <span class="mensaje-fecha">${e.message.dateStr}</span></p>
                    <p class="mensaje-texto">${e.message.value}</p>
                </div>`
            );
        });   
    });

    //Envio el mensaje al servidor
    envio.addEventListener("click", (e) => {
        let date = new Date();
        let dateStr =
        ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
        ("00" + date.getDate()).slice(-2) + "/" +
        date.getFullYear() + " " +
        ("00" + date.getHours()).slice(-2) + ":" +
        ("00" + date.getMinutes()).slice(-2) + ":" +
        ("00" + date.getSeconds()).slice(-2);

        $(email).removeClass('required');
        if (email.value == '') {
            $(email).addClass('required');
        }else{
            socket.emit("mensaje-nuevo", { value: msj.value, email: email.value, tipo: tipo.value, dateStr });
            msj.value = "";
        }
    });
    

    /* Manejar productos */
    /*
    socket.on("productos", (data) => {
        // Reiniciar las clases y el html
        $('#tabla-productos').removeClass('activar');
        $('#sin-productos').removeClass('activar');
        $('#tabla-productos tbody').html('');

        // Activar la vista correspondiente
        if(data.productos.cantidad > 0){
            $('#tabla-productos').addClass('activar');
        }else{
            $('#sin-productos').addClass('activar');
        }

        // Renderizar productos
        $('#cantidad').html(data.productos.cantidad);
        data.productos.items.forEach(e =>{
            $('#tabla-productos tbody').append(
                `<tr>
                    <td>${e.codigo}</td>
                    <td>${e.title}</td>
                    <td>${e.descripcion}</td>
                    <td>${e.price}</td>
                    <td>${e.stock}</td>                
                    <td><img src="${e.thumbnail}" /></td>
                </tr>`
            );
        });        
    });
    */
});
  

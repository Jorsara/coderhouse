document.addEventListener("DOMContentLoaded", function () {
    const socket = io();
   
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

        // Enviar información al html
        $('#cantidad').html(data.productos.cantidad)
        data.productos.items.forEach(e =>{
            $('#tabla-productos tbody').append(
                `<tr>
                    <td>${e.title}</td>
                    <td>${e.price}</td>
                    <td><img src="${e.thumbnail}" /></td>
                </tr>`
            );
        });        
    });
});
  

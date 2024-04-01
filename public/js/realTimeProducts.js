const socket = io();

socket.on('newProduct', (product) => {  // Agregar el nuevo producto al HTML
  const listaProductos = document.getElementById('productsFeed');  
  listaProductos.innerHTML += `
  <div class="col-md-3 my-4">
    <div class="card alturaCaja img-product">
      <img src=${product.thumbnail} class="card-img-top" alt=${product.title} />
      <div class="card-body">
        <h6 class="card-text text-center">${product.title}</h6>
        <h4 class="text-center">$ ${product.price}</h4>
      </div>
      <button class="btn btn-secondary text-center btn-eliminarProd" id="${product.id}">Eliminar</button>
    </div>
  </div>` 
});

// socket.on('newProduct', (product) => {  // Agregar el nuevo producto al HTML
//   const listaProductos = document.getElementById('productsFeed');  
//   const newRow = listaProductos.querySelector('.row:last-child');

//   // Verificar si existe una fila existente
//   if (!newRow) {
//     // Si no existe, crea una nueva fila
//     newRow = document.createElement('div');
//     newRow.classList.add('row');
//     listaProductos.appendChild(newRow);
//   }

//   // Agregar el nuevo producto al final de la fila
//   newRow.insertAdjacentHTML('beforeend', `
//        <div class="col-md-3 my-4">
//          <div class="card alturaCaja img-product">
//            <img src=${product.thumbnail} class="card-img-top" alt=${product.title} />
//            <div class="card-body">
//              <h6 class="card-text text-center">${product.title}</h6>
//              <h4 class="text-center">$ ${product.price}</h4>
//            </div>
//            <button class="btn btn-secondary text-center btn-eliminarProd" id="${product.id}">Eliminar</button>
//          </div>
//        </div>`
//   );
// });

// const listaProductos = document.getElementById('productsFeed');
// listaProductos.addEventListener('click', (event) => {
//   if (event.target.classList.contains('btn-eliminarProd')) {
//     const productId = event.target.getAttribute('id');
//     console.log('Product ID to delete:', productId);
//     socket.emit('deleteProduct', productId); // Emito evento 'deleteProduct' al servidor para borrar el producto
//   }
// });

document.addEventListener("DOMContentLoaded", function () {    
  const allDeleteButtons = document.querySelectorAll(".btn-eliminarProd")
  allDeleteButtons.forEach(btn => {
      btn.addEventListener("click", function () {           
          socket.emit('deleteProduct', `${btn.id}`) // Emito evento 'deleteProduct' al servidor para borrar el producto
      });
  });
})

// Escucho el evento de 'productDeleted' proveniente del servidor y actualizo la vista '/realtimeproducts' eliminando el producto
socket.on('productDeleted', (productId) => {
  const productToDelete = document.getElementById(productId);
  if (productToDelete) {
    productToDelete.remove();
  }
});
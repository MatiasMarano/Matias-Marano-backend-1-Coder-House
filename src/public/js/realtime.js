// public/js/realtime.js
const socket = io();

// Renderizar productos en la lista
socket.on("updateProducts", (products) => {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  products.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${p.title} - $${p.price}`;

    // Boton eliminar
    const btn = document.createElement("button");
    btn.textContent = "Eliminar";
    btn.addEventListener("click", () => {
      socket.emit("deleteProduct", p.id);
    }); 

    li.appendChild(btn);
    productList.appendChild(li);
  });
});

// Captura del formulario
const form = document.getElementById("productForm");
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const code = document.getElementById("code").value;
  const price = parseFloat(document.getElementById("price").value);
  const stock = parseInt(document.getElementById("stock").value);
  const category = document.getElementById("category").value;

  socket.emit("newProduct", {
    title,
    description,
    code,
    price,
    stock,
    category,
    status: true,
    thumbnails: []
  });

  form.reset();
});

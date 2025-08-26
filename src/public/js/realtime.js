const socket = io();

// productos en la lista
socket.on("updateProducts", (products) => {
  const productList = document.getElementById("productList");
  productList.innerHTML = products.map(p => `
    <li data-id="${p.id}">
      ${p.title} - $${p.price}
      <button class="deleteBtn">Eliminar</button>
    </li>
  `).join("");
});

// eliminar
document.getElementById("productList").addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteBtn")) {
    const id = e.target.closest("li").dataset.id;
    socket.emit("deleteProduct", Number(id));
  }
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

// Sistema de almacenamiento local
class Storage {
    static guardar(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static obtener(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
}

// Datos de la aplicación
let ingredientes = Storage.obtener('ingredientes') || [];
let productos = Storage.obtener('productos') || [];
let productoActual = null;
let presupuestoActual = [];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    inicializarNavegacion();
    inicializarIngredientes();
    inicializarProductos();
    inicializarPresupuestos();
    cargarIngredientes();
    cargarProductos();
});

// NAVEGACIÓN
function inicializarNavegacion() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Cambiar tabs activos
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Cambiar secciones activas
            document.querySelectorAll('.seccion').forEach(s => s.classList.remove('active'));
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// INGREDIENTES
function inicializarIngredientes() {
    document.getElementById('agregarIngrediente').addEventListener('click', agregarIngrediente);
}

function agregarIngrediente() {
    const nombre = document.getElementById('nombreIngrediente').value.trim();
    const precioKg = parseFloat(document.getElementById('precioKg').value);

    if (!nombre || !precioKg || precioKg <= 0) {
        alert('Por favor complete todos los campos correctamente');
        return;
    }

    const ingrediente = {
        id: Date.now(),
        nombre: nombre,
        precioKg: precioKg
    };

    ingredientes.push(ingrediente);
    Storage.guardar('ingredientes', ingredientes);

    document.getElementById('nombreIngrediente').value = '';
    document.getElementById('precioKg').value = '';

    cargarIngredientes();
    actualizarSelectIngredientes();
}

function cargarIngredientes() {
    const lista = document.getElementById('listaIngredientes');
    lista.innerHTML = '';

    if (ingredientes.length === 0) {
        lista.innerHTML = '<p class="mensaje-vacio">No hay ingredientes agregados</p>';
        return;
    }

    ingredientes.forEach(ing => {
        const div = document.createElement('div');
        div.className = 'item-ingrediente';
        div.innerHTML = `
            <div class="info-ingrediente">
                <strong>${ing.nombre}</strong>
                <span>$${ing.precioKg.toFixed(2)} / Kg</span>
            </div>
            <button class="btn-eliminar" onclick="eliminarIngrediente(${ing.id})">🗑️</button>
        `;
        lista.appendChild(div);
    });
}

function eliminarIngrediente(id) {
    if (confirm('¿Eliminar este ingrediente?')) {
        ingredientes = ingredientes.filter(i => i.id !== id);
        Storage.guardar('ingredientes', ingredientes);
        cargarIngredientes();
        actualizarSelectIngredientes();
    }
}

// PRODUCTOS
function inicializarProductos() {
    document.getElementById('crearProducto').addEventListener('click', crearProducto);
    document.getElementById('agregarIngredienteProducto').addEventListener('click', agregarIngredienteProducto);
    document.getElementById('guardarProducto').addEventListener('click', guardarProducto);
}

function crearProducto() {
    const nombre = document.getElementById('nombreProducto').value.trim();
    const margen = parseFloat(document.getElementById('margenGanancia').value);

    if (!nombre || !margen || margen < 0) {
        alert('Por favor complete todos los campos correctamente');
        return;
    }

    productoActual = {
        id: Date.now(),
        nombre: nombre,
        margenGanancia: margen,
        ingredientes: [],
        costoTotal: 0,
        precioPublico: 0
    };

    document.getElementById('nombreProductoActual').textContent = nombre;
    document.getElementById('productoActual').style.display = 'block';
    document.getElementById('nombreProducto').value = '';

    actualizarSelectIngredientes();
    actualizarIngredientesProducto();
}

function actualizarSelectIngredientes() {
    const select = document.getElementById('selectIngrediente');
    select.innerHTML = '<option value="">Seleccione ingrediente</option>';

    ingredientes.forEach(ing => {
        const option = document.createElement('option');
        option.value = ing.id;
        option.textContent = `${ing.nombre} ($${ing.precioKg.toFixed(2)}/Kg)`;
        select.appendChild(option);
    });
}

function agregarIngredienteProducto() {
    const selectId = parseInt(document.getElementById('selectIngrediente').value);
    const gramos = parseFloat(document.getElementById('cantidadGramos').value);

    if (!selectId || !gramos || gramos <= 0) {
        alert('Seleccione un ingrediente y especifique la cantidad');
        return;
    }

    const ingrediente = ingredientes.find(i => i.id === selectId);
    if (!ingrediente) return;

    const kilos = gramos / 1000;
    const costo = ingrediente.precioKg * kilos;

    productoActual.ingredientes.push({
        ingredienteId: ingrediente.id,
        nombre: ingrediente.nombre,
        gramos: gramos,
        precioKg: ingrediente.precioKg,
        costo: costo
    });

    document.getElementById('selectIngrediente').value = '';
    document.getElementById('cantidadGramos').value = '';

    calcularPreciosProducto();
    actualizarIngredientesProducto();
}

function actualizarIngredientesProducto() {
    const lista = document.getElementById('ingredientesProducto');
    lista.innerHTML = '';

    if (!productoActual || productoActual.ingredientes.length === 0) {
        lista.innerHTML = '<p class="mensaje-vacio">No hay ingredientes agregados</p>';
        return;
    }

    productoActual.ingredientes.forEach((ing, index) => {
        const div = document.createElement('div');
        div.className = 'item-ingrediente-producto';
        div.innerHTML = `
            <div class="info-ingrediente-producto">
                <strong>${ing.nombre}</strong>
                <span>${ing.gramos}g - $${ing.costo.toFixed(2)}</span>
            </div>
            <button class="btn-eliminar" onclick="eliminarIngredienteProducto(${index})">🗑️</button>
        `;
        lista.appendChild(div);
    });
}

function eliminarIngredienteProducto(index) {
    productoActual.ingredientes.splice(index, 1);
    calcularPreciosProducto();
    actualizarIngredientesProducto();
}

function calcularPreciosProducto() {
    productoActual.costoTotal = productoActual.ingredientes.reduce((sum, ing) => sum + ing.costo, 0);
    productoActual.precioPublico = productoActual.costoTotal * (1 + productoActual.margenGanancia / 100);

    document.getElementById('costoTotal').textContent = productoActual.costoTotal.toFixed(2);
    document.getElementById('precioPublico').textContent = productoActual.precioPublico.toFixed(2);
}

function guardarProducto() {
    if (!productoActual || productoActual.ingredientes.length === 0) {
        alert('Agregue al menos un ingrediente al producto');
        return;
    }

    // Verificar si ya existe el producto (edición)
    const existente = productos.findIndex(p => p.id === productoActual.id);
    if (existente >= 0) {
        productos[existente] = productoActual;
    } else {
        productos.push(productoActual);
    }

    Storage.guardar('productos', productos);

    document.getElementById('productoActual').style.display = 'none';
    productoActual = null;

    cargarProductos();
    cargarProductosPresupuesto();
    alert('Producto guardado exitosamente');
}

function cargarProductos() {
    const lista = document.getElementById('listaProductos');
    lista.innerHTML = '';

    if (productos.length === 0) {
        lista.innerHTML = '<p class="mensaje-vacio">No hay productos creados</p>';
        return;
    }

    productos.forEach(prod => {
        const div = document.createElement('div');
        div.className = 'item-producto';
        div.innerHTML = `
            <div class="info-producto">
                <strong>${prod.nombre}</strong>
                <span>Precio: $${prod.precioPublico.toFixed(2)}</span>
                <small>${prod.ingredientes.length} ingredientes</small>
            </div>
            <div class="botones-producto">
                <button class="btn-editar" onclick="editarProducto(${prod.id})">✏️</button>
                <button class="btn-eliminar" onclick="eliminarProducto(${prod.id})">🗑️</button>
            </div>
        `;
        lista.appendChild(div);
    });
}

function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    productoActual = JSON.parse(JSON.stringify(producto)); // Copia profunda

    document.getElementById('nombreProductoActual').textContent = producto.nombre;
    document.getElementById('productoActual').style.display = 'block';

    actualizarSelectIngredientes();
    calcularPreciosProducto();
    actualizarIngredientesProducto();
}

function eliminarProducto(id) {
    if (confirm('¿Eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        Storage.guardar('productos', productos);
        cargarProductos();
        cargarProductosPresupuesto();
    }
}

// PRESUPUESTOS
function inicializarPresupuestos() {
    document.getElementById('generarPresupuesto').addEventListener('click', generarPresupuesto);
    document.getElementById('compartirPresupuesto').addEventListener('click', compartirPresupuesto);

    // Modal
    const modal = document.getElementById('modalPresupuesto');
    const closeBtn = document.querySelector('.close');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    cargarProductosPresupuesto();
}

function cargarProductosPresupuesto() {
    const lista = document.getElementById('listaProductosPresupuesto');
    lista.innerHTML = '';

    if (productos.length === 0) {
        lista.innerHTML = '<p class="mensaje-vacio">No hay productos disponibles. Cree productos primero.</p>';
        return;
    }

    productos.forEach(prod => {
        const div = document.createElement('div');
        div.className = 'item-producto-presupuesto';
        div.innerHTML = `
            <div class="info-producto-presupuesto">
                <input type="checkbox" id="check-${prod.id}" value="${prod.id}" onchange="actualizarTotalPresupuesto()">
                <label for="check-${prod.id}">
                    <strong>${prod.nombre}</strong>
                    <span>$${prod.precioPublico.toFixed(2)}</span>
                </label>
            </div>
            <input type="number" id="qty-${prod.id}" placeholder="Cant." value="1" min="1" class="cantidad-producto" onchange="actualizarTotalPresupuesto()">
        `;
        lista.appendChild(div);
    });
}

function actualizarTotalPresupuesto() {
    let total = 0;
    presupuestoActual = [];

    productos.forEach(prod => {
        const checkbox = document.getElementById(`check-${prod.id}`);
        const cantidad = parseInt(document.getElementById(`qty-${prod.id}`).value) || 1;

        if (checkbox && checkbox.checked) {
            const subtotal = prod.precioPublico * cantidad;
            total += subtotal;

            presupuestoActual.push({
                producto: prod.nombre,
                cantidad: cantidad,
                precioUnitario: prod.precioPublico,
                subtotal: subtotal
            });
        }
    });

    document.getElementById('totalPresupuesto').textContent = total.toFixed(2);
}

function generarPresupuesto() {
    const cliente = document.getElementById('nombreCliente').value.trim();
    const logoUrl = document.getElementById('logoUrl').value.trim();

    if (!cliente) {
        alert('Ingrese el nombre del cliente');
        return;
    }

    if (presupuestoActual.length === 0) {
        alert('Seleccione al menos un producto');
        return;
    }

    const fecha = new Date().toLocaleDateString('es-AR');
    const total = presupuestoActual.reduce((sum, item) => sum + item.subtotal, 0);

    let html = `
        <div class="presupuesto-generado">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo-presupuesto">` : ''}
            <h2>Presupuesto de Pastelería</h2>
            <div class="info-presupuesto">
                <p><strong>Cliente:</strong> ${cliente}</p>
                <p><strong>Fecha:</strong> ${fecha}</p>
            </div>
            <table class="tabla-presupuesto">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>P. Unit.</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
    `;

    presupuestoActual.forEach(item => {
        html += `
            <tr>
                <td>${item.producto}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precioUnitario.toFixed(2)}</td>
                <td>$${item.subtotal.toFixed(2)}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3"><strong>TOTAL</strong></td>
                        <td><strong>$${total.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
            <div class="nota-presupuesto">
                <p>Gracias por su preferencia</p>
            </div>
        </div>
    `;

    document.getElementById('vistaPresupuesto').innerHTML = html;
    document.getElementById('modalPresupuesto').style.display = 'block';
}

function compartirPresupuesto() {
    const cliente = document.getElementById('nombreCliente').value.trim();

    if (!cliente || presupuestoActual.length === 0) {
        alert('Genere el presupuesto primero');
        return;
    }

    const fecha = new Date().toLocaleDateString('es-AR');
    const total = presupuestoActual.reduce((sum, item) => sum + item.subtotal, 0);

    let mensaje = `*Presupuesto de Pastelería*\n\n`;
    mensaje += `Cliente: ${cliente}\n`;
    mensaje += `Fecha: ${fecha}\n\n`;
    mensaje += `*Detalle del Pedido:*\n`;

    presupuestoActual.forEach(item => {
        mensaje += `\n${item.producto}\n`;
        mensaje += `  Cantidad: ${item.cantidad}\n`;
        mensaje += `  Precio unitario: $${item.precioUnitario.toFixed(2)}\n`;
        mensaje += `  Subtotal: $${item.subtotal.toFixed(2)}\n`;
    });

    mensaje += `\n*TOTAL: $${total.toFixed(2)}*\n\n`;
    mensaje += `Gracias por su preferencia`;

    // Compartir via Web Share API (disponible en Android)
    if (navigator.share) {
        navigator.share({
            title: 'Presupuesto de Pastelería',
            text: mensaje
        }).catch(err => console.log('Error al compartir', err));
    } else {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(mensaje).then(() => {
            alert('Presupuesto copiado al portapapeles');
        }).catch(() => {
            // Fallback para navegadores antiguos
            const textarea = document.createElement('textarea');
            textarea.value = mensaje;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('Presupuesto copiado al portapapeles');
        });
    }
}

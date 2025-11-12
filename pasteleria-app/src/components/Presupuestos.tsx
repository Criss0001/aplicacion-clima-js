import { useState, useEffect } from 'react';
import type { Producto, Ingrediente } from '../types';
import { storage } from '../utils/storage';
import { calcularCostoProducto, formatearMoneda } from '../utils/calculations';

interface ProductoPresupuesto {
  productoId: string;
  cantidad: number;
}

export default function Presupuestos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [cliente, setCliente] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState<
    ProductoPresupuesto[]
  >([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState('1');
  const [negocio, setNegocio] = useState({ nombre: 'Mi Pastelería', telefono: '' });
  const [logo, setLogo] = useState<string | null>(null);
  const [mostrarConfig, setMostrarConfig] = useState(false);

  useEffect(() => {
    setProductos(storage.getProductos());
    setIngredientes(storage.getIngredientes());
    setNegocio(storage.getNegocio());
    setLogo(storage.getLogo());
  }, []);

  const agregarProducto = () => {
    if (!productoSeleccionado || !cantidadProducto) {
      alert('Selecciona un producto y cantidad');
      return;
    }

    const yaExiste = productosSeleccionados.find(
      (p) => p.productoId === productoSeleccionado
    );

    if (yaExiste) {
      setProductosSeleccionados(
        productosSeleccionados.map((p) =>
          p.productoId === productoSeleccionado
            ? { ...p, cantidad: p.cantidad + parseInt(cantidadProducto) }
            : p
        )
      );
    } else {
      setProductosSeleccionados([
        ...productosSeleccionados,
        {
          productoId: productoSeleccionado,
          cantidad: parseInt(cantidadProducto),
        },
      ]);
    }

    setProductoSeleccionado('');
    setCantidadProducto('1');
  };

  const eliminarProducto = (productoId: string) => {
    setProductosSeleccionados(
      productosSeleccionados.filter((p) => p.productoId !== productoId)
    );
  };

  const calcularTotal = () => {
    let total = 0;
    productosSeleccionados.forEach((pp) => {
      const producto = productos.find((p) => p.id === pp.productoId);
      if (producto) {
        const { precioFinal } = calcularCostoProducto(producto, ingredientes);
        total += precioFinal * pp.cantidad;
      }
    });
    return total;
  };

  const obtenerNombreProducto = (id: string) => {
    return productos.find((p) => p.id === id)?.nombre || 'Desconocido';
  };

  const guardarConfiguracion = () => {
    storage.saveNegocio(negocio);
    alert('Configuración guardada');
    setMostrarConfig(false);
  };

  const cargarLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const logoBase64 = reader.result as string;
        setLogo(logoBase64);
        storage.saveLogo(logoBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const generarPresupuesto = () => {
    if (!cliente || productosSeleccionados.length === 0) {
      alert('Por favor ingresa el nombre del cliente y agrega productos');
      return;
    }

    const total = calcularTotal();
    const fecha = new Date().toLocaleDateString('es-AR');

    let mensaje = `*${negocio.nombre}*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    mensaje += `📅 Fecha: ${fecha}\n`;
    mensaje += `👤 Cliente: ${cliente}\n\n`;
    mensaje += `*DETALLE DEL PEDIDO:*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    productosSeleccionados.forEach((pp) => {
      const producto = productos.find((p) => p.id === pp.productoId);
      if (producto) {
        const { precioFinal } = calcularCostoProducto(producto, ingredientes);
        const subtotal = precioFinal * pp.cantidad;
        mensaje += `🧁 ${producto.nombre}\n`;
        mensaje += `   Cantidad: ${pp.cantidad}\n`;
        mensaje += `   Precio unitario: ${formatearMoneda(precioFinal)}\n`;
        mensaje += `   Subtotal: ${formatearMoneda(subtotal)}\n\n`;
      }
    });

    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `*TOTAL: ${formatearMoneda(total)}*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    mensaje += `¡Gracias por tu preferencia! 💕`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/?text=${mensajeCodificado}`;
    
    window.open(urlWhatsApp, '_blank');
  };

  const limpiarPresupuesto = () => {
    setCliente('');
    setProductosSeleccionados([]);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📋 Presupuestos</h2>
        <button
          onClick={() => setMostrarConfig(!mostrarConfig)}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
        >
          ⚙️
        </button>
      </div>

      {mostrarConfig && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Configuración del Negocio
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre del negocio"
              value={negocio.nombre}
              onChange={(e) => setNegocio({ ...negocio, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <input
              type="tel"
              placeholder="Teléfono (opcional)"
              value={negocio.telefono}
              onChange={(e) => setNegocio({ ...negocio, telefono: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={cargarLogo}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {logo && (
                <img
                  src={logo}
                  alt="Logo"
                  className="mt-2 h-20 object-contain"
                />
              )}
            </div>
            <button
              onClick={guardarConfiguracion}
              className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              💾 Guardar Configuración
            </button>
          </div>
        </div>
      )}

      {productos.length === 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          ⚠️ Primero debes agregar productos en la sección de Productos
        </div>
      )}

      {productos.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <input
              type="text"
              placeholder="Nombre del cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-3"
            />

            <div className="flex gap-2 mb-3">
              <select
                value={productoSeleccionado}
                onChange={(e) => setProductoSeleccionado(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Seleccionar producto</option>
                {productos.map((prod) => {
                  const { precioFinal } = calcularCostoProducto(prod, ingredientes);
                  return (
                    <option key={prod.id} value={prod.id}>
                      {prod.nombre} - {formatearMoneda(precioFinal)}
                    </option>
                  );
                })}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Cant."
                value={cantidadProducto}
                onChange={(e) => setCantidadProducto(e.target.value)}
                className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                onClick={agregarProducto}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                +
              </button>
            </div>

            {productosSeleccionados.length > 0 && (
              <div className="border-t pt-3 mt-3">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Productos en el presupuesto:
                </h4>
                <div className="space-y-2 mb-3">
                  {productosSeleccionados.map((pp) => {
                    const producto = productos.find((p) => p.id === pp.productoId);
                    if (!producto) return null;
                    const { precioFinal } = calcularCostoProducto(
                      producto,
                      ingredientes
                    );
                    const subtotal = precioFinal * pp.cantidad;
                    return (
                      <div
                        key={pp.productoId}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {obtenerNombreProducto(pp.productoId)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {pp.cantidad} x {formatearMoneda(precioFinal)} ={' '}
                            <span className="font-semibold">
                              {formatearMoneda(subtotal)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => eliminarProducto(pp.productoId)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-gray-800">TOTAL:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatearMoneda(calcularTotal())}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={generarPresupuesto}
                      className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                    >
                      📤 Enviar por WhatsApp
                    </button>
                    <button
                      onClick={limpiarPresupuesto}
                      className="bg-gray-400 text-white px-4 py-3 rounded-lg hover:bg-gray-500 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import type { Producto, Ingrediente, IngredienteProducto } from '../types';
import { storage } from '../utils/storage';
import { calcularCostoProducto, formatearMoneda } from '../utils/calculations';

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    margenGanancia: '50',
    ingredientes: [] as IngredienteProducto[],
  });
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState('');
  const [cantidadIngrediente, setCantidadIngrediente] = useState('');

  useEffect(() => {
    setProductos(storage.getProductos());
    setIngredientes(storage.getIngredientes());
  }, []);

  const agregarIngrediente = () => {
    if (!ingredienteSeleccionado || !cantidadIngrediente) {
      alert('Selecciona un ingrediente y cantidad');
      return;
    }

    const yaExiste = form.ingredientes.find(
      (i) => i.ingredienteId === ingredienteSeleccionado
    );

    if (yaExiste) {
      alert('Este ingrediente ya está agregado');
      return;
    }

    setForm({
      ...form,
      ingredientes: [
        ...form.ingredientes,
        {
          ingredienteId: ingredienteSeleccionado,
          cantidad: parseFloat(cantidadIngrediente),
        },
      ],
    });

    setIngredienteSeleccionado('');
    setCantidadIngrediente('');
  };

  const eliminarIngredienteForm = (ingredienteId: string) => {
    setForm({
      ...form,
      ingredientes: form.ingredientes.filter((i) => i.ingredienteId !== ingredienteId),
    });
  };

  const guardarProducto = () => {
    if (!form.nombre || form.ingredientes.length === 0) {
      alert('Por favor completa el nombre y agrega al menos un ingrediente');
      return;
    }

    const nuevoProducto: Producto = {
      id: editando || Date.now().toString(),
      nombre: form.nombre,
      ingredientes: form.ingredientes,
      margenGanancia: parseFloat(form.margenGanancia),
    };

    const { costoTotal, precioFinal } = calcularCostoProducto(
      nuevoProducto,
      ingredientes
    );
    nuevoProducto.costoTotal = costoTotal;
    nuevoProducto.precioFinal = precioFinal;

    let nuevosProductos;
    if (editando) {
      nuevosProductos = productos.map((p) =>
        p.id === editando ? nuevoProducto : p
      );
    } else {
      nuevosProductos = [...productos, nuevoProducto];
    }

    setProductos(nuevosProductos);
    storage.saveProductos(nuevosProductos);
    resetForm();
  };

  const eliminarProducto = (id: string) => {
    if (confirm('¿Estás segura de eliminar este producto?')) {
      const nuevosProductos = productos.filter((p) => p.id !== id);
      setProductos(nuevosProductos);
      storage.saveProductos(nuevosProductos);
    }
  };

  const editarProducto = (producto: Producto) => {
    setForm({
      nombre: producto.nombre,
      margenGanancia: producto.margenGanancia.toString(),
      ingredientes: producto.ingredientes,
    });
    setEditando(producto.id);
    setMostrarForm(true);
  };

  const resetForm = () => {
    setForm({ nombre: '', margenGanancia: '50', ingredientes: [] });
    setEditando(null);
    setMostrarForm(false);
    setIngredienteSeleccionado('');
    setCantidadIngrediente('');
  };

  const obtenerNombreIngrediente = (id: string) => {
    return ingredientes.find((i) => i.id === id)?.nombre || 'Desconocido';
  };

  const obtenerUnidadIngrediente = (id: string) => {
    return ingredientes.find((i) => i.id === id)?.unidad || 'kg';
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🧁 Productos</h2>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-600 transition"
        >
          {mostrarForm ? '✕ Cancelar' : '+ Agregar'}
        </button>
      </div>

      {ingredientes.length === 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          ⚠️ Primero debes agregar ingredientes en la sección de Ingredientes
        </div>
      )}

      {mostrarForm && ingredientes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            {editando ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre del producto (ej: Brownies)"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <input
              type="number"
              placeholder="Margen de ganancia (%)"
              value={form.margenGanancia}
              onChange={(e) => setForm({ ...form, margenGanancia: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />

            <div className="border-t pt-3 mt-3">
              <h4 className="font-semibold text-gray-700 mb-2">Ingredientes</h4>
              <div className="flex gap-2 mb-3">
                <select
                  value={ingredienteSeleccionado}
                  onChange={(e) => setIngredienteSeleccionado(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Seleccionar ingrediente</option>
                  {ingredientes.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.nombre} (${ing.precioKg}/{ing.unidad})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={cantidadIngrediente}
                  onChange={(e) => setCantidadIngrediente(e.target.value)}
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  onClick={agregarIngrediente}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  +
                </button>
              </div>

              {form.ingredientes.length > 0 && (
                <div className="space-y-2">
                  {form.ingredientes.map((ing) => (
                    <div
                      key={ing.ingredienteId}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm">
                        {obtenerNombreIngrediente(ing.ingredienteId)} -{' '}
                        {ing.cantidad} {obtenerUnidadIngrediente(ing.ingredienteId)}
                      </span>
                      <button
                        onClick={() => eliminarIngredienteForm(ing.ingredienteId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={guardarProducto}
              className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              {editando ? '💾 Actualizar' : '💾 Guardar'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {productos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay productos. ¡Agrega el primero!
          </div>
        ) : (
          productos.map((producto) => {
            const { costoTotal, precioFinal } = calcularCostoProducto(
              producto,
              ingredientes
            );
            return (
              <div
                key={producto.id}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">
                      {producto.nombre}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Margen: {producto.margenGanancia}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editarProducto(producto)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => eliminarProducto(producto.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="text-sm text-gray-600 mb-1">
                    {producto.ingredientes.length} ingrediente(s)
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-600">Costo: </span>
                      <span className="font-semibold text-gray-700">
                        {formatearMoneda(costoTotal)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Precio: </span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatearMoneda(precioFinal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

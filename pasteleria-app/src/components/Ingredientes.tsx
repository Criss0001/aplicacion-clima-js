import { useState, useEffect } from 'react';
import type { Ingrediente } from '../types';
import { storage } from '../utils/storage';

export default function Ingredientes() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    precioKg: '',
    unidad: 'kg' as 'kg' | 'g' | 'unidad' | 'litro' | 'ml',
  });

  useEffect(() => {
    setIngredientes(storage.getIngredientes());
  }, []);

  const guardarIngrediente = () => {
    if (!form.nombre || !form.precioKg) {
      alert('Por favor completa todos los campos');
      return;
    }

    const nuevoIngrediente: Ingrediente = {
      id: editando || Date.now().toString(),
      nombre: form.nombre,
      precioKg: parseFloat(form.precioKg),
      unidad: form.unidad,
    };

    let nuevosIngredientes;
    if (editando) {
      nuevosIngredientes = ingredientes.map((i) =>
        i.id === editando ? nuevoIngrediente : i
      );
    } else {
      nuevosIngredientes = [...ingredientes, nuevoIngrediente];
    }

    setIngredientes(nuevosIngredientes);
    storage.saveIngredientes(nuevosIngredientes);
    resetForm();
  };

  const eliminarIngrediente = (id: string) => {
    if (confirm('¿Estás segura de eliminar este ingrediente?')) {
      const nuevosIngredientes = ingredientes.filter((i) => i.id !== id);
      setIngredientes(nuevosIngredientes);
      storage.saveIngredientes(nuevosIngredientes);
    }
  };

  const editarIngrediente = (ingrediente: Ingrediente) => {
    setForm({
      nombre: ingrediente.nombre,
      precioKg: ingrediente.precioKg.toString(),
      unidad: ingrediente.unidad,
    });
    setEditando(ingrediente.id);
    setMostrarForm(true);
  };

  const resetForm = () => {
    setForm({ nombre: '', precioKg: '', unidad: 'kg' });
    setEditando(null);
    setMostrarForm(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📦 Ingredientes</h2>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-600 transition"
        >
          {mostrarForm ? '✕ Cancelar' : '+ Agregar'}
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            {editando ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre del ingrediente"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <input
              type="number"
              placeholder="Precio por kg/litro/unidad"
              value={form.precioKg}
              onChange={(e) => setForm({ ...form, precioKg: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <select
              value={form.unidad}
              onChange={(e) =>
                setForm({
                  ...form,
                  unidad: e.target.value as 'kg' | 'g' | 'unidad' | 'litro' | 'ml',
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="kg">Kilogramo (kg)</option>
              <option value="g">Gramos (g)</option>
              <option value="litro">Litro (L)</option>
              <option value="ml">Mililitros (ml)</option>
              <option value="unidad">Unidad</option>
            </select>
            <button
              onClick={guardarIngrediente}
              className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              {editando ? '💾 Actualizar' : '💾 Guardar'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {ingredientes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay ingredientes. ¡Agrega el primero!
          </div>
        ) : (
          ingredientes.map((ingrediente) => (
            <div
              key={ingrediente.id}
              className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{ingrediente.nombre}</h3>
                <p className="text-sm text-gray-600">
                  ${ingrediente.precioKg.toFixed(2)} por {ingrediente.unidad}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editarIngrediente(ingrediente)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                >
                  ✏️
                </button>
                <button
                  onClick={() => eliminarIngrediente(ingrediente.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

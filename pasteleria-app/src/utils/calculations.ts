import { Ingrediente, Producto, IngredienteProducto } from '../types';

export const calcularCostoProducto = (
  producto: Producto,
  ingredientes: Ingrediente[]
): { costoTotal: number; precioFinal: number } => {
  let costoTotal = 0;

  producto.ingredientes.forEach((ing: IngredienteProducto) => {
    const ingrediente = ingredientes.find((i) => i.id === ing.ingredienteId);
    if (ingrediente) {
      let costoIngrediente = 0;
      
      switch (ingrediente.unidad) {
        case 'kg':
          costoIngrediente = (ing.cantidad / 1000) * ingrediente.precioKg;
          break;
        case 'g':
          costoIngrediente = (ing.cantidad / 1000) * ingrediente.precioKg;
          break;
        case 'litro':
          costoIngrediente = (ing.cantidad / 1000) * ingrediente.precioKg;
          break;
        case 'ml':
          costoIngrediente = (ing.cantidad / 1000) * ingrediente.precioKg;
          break;
        case 'unidad':
          costoIngrediente = ing.cantidad * ingrediente.precioKg;
          break;
      }
      
      costoTotal += costoIngrediente;
    }
  });

  const precioFinal = costoTotal * (1 + producto.margenGanancia / 100);

  return { costoTotal, precioFinal };
};

export const formatearMoneda = (valor: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(valor);
};

export interface Ingrediente {
  id: string;
  nombre: string;
  precioKg: number;
  unidad: 'kg' | 'g' | 'unidad' | 'litro' | 'ml';
}

export interface IngredienteProducto {
  ingredienteId: string;
  cantidad: number;
}

export interface Producto {
  id: string;
  nombre: string;
  ingredientes: IngredienteProducto[];
  margenGanancia: number;
  precioFinal?: number;
  costoTotal?: number;
}

export interface Presupuesto {
  id: string;
  fecha: string;
  cliente: string;
  productos: {
    productoId: string;
    cantidad: number;
  }[];
  total: number;
}

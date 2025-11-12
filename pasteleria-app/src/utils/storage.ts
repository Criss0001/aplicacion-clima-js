import { Ingrediente, Producto, Presupuesto } from '../types';

const STORAGE_KEYS = {
  INGREDIENTES: 'pasteleria_ingredientes',
  PRODUCTOS: 'pasteleria_productos',
  PRESUPUESTOS: 'pasteleria_presupuestos',
  LOGO: 'pasteleria_logo',
  NEGOCIO: 'pasteleria_negocio',
};

export const storage = {
  getIngredientes: (): Ingrediente[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INGREDIENTES);
    return data ? JSON.parse(data) : [];
  },
  
  saveIngredientes: (ingredientes: Ingrediente[]) => {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTES, JSON.stringify(ingredientes));
  },
  
  getProductos: (): Producto[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTOS);
    return data ? JSON.parse(data) : [];
  },
  
  saveProductos: (productos: Producto[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(productos));
  },
  
  getPresupuestos: (): Presupuesto[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRESUPUESTOS);
    return data ? JSON.parse(data) : [];
  },
  
  savePresupuestos: (presupuestos: Presupuesto[]) => {
    localStorage.setItem(STORAGE_KEYS.PRESUPUESTOS, JSON.stringify(presupuestos));
  },
  
  getLogo: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.LOGO);
  },
  
  saveLogo: (logo: string) => {
    localStorage.setItem(STORAGE_KEYS.LOGO, logo);
  },
  
  getNegocio: (): { nombre: string; telefono: string } => {
    const data = localStorage.getItem(STORAGE_KEYS.NEGOCIO);
    return data ? JSON.parse(data) : { nombre: 'Mi Pastelería', telefono: '' };
  },
  
  saveNegocio: (negocio: { nombre: string; telefono: string }) => {
    localStorage.setItem(STORAGE_KEYS.NEGOCIO, JSON.stringify(negocio));
  },
};

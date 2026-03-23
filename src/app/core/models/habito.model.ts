export interface PasoHabito {
  texto: string;
  imagen: string;
}

export interface Habito {
  id: number;
  nombre: string;
  imagenPortada: string;
  color: string;
  completado: boolean;
  pasos: PasoHabito[];
}

export type AvatarType = 'female' | 'male';

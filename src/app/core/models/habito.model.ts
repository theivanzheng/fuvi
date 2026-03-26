export interface PasoHabito {
  texto: string;
  imagen: string;
}

export type MomentoDia = 'manana' | 'mediodia' | 'noche';
export type TipoDia = 'semana' | 'finde' | 'ambos';

export interface Habito {
  id: number;
  nombre: string;
  imagenPortada: string;
  color: string;
  completado: boolean;
  momento: MomentoDia;
  tipoDia: TipoDia;
  pasos: PasoHabito[];
}

export type AvatarType = 'female' | 'male';

/**
 * Configuration des jeux affichés sur la home.
 * Ajouter un objet ici pour qu’un jeu apparaisse dans la grille.
 */
export interface GameEntry {
  id: string;
  name: string;
  href: string;
  description: string;
  icon?: string;
}

export const games: GameEntry[] = [
  {
    id: "dice",
    name: "Dice",
    href: "/dice",
    description:
      "Jeu de dés en ligne, créez ou rejoignez une session pour jouer.",
    icon: "Dices",
  },
];

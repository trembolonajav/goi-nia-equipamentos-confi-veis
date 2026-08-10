import andaime from "../assets/eq/eq-andaime.jpg";
import betoneira from "../assets/eq/eq-betoneira.jpg";
import compactador from "../assets/eq/eq-compactador.jpg";
import cortadora from "../assets/eq/eq-cortadora.jpg";
import gerador from "../assets/eq/eq-gerador.jpg";
import lavadora from "../assets/eq/eq-lavadora.jpg";
import martelete from "../assets/eq/eq-martelete.jpg";
import vibrador from "../assets/eq/eq-vibrador.jpg";
import heroObra from "../assets/hero-obra.jpg";
import logoHorizontal from "../assets/locago-horizontal.png";
import monograma from "../assets/locago-monograma.png";
import logoIlustrativa from "../assets/logo-ilustrativa.png";

export const eqImg: Record<string, string> = {
  andaime,
  betoneira,
  compactador,
  cortadora,
  gerador,
  lavadora,
  martelete,
  vibrador,
};

export function imgOf(key: string): string {
  return eqImg[key] || "";
}

export { heroObra, logoHorizontal, monograma, logoIlustrativa };

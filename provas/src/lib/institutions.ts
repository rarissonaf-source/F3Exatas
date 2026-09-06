export interface Institution {
  slug: string;
  name: string;
  fullName: string;
  state: string;
  stateName: string;
  logo: string;
  disciplines: { slug: string; name: string }[];
  comingSoon?: boolean;
}

export const INSTITUTIONS: Institution[] = [
  {
    slug: "uva",
    name: "UVA",
    fullName: "Universidade Estadual Vale do Acaraú",
    state: "CE",
    stateName: "Ceará",
    logo: "/brand/institutions/uva.webp",
    disciplines: [
      { slug: "fisica", name: "Física" },
      { slug: "matematica", name: "Matemática" },
    ],
  },
  {
    slug: "ifma",
    name: "IFMA",
    fullName: "Instituto Federal do Maranhão",
    state: "MA",
    stateName: "Maranhão",
    logo: "/brand/institutions/ifma.png",
    disciplines: [{ slug: "matematica", name: "Matemática" }],
  },
  {
    slug: "fuvest",
    name: "FUVEST",
    fullName: "Fundação Universitária para o Vestibular",
    state: "SP",
    stateName: "São Paulo",
    logo: "/brand/institutions/fuvest.png",
    disciplines: [
      { slug: "fisica", name: "Física" },
      { slug: "matematica", name: "Matemática" },
    ],
    comingSoon: true,
  },
  {
    slug: "uece",
    name: "UECE",
    fullName: "Universidade Estadual do Ceará",
    state: "CE",
    stateName: "Ceará",
    logo: "/brand/institutions/uece.png",
    disciplines: [
      { slug: "fisica", name: "Física" },
      { slug: "matematica", name: "Matemática" },
    ],
  },
];

export const STATES = Array.from(
  new Map(INSTITUTIONS.map((i) => [i.state, i.stateName])).entries()
)
  .map(([state, stateName]) => ({ state, stateName }))
  .sort((a, b) => a.stateName.localeCompare(b.stateName));

export function getInstitution(slug: string): Institution | undefined {
  return INSTITUTIONS.find((i) => i.slug === slug);
}

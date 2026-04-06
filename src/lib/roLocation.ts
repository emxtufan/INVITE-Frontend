export const ROMANIA_COUNTIES = [
  "Alba",
  "Arad",
  "Arges",
  "Bacau",
  "Bihor",
  "Bistrita-Nasaud",
  "Botosani",
  "Braila",
  "Brasov",
  "Bucuresti",
  "Buzau",
  "Calarasi",
  "Caras-Severin",
  "Cluj",
  "Constanta",
  "Covasna",
  "Dambovita",
  "Dolj",
  "Galati",
  "Giurgiu",
  "Gorj",
  "Harghita",
  "Hunedoara",
  "Ialomita",
  "Iasi",
  "Ilfov",
  "Maramures",
  "Mehedinti",
  "Mures",
  "Neamt",
  "Olt",
  "Prahova",
  "Salaj",
  "Satu Mare",
  "Sibiu",
  "Suceava",
  "Teleorman",
  "Timis",
  "Tulcea",
  "Valcea",
  "Vaslui",
  "Vrancea",
] as const;

const BUCHAREST_CITY_KEYS = [
  "bucuresti",
  "bucharest",
  "municipiul bucuresti",
  "mun bucuresti",
];

const COUNTY_ALIASES: Record<string, string> = {
  "mun bucuresti": "Bucuresti",
  "municipiul bucuresti": "Bucuresti",
  bucuresti: "Bucuresti",
  bucharest: "Bucuresti",
};

export const cityToCountyMap: Record<string, string> = {
  "alba iulia": "Alba",
  aiud: "Alba",
  arad: "Arad",
  pitesti: "Arges",
  campulung: "Arges",
  bacau: "Bacau",
  onesti: "Bacau",
  oradea: "Bihor",
  bistrita: "Bistrita-Nasaud",
  botosani: "Botosani",
  braila: "Braila",
  brasov: "Brasov",
  bucuresti: "Bucuresti",
  bucharest: "Bucuresti",
  buzau: "Buzau",
  calarasi: "Calarasi",
  resita: "Caras-Severin",
  cluj: "Cluj",
  "cluj-napoca": "Cluj",
  "cluj napoca": "Cluj",
  turda: "Cluj",
  constanta: "Constanta",
  "sfantu gheorghe": "Covasna",
  targoviste: "Dambovita",
  craiova: "Dolj",
  galati: "Galati",
  giurgiu: "Giurgiu",
  "targu jiu": "Gorj",
  "miercurea ciuc": "Harghita",
  deva: "Hunedoara",
  slobozia: "Ialomita",
  iasi: "Iasi",
  volutari: "Ilfov",
  voluntari: "Ilfov",
  otopeni: "Ilfov",
  "baia mare": "Maramures",
  drobeta: "Mehedinti",
  "drobeta turnu severin": "Mehedinti",
  "targu mures": "Mures",
  "piatra neamt": "Neamt",
  slatina: "Olt",
  ploiesti: "Prahova",
  zalau: "Salaj",
  "satu mare": "Satu Mare",
  sibiu: "Sibiu",
  suceava: "Suceava",
  alexandria: "Teleorman",
  timisoara: "Timis",
  lugoj: "Timis",
  tulcea: "Tulcea",
  "ramnicu valcea": "Valcea",
  vaslui: "Vaslui",
  focsani: "Vrancea",
};

export function normalizeRomanianText(value = "") {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function inferCountyFromCity(city = "") {
  const key = normalizeRomanianText(city);
  if (!key) return "";
  if (BUCHAREST_CITY_KEYS.includes(key)) return "Bucuresti";
  return cityToCountyMap[key] || "";
}

export function isBucharestCityName(city = "") {
  const key = normalizeRomanianText(city);
  return BUCHAREST_CITY_KEYS.includes(key);
}

export function normalizeRomanianCounty(county = "", country = "Romania") {
  const raw = String(county || "").trim();
  if (!raw) return "";
  const isRomania = ["romania", "ro"].includes(normalizeRomanianText(country));
  if (!isRomania) return raw;

  const key = normalizeRomanianText(raw);
  if (COUNTY_ALIASES[key]) return COUNTY_ALIASES[key];

  const fromKnownCounties = ROMANIA_COUNTIES.find(
    (entry) => normalizeRomanianText(entry) === key,
  );
  if (fromKnownCounties) return fromKnownCounties;

  return raw
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function isCityMatchingCounty(city = "", county = "", country = "Romania") {
  const normalizedCity = normalizeRomanianText(city);
  const normalizedCounty = normalizeRomanianCounty(county, country);
  if (!normalizedCity || !normalizedCounty) return true;

  const inferredCounty = inferCountyFromCity(city);
  if (!inferredCounty) return true;
  return normalizeRomanianText(inferredCounty) === normalizeRomanianText(normalizedCounty);
}

export function getRomanianCitySuggestions(limit = 80) {
  const normalizedLimit = Number.isFinite(Number(limit)) ? Number(limit) : 80;
  const unique = new Set<string>();
  Object.keys(cityToCountyMap).forEach((city) => {
    if (city === "bucharest") return;
    const pretty = city
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    unique.add(pretty);
  });
  return Array.from(unique).sort((a, b) => a.localeCompare(b, "ro")).slice(0, normalizedLimit);
}

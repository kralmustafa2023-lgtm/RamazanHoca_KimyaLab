// ============================================
// PERIODIC.JS — Interaktif Periyodik Tablo (Gerçek 3D Görünüm)
// Ramazan Hoca'nın Kimya Sınıfı
// ============================================

const PERIODIC = (() => {
    // Renk kategorileri
    const CAT_COLORS = {
        'alkali':     { bg: '#FF6B6B', text: '#fff', label: 'Alkali Metal' },
        'alkaline':   { bg: '#FFA94D', text: '#fff', label: 'Toprak Alkali' },
        'transition': { bg: '#74C0FC', text: '#1a1a1a', label: 'Geçiş Metali' },
        'other':      { bg: '#A9E34B', text: '#1a1a1a', label: 'Diğer Metal' },
        'metalloid':  { bg: '#63E6BE', text: '#1a1a1a', label: 'Yarı Metal' },
        'nonmetal':   { bg: '#E599F7', text: '#1a1a1a', label: 'Ametal' },
        'noble':      { bg: '#4DABF7', text: '#fff', label: 'Soy Gaz' },
        'halogen':    { bg: '#F783AC', text: '#fff', label: 'Halojen' },
        'lanthanide': { bg: '#FAB005', text: '#1a1a1a', label: 'Lantanit' },
        'actinide':   { bg: '#FF922B', text: '#fff', label: 'Aktinit' }
    };

    const ELEMENTS = [
  {
    "n": 1,
    "s": "H",
    "name": "Hidrojen",
    "cat": "nonmetal",
    "grp": 1,
    "per": 1,
    "mass": "1.008",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 2,
    "s": "He",
    "name": "Helyum",
    "cat": "noble",
    "grp": 18,
    "per": 1,
    "mass": "4.003",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 3,
    "s": "Li",
    "name": "Lityum",
    "cat": "alkali",
    "grp": 1,
    "per": 2,
    "mass": "6.94",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 4,
    "s": "Be",
    "name": "Berilyum",
    "cat": "alkaline",
    "grp": 2,
    "per": 2,
    "mass": "9.012",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 5,
    "s": "B",
    "name": "Bor",
    "cat": "metalloid",
    "grp": 13,
    "per": 2,
    "mass": "10.81",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 6,
    "s": "C",
    "name": "Karbon",
    "cat": "nonmetal",
    "grp": 14,
    "per": 2,
    "mass": "12.011",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 7,
    "s": "N",
    "name": "Azot",
    "cat": "nonmetal",
    "grp": 15,
    "per": 2,
    "mass": "14.007",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 8,
    "s": "O",
    "name": "Oksijen",
    "cat": "nonmetal",
    "grp": 16,
    "per": 2,
    "mass": "15.999",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 9,
    "s": "F",
    "name": "Flor",
    "cat": "halogen",
    "grp": 17,
    "per": 2,
    "mass": "18.998",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 10,
    "s": "Ne",
    "name": "Neon",
    "cat": "noble",
    "grp": 18,
    "per": 2,
    "mass": "20.18",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 11,
    "s": "Na",
    "name": "Sodyum",
    "cat": "alkali",
    "grp": 1,
    "per": 3,
    "mass": "22.99",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 12,
    "s": "Mg",
    "name": "Magnezyum",
    "cat": "alkaline",
    "grp": 2,
    "per": 3,
    "mass": "24.305",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 13,
    "s": "Al",
    "name": "Alüminyum",
    "cat": "other",
    "grp": 13,
    "per": 3,
    "mass": "26.982",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 14,
    "s": "Si",
    "name": "Silisyum",
    "cat": "metalloid",
    "grp": 14,
    "per": 3,
    "mass": "28.085",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 15,
    "s": "P",
    "name": "Fosfor",
    "cat": "nonmetal",
    "grp": 15,
    "per": 3,
    "mass": "30.974",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 16,
    "s": "S",
    "name": "Kükürt",
    "cat": "nonmetal",
    "grp": 16,
    "per": 3,
    "mass": "32.06",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 17,
    "s": "Cl",
    "name": "Klor",
    "cat": "halogen",
    "grp": 17,
    "per": 3,
    "mass": "35.45",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 18,
    "s": "Ar",
    "name": "Argon",
    "cat": "noble",
    "grp": 18,
    "per": 3,
    "mass": "39.95",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 19,
    "s": "K",
    "name": "Potasyum",
    "cat": "alkali",
    "grp": 1,
    "per": 4,
    "mass": "39.098",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 20,
    "s": "Ca",
    "name": "Kalsiyum",
    "cat": "alkaline",
    "grp": 2,
    "per": 4,
    "mass": "40.078",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 21,
    "s": "Sc",
    "name": "Skandiyum",
    "cat": "transition",
    "grp": 3,
    "per": 4,
    "mass": "44.956",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 22,
    "s": "Ti",
    "name": "Titanyum",
    "cat": "transition",
    "grp": 4,
    "per": 4,
    "mass": "47.867",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 23,
    "s": "V",
    "name": "Vanadyum",
    "cat": "transition",
    "grp": 5,
    "per": 4,
    "mass": "50.942",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 24,
    "s": "Cr",
    "name": "Krom",
    "cat": "transition",
    "grp": 6,
    "per": 4,
    "mass": "51.996",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 25,
    "s": "Mn",
    "name": "Mangan",
    "cat": "transition",
    "grp": 7,
    "per": 4,
    "mass": "54.938",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 26,
    "s": "Fe",
    "name": "Demir",
    "cat": "transition",
    "grp": 8,
    "per": 4,
    "mass": "55.845",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 27,
    "s": "Co",
    "name": "Kobalt",
    "cat": "transition",
    "grp": 9,
    "per": 4,
    "mass": "58.933",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 28,
    "s": "Ni",
    "name": "Nikel",
    "cat": "transition",
    "grp": 10,
    "per": 4,
    "mass": "58.693",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 29,
    "s": "Cu",
    "name": "Bakır",
    "cat": "transition",
    "grp": 11,
    "per": 4,
    "mass": "63.546",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 30,
    "s": "Zn",
    "name": "Çinko",
    "cat": "transition",
    "grp": 12,
    "per": 4,
    "mass": "65.38",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 31,
    "s": "Ga",
    "name": "Galyum",
    "cat": "other",
    "grp": 13,
    "per": 4,
    "mass": "69.723",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 32,
    "s": "Ge",
    "name": "Germanyum",
    "cat": "metalloid",
    "grp": 14,
    "per": 4,
    "mass": "72.63",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 33,
    "s": "As",
    "name": "Arsenik",
    "cat": "metalloid",
    "grp": 15,
    "per": 4,
    "mass": "74.922",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 34,
    "s": "Se",
    "name": "Selenyum",
    "cat": "nonmetal",
    "grp": 16,
    "per": 4,
    "mass": "78.971",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 35,
    "s": "Br",
    "name": "Brom",
    "cat": "halogen",
    "grp": 17,
    "per": 4,
    "mass": "79.904",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 36,
    "s": "Kr",
    "name": "Kripton",
    "cat": "noble",
    "grp": 18,
    "per": 4,
    "mass": "83.798",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 37,
    "s": "Rb",
    "name": "Rubidyum",
    "cat": "alkali",
    "grp": 1,
    "per": 5,
    "mass": "85.468",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 38,
    "s": "Sr",
    "name": "Stronsiyum",
    "cat": "alkaline",
    "grp": 2,
    "per": 5,
    "mass": "87.62",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 39,
    "s": "Y",
    "name": "İtriyum",
    "cat": "transition",
    "grp": 3,
    "per": 5,
    "mass": "88.906",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 40,
    "s": "Zr",
    "name": "Zirkonyum",
    "cat": "transition",
    "grp": 4,
    "per": 5,
    "mass": "91.224",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 41,
    "s": "Nb",
    "name": "Niyobyum",
    "cat": "transition",
    "grp": 5,
    "per": 5,
    "mass": "92.906",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 42,
    "s": "Mo",
    "name": "Molibden",
    "cat": "transition",
    "grp": 6,
    "per": 5,
    "mass": "95.95",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 43,
    "s": "Tc",
    "name": "Teknesyum",
    "cat": "transition",
    "grp": 7,
    "per": 5,
    "mass": "98",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 44,
    "s": "Ru",
    "name": "Rutenyum",
    "cat": "transition",
    "grp": 8,
    "per": 5,
    "mass": "101.07",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 45,
    "s": "Rh",
    "name": "Rodyum",
    "cat": "transition",
    "grp": 9,
    "per": 5,
    "mass": "102.91",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 46,
    "s": "Pd",
    "name": "Paladyum",
    "cat": "transition",
    "grp": 10,
    "per": 5,
    "mass": "106.42",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 47,
    "s": "Ag",
    "name": "Gümüş",
    "cat": "transition",
    "grp": 11,
    "per": 5,
    "mass": "107.87",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 48,
    "s": "Cd",
    "name": "Kadmiyum",
    "cat": "transition",
    "grp": 12,
    "per": 5,
    "mass": "112.41",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 49,
    "s": "In",
    "name": "İndiyum",
    "cat": "other",
    "grp": 13,
    "per": 5,
    "mass": "114.82",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 50,
    "s": "Sn",
    "name": "Kalay",
    "cat": "other",
    "grp": 14,
    "per": 5,
    "mass": "118.71",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 51,
    "s": "Sb",
    "name": "Antimon",
    "cat": "metalloid",
    "grp": 15,
    "per": 5,
    "mass": "121.76",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 52,
    "s": "Te",
    "name": "Tellür",
    "cat": "metalloid",
    "grp": 16,
    "per": 5,
    "mass": "127.6",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 53,
    "s": "I",
    "name": "İyot",
    "cat": "halogen",
    "grp": 17,
    "per": 5,
    "mass": "126.9",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 54,
    "s": "Xe",
    "name": "Ksenon",
    "cat": "noble",
    "grp": 18,
    "per": 5,
    "mass": "131.29",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 55,
    "s": "Cs",
    "name": "Sezyum",
    "cat": "alkali",
    "grp": 1,
    "per": 6,
    "mass": "132.91",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 56,
    "s": "Ba",
    "name": "Baryum",
    "cat": "alkaline",
    "grp": 2,
    "per": 6,
    "mass": "137.33",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 57,
    "s": "La",
    "name": "Lantan",
    "cat": "lanthanide",
    "grp": 4,
    "per": 9,
    "mass": "138.91",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 58,
    "s": "Ce",
    "name": "Seryum",
    "cat": "lanthanide",
    "grp": 5,
    "per": 9,
    "mass": "140.12",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 59,
    "s": "Pr",
    "name": "Praseodim",
    "cat": "lanthanide",
    "grp": 6,
    "per": 9,
    "mass": "140.91",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 60,
    "s": "Nd",
    "name": "Neodim",
    "cat": "lanthanide",
    "grp": 7,
    "per": 9,
    "mass": "144.24",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 61,
    "s": "Pm",
    "name": "Prometyum",
    "cat": "lanthanide",
    "grp": 8,
    "per": 9,
    "mass": "145",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 62,
    "s": "Sm",
    "name": "Samaryum",
    "cat": "lanthanide",
    "grp": 9,
    "per": 9,
    "mass": "150.36",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 63,
    "s": "Eu",
    "name": "Evropiyum",
    "cat": "lanthanide",
    "grp": 10,
    "per": 9,
    "mass": "151.96",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 64,
    "s": "Gd",
    "name": "Gadolinyum",
    "cat": "lanthanide",
    "grp": 11,
    "per": 9,
    "mass": "157.25",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 65,
    "s": "Tb",
    "name": "Terbiyum",
    "cat": "lanthanide",
    "grp": 12,
    "per": 9,
    "mass": "158.93",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 66,
    "s": "Dy",
    "name": "Disprozyum",
    "cat": "lanthanide",
    "grp": 13,
    "per": 9,
    "mass": "162.5",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 67,
    "s": "Ho",
    "name": "Holmiyum",
    "cat": "lanthanide",
    "grp": 14,
    "per": 9,
    "mass": "164.93",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 68,
    "s": "Er",
    "name": "Erbiyum",
    "cat": "lanthanide",
    "grp": 15,
    "per": 9,
    "mass": "167.26",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 69,
    "s": "Tm",
    "name": "Tulyum",
    "cat": "lanthanide",
    "grp": 16,
    "per": 9,
    "mass": "168.93",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 70,
    "s": "Yb",
    "name": "İterbiyum",
    "cat": "lanthanide",
    "grp": 17,
    "per": 9,
    "mass": "173.05",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 71,
    "s": "Lu",
    "name": "Lütesyum",
    "cat": "lanthanide",
    "grp": 18,
    "per": 9,
    "mass": "174.97",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 72,
    "s": "Hf",
    "name": "Hafniyum",
    "cat": "transition",
    "grp": 4,
    "per": 6,
    "mass": "178.49",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 73,
    "s": "Ta",
    "name": "Tantal",
    "cat": "transition",
    "grp": 5,
    "per": 6,
    "mass": "180.95",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 74,
    "s": "W",
    "name": "Tungsten",
    "cat": "transition",
    "grp": 6,
    "per": 6,
    "mass": "183.84",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 75,
    "s": "Re",
    "name": "Renyum",
    "cat": "transition",
    "grp": 7,
    "per": 6,
    "mass": "186.21",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 76,
    "s": "Os",
    "name": "Osmiyum",
    "cat": "transition",
    "grp": 8,
    "per": 6,
    "mass": "190.23",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 77,
    "s": "Ir",
    "name": "İridyum",
    "cat": "transition",
    "grp": 9,
    "per": 6,
    "mass": "192.22",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 78,
    "s": "Pt",
    "name": "Platin",
    "cat": "transition",
    "grp": 10,
    "per": 6,
    "mass": "195.08",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 79,
    "s": "Au",
    "name": "Altın",
    "cat": "transition",
    "grp": 11,
    "per": 6,
    "mass": "196.97",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 80,
    "s": "Hg",
    "name": "Cıva",
    "cat": "transition",
    "grp": 12,
    "per": 6,
    "mass": "200.59",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 81,
    "s": "Tl",
    "name": "Talyum",
    "cat": "other",
    "grp": 13,
    "per": 6,
    "mass": "204.38",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 82,
    "s": "Pb",
    "name": "Kurşun",
    "cat": "other",
    "grp": 14,
    "per": 6,
    "mass": "207.2",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 83,
    "s": "Bi",
    "name": "Bizmut",
    "cat": "other",
    "grp": 15,
    "per": 6,
    "mass": "208.98",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 84,
    "s": "Po",
    "name": "Polonyum",
    "cat": "other",
    "grp": 16,
    "per": 6,
    "mass": "209",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 85,
    "s": "At",
    "name": "Astatin",
    "cat": "halogen",
    "grp": 17,
    "per": 6,
    "mass": "210",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 86,
    "s": "Rn",
    "name": "Radon",
    "cat": "noble",
    "grp": 18,
    "per": 6,
    "mass": "222",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 87,
    "s": "Fr",
    "name": "Fransiyum",
    "cat": "alkali",
    "grp": 1,
    "per": 7,
    "mass": "223",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 88,
    "s": "Ra",
    "name": "Radyum",
    "cat": "alkaline",
    "grp": 2,
    "per": 7,
    "mass": "226",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 89,
    "s": "Ac",
    "name": "Aktiniyum",
    "cat": "actinide",
    "grp": 4,
    "per": 10,
    "mass": "227",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 90,
    "s": "Th",
    "name": "Toryum",
    "cat": "actinide",
    "grp": 5,
    "per": 10,
    "mass": "232.04",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 91,
    "s": "Pa",
    "name": "Protaktiniyum",
    "cat": "actinide",
    "grp": 6,
    "per": 10,
    "mass": "231.04",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 92,
    "s": "U",
    "name": "Uranyum",
    "cat": "actinide",
    "grp": 7,
    "per": 10,
    "mass": "238.03",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 93,
    "s": "Np",
    "name": "Neptünyum",
    "cat": "actinide",
    "grp": 8,
    "per": 10,
    "mass": "237",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 94,
    "s": "Pu",
    "name": "Plütonyum",
    "cat": "actinide",
    "grp": 9,
    "per": 10,
    "mass": "244",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 95,
    "s": "Am",
    "name": "Amerikyum",
    "cat": "actinide",
    "grp": 10,
    "per": 10,
    "mass": "243",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 96,
    "s": "Cm",
    "name": "Küriyum",
    "cat": "actinide",
    "grp": 11,
    "per": 10,
    "mass": "247",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 97,
    "s": "Bk",
    "name": "Berkelyum",
    "cat": "actinide",
    "grp": 12,
    "per": 10,
    "mass": "247",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 98,
    "s": "Cf",
    "name": "Kaliforniyum",
    "cat": "actinide",
    "grp": 13,
    "per": 10,
    "mass": "251",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 99,
    "s": "Es",
    "name": "Aynştaynyum",
    "cat": "actinide",
    "grp": 14,
    "per": 10,
    "mass": "252",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 100,
    "s": "Fm",
    "name": "Fermiyum",
    "cat": "actinide",
    "grp": 15,
    "per": 10,
    "mass": "257",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 101,
    "s": "Md",
    "name": "Mendelevyum",
    "cat": "actinide",
    "grp": 16,
    "per": 10,
    "mass": "258",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 102,
    "s": "No",
    "name": "Nobelyum",
    "cat": "actinide",
    "grp": 17,
    "per": 10,
    "mass": "259",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 103,
    "s": "Lr",
    "name": "Lavrensiyum",
    "cat": "actinide",
    "grp": 18,
    "per": 10,
    "mass": "262",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 104,
    "s": "Rf",
    "name": "Rutherfordiyum",
    "cat": "transition",
    "grp": 4,
    "per": 7,
    "mass": "267",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 105,
    "s": "Db",
    "name": "Dubniyum",
    "cat": "transition",
    "grp": 5,
    "per": 7,
    "mass": "270",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 106,
    "s": "Sg",
    "name": "Seaborgiyum",
    "cat": "transition",
    "grp": 6,
    "per": 7,
    "mass": "271",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 107,
    "s": "Bh",
    "name": "Bohriyum",
    "cat": "transition",
    "grp": 7,
    "per": 7,
    "mass": "270",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 108,
    "s": "Hs",
    "name": "Hassiyum",
    "cat": "transition",
    "grp": 8,
    "per": 7,
    "mass": "277",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 109,
    "s": "Mt",
    "name": "Meitneryum",
    "cat": "transition",
    "grp": 9,
    "per": 7,
    "mass": "276",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 110,
    "s": "Ds",
    "name": "Darmstadtiyum",
    "cat": "transition",
    "grp": 10,
    "per": 7,
    "mass": "281",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 111,
    "s": "Rg",
    "name": "Röntgenyum",
    "cat": "transition",
    "grp": 11,
    "per": 7,
    "mass": "280",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 112,
    "s": "Cn",
    "name": "Kopernikyum",
    "cat": "transition",
    "grp": 12,
    "per": 7,
    "mass": "285",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 113,
    "s": "Nh",
    "name": "Nihoniyum",
    "cat": "other",
    "grp": 13,
    "per": 7,
    "mass": "284",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 114,
    "s": "Fl",
    "name": "Flerovyum",
    "cat": "other",
    "grp": 14,
    "per": 7,
    "mass": "289",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 115,
    "s": "Mc",
    "name": "Moskovyum",
    "cat": "other",
    "grp": 15,
    "per": 7,
    "mass": "288",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 116,
    "s": "Lv",
    "name": "Livermoryum",
    "cat": "other",
    "grp": 16,
    "per": 7,
    "mass": "293",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 117,
    "s": "Ts",
    "name": "Tennesin",
    "cat": "halogen",
    "grp": 17,
    "per": 7,
    "mass": "294",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  },
  {
    "n": 118,
    "s": "Og",
    "name": "Oganesson",
    "cat": "noble",
    "grp": 18,
    "per": 7,
    "mass": "294",
    "ec": "",
    "bio": "KimyaLab Detaylı İnceleme"
  }
];

    let currentFilter = 'all';
    let searchQuery = '';

    function getFilteredElements() {
        return ELEMENTS.map(el => {
            const matchCat = currentFilter === 'all' || el.cat === currentFilter;
            const q = searchQuery.toLowerCase();
            const matchSearch = !q || el.name.toLowerCase().includes(q) || el.s.toLowerCase().includes(q) || String(el.n).includes(q);
            
            return { ...el, dimmed: !(matchCat && matchSearch) };
        });
    }

    function render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = buildHTML();
        attachEvents(container);
        
        // Add staggered entrance animation
        setTimeout(() => {
            const cells = container.querySelectorAll('.pt-cell');
            cells.forEach((cell, index) => {
                setTimeout(() => {
                    cell.style.opacity = cell.dataset.dimmed === 'true' ? '0.15' : '1';
                    cell.style.transform = 'translateZ(0) scale(1)';
                }, index * 5); // very fast stagger
            });
        }, 50);
    }

    function attachEvents(container) {
        const input = container.querySelector('#pt-search-input');
        if (input) {
            input.value = searchQuery;
            input.focus();
        }
    }

    function onSearch(val) {
        searchQuery = val;
        const container = document.getElementById('pt-root');
        if (container) {
            container.innerHTML = buildHTML();
            attachEvents(container);
            
            const cells = container.querySelectorAll('.pt-cell');
            cells.forEach((cell) => {
                cell.style.transition = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)';
                cell.style.opacity = cell.dataset.dimmed === 'true' ? '0.15' : '1';
                cell.style.transform = cell.dataset.dimmed === 'true' ? 'translateZ(-20px) scale(0.95)' : 'translateZ(0) scale(1)';
            });
        }
    }

    function buildHTML() {
        const catEntries = Object.entries(CAT_COLORS);
        const legendHTML = catEntries.map(([k, v]) =>
            `<div class="pt-legend-item ${currentFilter === k ? 'pt-legend-active' : ''}" onclick="PERIODIC.setFilter('${k}')" style="background:${v.bg};color:${v.text}">${v.label}</div>`
        ).join('');

        const filtered = getFilteredElements();

        const cardsHTML = filtered.map(el => {
            const c = CAT_COLORS[el.cat] || CAT_COLORS['other'];
            const filterCss = el.dimmed ? 'filter: grayscale(80%); pointer-events: none;' : '';
            return `
            <div class="pt-cell" onclick="PERIODIC.showDetail(${el.n})" data-dimmed="${el.dimmed}"
                 style="grid-column: ${el.grp}; grid-row: ${el.per}; background: ${c.bg}; color: ${c.text}; ${filterCss} opacity: 0; transform: translateZ(-50px) scale(0.9);">
                <div class="pt-cell-num">${el.n}</div>
                <div class="pt-cell-sym">${el.s}</div>
                <div class="pt-cell-name">${el.name}</div>
                <div class="pt-cell-mass">${el.mass}</div>
            </div>`;
        }).join('');

        // Lanthanide & Actinide placeholders in the main table
        const placeholders = `
            <div class="pt-cell-placeholder" style="grid-column: 3; grid-row: 6; background: rgba(250, 176, 5, 0.2); color: #FAB005; border-color: #FAB005;">
                <div style="font-size: 9px; font-weight: 800; opacity: 0.9;">57-71</div>
                <div style="font-size: 20px; font-weight: 900; margin-top: 5px;">La-Lu</div>
            </div>
            <div class="pt-cell-placeholder" style="grid-column: 3; grid-row: 7; background: rgba(255, 146, 43, 0.2); color: #FF922B; border-color: #FF922B;">
                <div style="font-size: 9px; font-weight: 800; opacity: 0.9;">89-103</div>
                <div style="font-size: 20px; font-weight: 900; margin-top: 5px;">Ac-Lr</div>
            </div>
            <!-- Empty space for table gap -->
            <div style="grid-column: 1 / -1; grid-row: 8; height: 10px;"></div>
        `;

        return `
        <div class="pt-screen" style="max-width: 1400px; padding: 20px;">
            <div class="pt-header-3d" style="background: linear-gradient(135deg, rgba(26,41,128,0.85), rgba(38,208,206,0.85)); backdrop-filter: blur(16px); padding: 40px 30px; border-radius: 24px; margin-bottom: 35px; color: white; text-align: center; box-shadow: 0 15px 40px rgba(0,0,0,0.25); position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.25);">
                <h2 style="font-size: 36px; font-weight: 900; margin-bottom: 12px; text-shadow: 0 4px 20px rgba(0,0,0,0.4); letter-spacing: -0.5px;">⚛️ 3D İnteraktif Periyodik Tablo</h2>
                <p style="font-size: 16px; opacity: 0.9; font-weight: 500;">Tüm 118 element gerçek yerlerinde. Detayları ve 3D kartını görmek için elemente tıkla.</p>
                
                <div class="pt-search-wrapper">
                    <input class="pt-search-input" id="pt-search-input" type="text"
                           placeholder="Element ara... (İsim, sembol, numara)"
                           oninput="PERIODIC.onSearch(this.value)">
                </div>

                <div style="position: absolute; right: -20px; top: -50px; font-size: 200px; opacity: 0.05; pointer-events: none;">🧪</div>
                <div style="position: absolute; left: -20px; bottom: -50px; font-size: 150px; opacity: 0.05; pointer-events: none;">🔬</div>
            </div>

            <div class="pt-legend" style="display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-bottom: 40px; background: var(--bg-card); padding: 20px; border-radius: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(255,255,255,0.5);">
                <div class="pt-legend-item ${currentFilter==='all'?'pt-legend-active':''}"
                     onclick="PERIODIC.setFilter('all')"
                     style="background: ${currentFilter==='all'?'linear-gradient(135deg, var(--teal), var(--purple))':'var(--bg-secondary)'}; color: ${currentFilter==='all'?'white':'var(--text-primary)'}; box-shadow: ${currentFilter==='all'?'0 6px 20px rgba(0,191,165,0.4)':'none'}; border: 2px solid ${currentFilter==='all'?'transparent':'var(--bg-secondary)'};">
                    🔬 Tümü
                </div>
                ${legendHTML}
            </div>

            <div class="pt-3d-wrapper" style="perspective: 1200px; padding-bottom: 40px;">
                <div class="pt-table-grid" style="display: grid; grid-template-columns: repeat(18, minmax(0, 1fr)); gap: 5px; transform-style: preserve-3d; transition: transform 0.5s ease; position: relative;">
                    ${placeholders}
                    ${cardsHTML}
                </div>
            </div>
            
            <div style="text-align: center; color: var(--text-muted); font-size: 14px; margin-top: 20px; font-weight: 600;">
                ✨ Ramazan Hoca'nın Kimya Sınıfı Özel Tasarım
            </div>
        </div>`;
    }

    function setFilter(cat) {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        currentFilter = cat;
        const container = document.getElementById('pt-root');
        if (container) {
            container.innerHTML = buildHTML();
            attachEvents(container);
            
            // Re-trigger animation
            const cells = container.querySelectorAll('.pt-cell');
            cells.forEach((cell, index) => {
                cell.style.transition = 'none';
                cell.style.opacity = '0';
                cell.style.transform = 'translateZ(-20px) scale(0.95)';
                setTimeout(() => {
                    cell.style.transition = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)';
                    cell.style.opacity = cell.dataset.dimmed === 'true' ? '0.15' : '1';
                    cell.style.transform = 'translateZ(0) scale(1)';
                }, index * 2);
            });
        }
    }

    function showDetail(atomNum) {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        const el = ELEMENTS.find(e => e.n === atomNum);
        if (!el) return;

        const c = CAT_COLORS[el.cat] || CAT_COLORS['other'];
        const existing = document.getElementById('pt-detail-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'pt-detail-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity 0.3s; perspective: 1000px;';
        overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

        overlay.innerHTML = `
        <div class="pt-detail-card" style="background:var(--bg-card);border-radius:24px;width:100%;max-width:380px;overflow:hidden;transform:rotateX(20deg) scale(0.8);transition:all 0.5s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 30px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);">
            <div style="background:linear-gradient(135deg,${c.bg},${c.bg}99);padding:30px;text-align:center;position:relative;border-bottom:3px solid rgba(0,0,0,0.1);">
                <button onclick="document.getElementById('pt-detail-overlay').remove()" style="position:absolute;top:15px;right:15px;background:rgba(0,0,0,0.2);border:none;color:${c.text};font-size:18px;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;">✕</button>
                <div style="font-size:12px;font-weight:800;color:${c.text};opacity:0.9;letter-spacing:1px;text-transform:uppercase;">Atom No: ${el.n} &nbsp;·&nbsp; ${c.label}</div>
                <div style="font-size:80px;font-weight:900;color:${c.text};text-shadow:0 10px 20px rgba(0,0,0,0.3);margin:10px 0;line-height:1;">${el.s}</div>
                <div style="font-size:26px;font-weight:800;color:${c.text};">${el.name}</div>
            </div>
            <div style="padding:22px;">
                <div style="display:flex;justify-content:space-between;background:var(--bg-secondary);padding:15px;border-radius:16px;margin-bottom:18px;border:1px solid rgba(0,0,0,0.05); box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="text-align:center; flex:1;"><div style="font-size:10px;color:var(--text-muted);font-weight:800;letter-spacing:1px;">GRUP</div><div style="font-size:18px;font-weight:800;color:var(--text-primary); margin-top:4px;">${el.grp}</div></div>
                    <div style="width:1px;background:rgba(0,0,0,0.08);margin:0 10px;"></div>
                    <div style="text-align:center; flex:1;"><div style="font-size:10px;color:var(--text-muted);font-weight:800;letter-spacing:1px;">PERİYOT</div><div style="font-size:18px;font-weight:800;color:var(--text-primary); margin-top:4px;">${el.per}</div></div>
                    <div style="width:1px;background:rgba(0,0,0,0.08);margin:0 10px;"></div>
                    <div style="text-align:center; flex:1;"><div style="font-size:10px;color:var(--text-muted);font-weight:800;letter-spacing:1px;">KÜTLE</div><div style="font-size:18px;font-weight:800;color:var(--text-primary); margin-top:4px;">${el.mass}</div></div>
                </div>
                
                <div style="background:var(--bg-secondary);border-radius:16px;padding:20px;margin-bottom:20px;border-left:5px solid ${c.bg};position:relative;text-align:left;box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                    <div style="position:absolute;top:-12px;left:16px;background:${c.bg};color:${c.text};padding:4px 14px;border-radius:20px;font-size:11px;font-weight:800;box-shadow:0 4px 10px ${c.bg}66;letter-spacing:0.5px;">Ramazan Hoca Notu 📝</div>
                    <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;margin:8px 0 0 0;font-weight:500;">
                        <b>${el.name} (${el.s})</b>, periyodik tablonun <b>${el.per}. periyot</b> ve <b>${el.grp}. grubunda</b> yer alan bir <b>${c.label.toLowerCase()}</b> elementidir. Atom numarası ${el.n} olup, kütle numarası yaklaşık ${Math.round(el.mass)}'dir.
                    </p>
                </div>
                
                <div style="display:flex;gap:12px;">
                    <button onclick="APP.speak('${el.name} elementi. Atom numarası ${el.n}. Bir ${c.label}.'); this.innerHTML='🔊 Okunuyor...'; setTimeout(() => this.innerHTML='🔊 Sesli Dinle', 3000);"
                            style="flex:1;padding:14px;border-radius:14px;background:linear-gradient(135deg, ${c.bg}, ${c.bg}ee);color:${c.text};border:none;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 6px 15px ${c.bg}55;transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px ${c.bg}77';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 6px 15px ${c.bg}55';">
                        🔊 Sesli Dinle
                    </button>
                    <button onclick="document.getElementById('pt-detail-overlay').remove()" 
                            style="flex:1;padding:14px;border-radius:14px;background:var(--bg-primary);color:var(--text-primary);border:2px solid rgba(0,0,0,0.05);font-weight:800;font-size:14px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.background='var(--bg-secondary)';" onmouseout="this.style.transform='none'; this.style.background='var(--bg-primary)';">
                        Kapat
                    </button>
                </div>
            </div>
        </div>`;

        document.body.appendChild(overlay);
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.querySelector('.pt-detail-card').style.transform = 'rotateX(0deg) scale(1)';
        }, 10);
    }

    return { render, setFilter, showDetail, onSearch };
})();

export interface CityData {
  name: string;
  pincodes: string[];
}

export interface StateData {
  state: string;
  code: string;
  cities: CityData[];
}

export const INDIA_LOCATIONS: StateData[] = [
  // 1. Uttar Pradesh
  {
    state: "Uttar Pradesh",
    code: "UP",
    cities: [
      {
        name: "Noida",
        pincodes: [
          "201301", "201303", "201304", "201305", "201306", 
          "201307", "201309", "201310", "201313", "201318"
        ],
      },
      {
        name: "Greater Noida",
        pincodes: ["201306", "201308", "201310", "201312"],
      },
      {
        name: "Ghaziabad",
        pincodes: ["201001", "201002", "201009", "201010", "201012", "201014", "201016"],
      },
      {
        name: "Lucknow",
        pincodes: ["226001", "226010", "226016", "226024", "226028", "226002", "226005"],
      },
      {
        name: "Kanpur",
        pincodes: ["208001", "208002", "208005", "208012", "208020", "208025"],
      },
      {
        name: "Varanasi",
        pincodes: ["221001", "221002", "221005", "221010", "221007"],
      },
      {
        name: "Agra",
        pincodes: ["282001", "282002", "282003", "282004", "282005", "282007"],
      },
      {
        name: "Meerut",
        pincodes: ["250001", "250002", "250004", "250005"],
      },
      {
        name: "Prayagraj (Allahabad)",
        pincodes: ["211001", "211002", "211003", "211006"],
      },
      {
        name: "Bareilly",
        pincodes: ["243001", "243003", "243005", "243122"],
      },
      {
        name: "Aligarh",
        pincodes: ["202001", "202002"],
      },
      {
        name: "Moradabad",
        pincodes: ["244001", "244102"],
      },
      {
        name: "Gorakhpur",
        pincodes: ["273001", "273004", "273015"],
      },
      {
        name: "Jhansi",
        pincodes: ["284001", "284002", "284003"],
      },
      {
        name: "Ayodhya (Faizabad)",
        pincodes: ["224001", "224123"],
      },
      {
        name: "Mathura",
        pincodes: ["281001", "281003", "281004"],
      },
    ],
  },

  // 2. Delhi NCR
  {
    state: "Delhi NCR",
    code: "DL",
    cities: [
      {
        name: "Central Delhi (Connaught Place)",
        pincodes: ["110001", "110002", "110005", "110006", "110055"],
      },
      {
        name: "South Delhi (Hauz Khas, Saket)",
        pincodes: ["110016", "110017", "110019", "110024", "110029", "110048", "110049"],
      },
      {
        name: "West Delhi (Janakpuri, Rajouri)",
        pincodes: ["110015", "110018", "110026", "110027", "110058", "110063"],
      },
      {
        name: "North Delhi (Civil Lines, Rohini)",
        pincodes: ["110007", "110009", "110033", "110052", "110084", "110085"],
      },
      {
        name: "East Delhi (Laxmi Nagar, Mayur Vihar)",
        pincodes: ["110031", "110051", "110091", "110092", "110095", "110096"],
      },
      {
        name: "Dwarka",
        pincodes: ["110075", "110077", "110078"],
      },
    ],
  },

  // 3. Maharashtra
  {
    state: "Maharashtra",
    code: "MH",
    cities: [
      {
        name: "Mumbai",
        pincodes: ["400001", "400051", "400053", "400059", "400072", "400076", "400093", "400020"],
      },
      {
        name: "Pune",
        pincodes: ["411001", "411004", "411014", "411028", "411045", "411057", "411038"],
      },
      {
        name: "Nagpur",
        pincodes: ["440001", "440010", "440022", "440025"],
      },
      {
        name: "Thane",
        pincodes: ["400601", "400602", "400607", "400615"],
      },
      {
        name: "Navi Mumbai",
        pincodes: ["400703", "400705", "400706", "400709"],
      },
      {
        name: "Nashik",
        pincodes: ["422001", "422002", "422007", "422009"],
      },
      {
        name: "Chhatrapati Sambhajinagar (Aurangabad)",
        pincodes: ["431001", "431003", "431005"],
      },
      {
        name: "Solapur",
        pincodes: ["413001", "413002", "413003"],
      },
      {
        name: "Kolhapur",
        pincodes: ["416001", "416003", "416012"],
      },
    ],
  },

  // 4. Karnataka
  {
    state: "Karnataka",
    code: "KA",
    cities: [
      {
        name: "Bengaluru (Bangalore)",
        pincodes: [
          "560001", "560025", "560034", "560038", "560066", 
          "560068", "560100", "560102", "560103"
        ],
      },
      {
        name: "Mysuru (Mysore)",
        pincodes: ["570001", "570004", "570012", "570020"],
      },
      {
        name: "Mangaluru (Mangalore)",
        pincodes: ["575001", "575002", "575003"],
      },
      {
        name: "Hubballi-Dharwad",
        pincodes: ["580020", "580024", "580029"],
      },
      {
        name: "Belagavi (Belgaum)",
        pincodes: ["590001", "590002", "590006"],
      },
    ],
  },

  // 5. Tamil Nadu
  {
    state: "Tamil Nadu",
    code: "TN",
    cities: [
      {
        name: "Chennai",
        pincodes: ["600001", "600002", "600004", "600017", "600028", "600040", "600096"],
      },
      {
        name: "Coimbatore",
        pincodes: ["641001", "641004", "641012", "641018"],
      },
      {
        name: "Madurai",
        pincodes: ["625001", "625002", "625020"],
      },
      {
        name: "Tiruchirappalli (Trichy)",
        pincodes: ["620001", "620008", "620018"],
      },
      {
        name: "Salem",
        pincodes: ["636001", "636004", "636007"],
      },
      {
        name: "Tiruppur",
        pincodes: ["641601", "641602"],
      },
    ],
  },

  // 6. Telangana
  {
    state: "Telangana",
    code: "TS",
    cities: [
      {
        name: "Hyderabad",
        pincodes: ["500001", "500034", "500033", "500081", "500032", "500084", "500003"],
      },
      {
        name: "Warangal",
        pincodes: ["506001", "506002", "506009"],
      },
      {
        name: "Nizamabad",
        pincodes: ["503001", "503002"],
      },
      {
        name: "Karimnagar",
        pincodes: ["505001", "505002"],
      },
    ],
  },

  // 7. Gujarat
  {
    state: "Gujarat",
    code: "GJ",
    cities: [
      {
        name: "Ahmedabad",
        pincodes: ["380001", "380009", "380015", "380054", "380013", "380058"],
      },
      {
        name: "Surat",
        pincodes: ["395001", "395002", "395003", "395007", "395009"],
      },
      {
        name: "Vadodara (Baroda)",
        pincodes: ["390001", "390007", "390011", "390020"],
      },
      {
        name: "Rajkot",
        pincodes: ["360001", "360002", "360004", "360005"],
      },
      {
        name: "Gandhinagar",
        pincodes: ["382010", "382016", "382024"],
      },
      {
        name: "Bhavnagar",
        pincodes: ["364001", "364002"],
      },
    ],
  },

  // 8. Haryana
  {
    state: "Haryana",
    code: "HR",
    cities: [
      {
        name: "Gurugram (Gurgaon)",
        pincodes: ["122001", "122002", "122003", "122008", "122011", "122018"],
      },
      {
        name: "Faridabad",
        pincodes: ["121001", "121002", "121003", "121006", "121007"],
      },
      {
        name: "Panipat",
        pincodes: ["132103", "132104"],
      },
      {
        name: "Ambala",
        pincodes: ["133001", "134003"],
      },
      {
        name: "Karnal",
        pincodes: ["132001", "132002"],
      },
      {
        name: "Sonipat",
        pincodes: ["131001", "131029"],
      },
      {
        name: "Panchkula",
        pincodes: ["134109", "134112"],
      },
    ],
  },

  // 9. Rajasthan
  {
    state: "Rajasthan",
    code: "RJ",
    cities: [
      {
        name: "Jaipur",
        pincodes: ["302001", "302004", "302015", "302017", "302020", "302029"],
      },
      {
        name: "Jodhpur",
        pincodes: ["342001", "342003", "342008"],
      },
      {
        name: "Udaipur",
        pincodes: ["313001", "313002", "313004"],
      },
      {
        name: "Kota",
        pincodes: ["324001", "324005", "324007"],
      },
      {
        name: "Ajmer",
        pincodes: ["305001", "305004"],
      },
      {
        name: "Bikaner",
        pincodes: ["334001", "334003"],
      },
    ],
  },

  // 10. West Bengal
  {
    state: "West Bengal",
    code: "WB",
    cities: [
      {
        name: "Kolkata",
        pincodes: ["700001", "700019", "700029", "700064", "700091", "700020"],
      },
      {
        name: "Howrah",
        pincodes: ["711101", "711102", "711104"],
      },
      {
        name: "Siliguri",
        pincodes: ["734001", "734005"],
      },
      {
        name: "Durgapur",
        pincodes: ["713216", "713204"],
      },
      {
        name: "Asansol",
        pincodes: ["713301", "713304"],
      },
    ],
  },

  // 11. Punjab
  {
    state: "Punjab",
    code: "PB",
    cities: [
      {
        name: "Ludhiana",
        pincodes: ["141001", "141002", "141008", "141010"],
      },
      {
        name: "Amritsar",
        pincodes: ["143001", "143002", "143006"],
      },
      {
        name: "Jalandhar",
        pincodes: ["144001", "144003", "144008"],
      },
      {
        name: "SAS Nagar (Mohali)",
        pincodes: ["160055", "160059", "160070", "160071"],
      },
      {
        name: "Patiala",
        pincodes: ["147001", "147002"],
      },
      {
        name: "Bathinda",
        pincodes: ["151001", "151005"],
      },
    ],
  },

  // 12. Madhya Pradesh
  {
    state: "Madhya Pradesh",
    code: "MP",
    cities: [
      {
        name: "Indore",
        pincodes: ["452001", "452003", "452010", "452011", "452016"],
      },
      {
        name: "Bhopal",
        pincodes: ["462001", "462003", "462011", "462023"],
      },
      {
        name: "Jabalpur",
        pincodes: ["482001", "482002", "482008"],
      },
      {
        name: "Gwalior",
        pincodes: ["474001", "474006", "474011"],
      },
      {
        name: "Ujjain",
        pincodes: ["456001", "456006"],
      },
    ],
  },

  // 13. Kerala
  {
    state: "Kerala",
    code: "KL",
    cities: [
      {
        name: "Kochi (Cochin)",
        pincodes: ["682001", "682016", "682020", "682024", "682030"],
      },
      {
        name: "Thiruvananthapuram (Trivandrum)",
        pincodes: ["695001", "695004", "695011", "695033"],
      },
      {
        name: "Kozhikode (Calicut)",
        pincodes: ["673001", "673004", "673016"],
      },
      {
        name: "Thrissur",
        pincodes: ["680001", "680004", "680020"],
      },
    ],
  },

  // 14. Andhra Pradesh
  {
    state: "Andhra Pradesh",
    code: "AP",
    cities: [
      {
        name: "Visakhapatnam (Vizag)",
        pincodes: ["530001", "530016", "530020", "530048"],
      },
      {
        name: "Vijayawada",
        pincodes: ["520001", "520008", "520010"],
      },
      {
        name: "Guntur",
        pincodes: ["522001", "522002", "522006"],
      },
      {
        name: "Tirupati",
        pincodes: ["517501", "517507"],
      },
      {
        name: "Nellore",
        pincodes: ["524001", "524003"],
      },
    ],
  },

  // 15. Bihar
  {
    state: "Bihar",
    code: "BR",
    cities: [
      {
        name: "Patna",
        pincodes: ["800001", "800013", "800020", "800024"],
      },
      {
        name: "Gaya",
        pincodes: ["823001", "823002"],
      },
      {
        name: "Muzaffarpur",
        pincodes: ["842001", "842002"],
      },
      {
        name: "Bhagalpur",
        pincodes: ["812001", "812002"],
      },
    ],
  },

  // 16. Odisha
  {
    state: "Odisha",
    code: "OD",
    cities: [
      {
        name: "Bhubaneswar",
        pincodes: ["751001", "751010", "751012", "751024"],
      },
      {
        name: "Cuttack",
        pincodes: ["753001", "753003", "753009"],
      },
      {
        name: "Rourkela",
        pincodes: ["769001", "769004", "769012"],
      },
      {
        name: "Puri",
        pincodes: ["752001", "752002"],
      },
    ],
  },

  // 17. Jharkhand
  {
    state: "Jharkhand",
    code: "JH",
    cities: [
      {
        name: "Ranchi",
        pincodes: ["834001", "834002", "834004", "834009"],
      },
      {
        name: "Jamshedpur",
        pincodes: ["831001", "831004", "831011"],
      },
      {
        name: "Dhanbad",
        pincodes: ["826001", "826004"],
      },
      {
        name: "Bokaro",
        pincodes: ["827001", "827004"],
      },
    ],
  },

  // 18. Assam
  {
    state: "Assam",
    code: "AS",
    cities: [
      {
        name: "Guwahati",
        pincodes: ["781001", "781005", "781022", "781035"],
      },
      {
        name: "Silchar",
        pincodes: ["788001", "788005"],
      },
      {
        name: "Dibrugarh",
        pincodes: ["786001", "786004"],
      },
      {
        name: "Jorhat",
        pincodes: ["785001", "785008"],
      },
    ],
  },

  // 19. Chhattisgarh
  {
    state: "Chhattisgarh",
    code: "CG",
    cities: [
      {
        name: "Raipur",
        pincodes: ["492001", "492006", "492010"],
      },
      {
        name: "Bhilai - Durg",
        pincodes: ["490001", "490006", "490020"],
      },
      {
        name: "Bilaspur",
        pincodes: ["495001", "495004"],
      },
    ],
  },

  // 20. Uttarakhand
  {
    state: "Uttarakhand",
    code: "UK",
    cities: [
      {
        name: "Dehradun",
        pincodes: ["248001", "248006", "248008", "248011"],
      },
      {
        name: "Haridwar",
        pincodes: ["249401", "249403", "249407"],
      },
      {
        name: "Rishikesh",
        pincodes: ["249201", "249204"],
      },
      {
        name: "Haldwani",
        pincodes: ["263139", "263141"],
      },
      {
        name: "Roorkee",
        pincodes: ["247667", "247666"],
      },
    ],
  },

  // 21. Goa
  {
    state: "Goa",
    code: "GA",
    cities: [
      {
        name: "Panaji (Panjim)",
        pincodes: ["403001", "403002"],
      },
      {
        name: "Margao",
        pincodes: ["403601", "403602"],
      },
      {
        name: "Vasco da Gama",
        pincodes: ["403802"],
      },
      {
        name: "Mapusa",
        pincodes: ["403507"],
      },
    ],
  },

  // 22. Himachal Pradesh
  {
    state: "Himachal Pradesh",
    code: "HP",
    cities: [
      {
        name: "Shimla",
        pincodes: ["171001", "171002", "171004"],
      },
      {
        name: "Dharamshala",
        pincodes: ["176215", "176219"],
      },
      {
        name: "Solan",
        pincodes: ["173211", "173212"],
      },
      {
        name: "Baddi",
        pincodes: ["173205"],
      },
      {
        name: "Mandi",
        pincodes: ["175001"],
      },
    ],
  },

  // 23. Jammu & Kashmir
  {
    state: "Jammu & Kashmir",
    code: "JK",
    cities: [
      {
        name: "Srinagar",
        pincodes: ["190001", "190004", "190008"],
      },
      {
        name: "Jammu",
        pincodes: ["180001", "180004", "180012"],
      },
      {
        name: "Anantnag",
        pincodes: ["192101"],
      },
    ],
  },

  // 24. Chandigarh
  {
    state: "Chandigarh",
    code: "CH",
    cities: [
      {
        name: "Chandigarh City",
        pincodes: ["160001", "160017", "160022", "160036", "160047"],
      },
    ],
  },

  // 25. Puducherry
  {
    state: "Puducherry",
    code: "PY",
    cities: [
      {
        name: "Puducherry (Pondicherry)",
        pincodes: ["605001", "605004", "605009"],
      },
      {
        name: "Karaikal",
        pincodes: ["609602"],
      },
    ],
  },

  // 26. Tripura
  {
    state: "Tripura",
    code: "TR",
    cities: [
      {
        name: "Agartala",
        pincodes: ["799001", "799005"],
      },
    ],
  },

  // 27. Meghalaya
  {
    state: "Meghalaya",
    code: "ML",
    cities: [
      {
        name: "Shillong",
        pincodes: ["793001", "793003", "793014"],
      },
      {
        name: "Tura",
        pincodes: ["794001"],
      },
    ],
  },

  // 28. Manipur
  {
    state: "Manipur",
    code: "MN",
    cities: [
      {
        name: "Imphal",
        pincodes: ["795001", "795004"],
      },
    ],
  },

  // 29. Nagaland
  {
    state: "Nagaland",
    code: "NL",
    cities: [
      {
        name: "Kohima",
        pincodes: ["797001"],
      },
      {
        name: "Dimapur",
        pincodes: ["797112"],
      },
    ],
  },

  // 30. Mizoram
  {
    state: "Mizoram",
    code: "MZ",
    cities: [
      {
        name: "Aizawl",
        pincodes: ["796001", "796005"],
      },
    ],
  },

  // 31. Arunachal Pradesh
  {
    state: "Arunachal Pradesh",
    code: "AR",
    cities: [
      {
        name: "Itanagar",
        pincodes: ["791111"],
      },
      {
        name: "Naharlagun",
        pincodes: ["791110"],
      },
    ],
  },

  // 32. Sikkim
  {
    state: "Sikkim",
    code: "SK",
    cities: [
      {
        name: "Gangtok",
        pincodes: ["737101", "737102"],
      },
    ],
  },

  // 33. Ladakh
  {
    state: "Ladakh",
    code: "LA",
    cities: [
      {
        name: "Leh",
        pincodes: ["194101"],
      },
      {
        name: "Kargil",
        pincodes: ["194103"],
      },
    ],
  },

  // 34. Andaman & Nicobar
  {
    state: "Andaman and Nicobar",
    code: "AN",
    cities: [
      {
        name: "Port Blair",
        pincodes: ["744101", "744102", "744103"],
      },
    ],
  },

  // 35. Dadra & Nagar Haveli and Daman & Diu
  {
    state: "Dadra and Nagar Haveli and Daman and Diu",
    code: "DN",
    cities: [
      {
        name: "Daman",
        pincodes: ["396210"],
      },
      {
        name: "Silvassa",
        pincodes: ["396230"],
      },
      {
        name: "Diu",
        pincodes: ["362520"],
      },
    ],
  },

  // 36. Lakshadweep
  {
    state: "Lakshadweep",
    code: "LD",
    cities: [
      {
        name: "Kavaratti",
        pincodes: ["682555"],
      },
    ],
  },
];

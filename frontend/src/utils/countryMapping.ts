// Comprehensive country mapping system for consistent country name standardization
export interface CountryMapping {
  standardName: string;
  alternateNames: string[];
  codes: string[];
  abbreviations: string[];
}

export const COUNTRY_MAPPINGS: CountryMapping[] = [
  {
    standardName: "Afghanistan",
    alternateNames: ["Islamic Republic of Afghanistan"],
    codes: ["AF", "AFG"],
    abbreviations: ["AF", "AFG"]
  },
  {
    standardName: "Albania",
    alternateNames: ["Republic of Albania", "Shqipëria"],
    codes: ["AL", "ALB"],
    abbreviations: ["AL", "ALB"]
  },
  {
    standardName: "Algeria",
    alternateNames: ["People's Democratic Republic of Algeria", "Al Jaza'ir"],
    codes: ["DZ", "DZA"],
    abbreviations: ["DZ", "DZA"]
  },
  {
    standardName: "Andorra",
    alternateNames: ["Principality of Andorra"],
    codes: ["AD", "AND"],
    abbreviations: ["AD", "AND"]
  },
  {
    standardName: "Angola",
    alternateNames: ["Republic of Angola"],
    codes: ["AO", "AGO"],
    abbreviations: ["AO", "AGO"]
  },
  {
    standardName: "Antigua and Barbuda",
    alternateNames: ["Antigua & Barbuda"],
    codes: ["AG", "ATG"],
    abbreviations: ["AG", "ATG"]
  },
  {
    standardName: "Argentina",
    alternateNames: ["Argentine Republic"],
    codes: ["AR", "ARG"],
    abbreviations: ["AR", "ARG"]
  },
  {
    standardName: "Armenia",
    alternateNames: ["Republic of Armenia", "Hayastan"],
    codes: ["AM", "ARM"],
    abbreviations: ["AM", "ARM"]
  },
  {
    standardName: "Australia",
    alternateNames: ["Commonwealth of Australia", "Oz"],
    codes: ["AU", "AUS"],
    abbreviations: ["AU", "AUS"]
  },
  {
    standardName: "Austria",
    alternateNames: ["Republic of Austria", "Österreich"],
    codes: ["AT", "AUT"],
    abbreviations: ["AT", "AUT"]
  },
  {
    standardName: "Azerbaijan",
    alternateNames: ["Republic of Azerbaijan", "Azərbaycan"],
    codes: ["AZ", "AZE"],
    abbreviations: ["AZ", "AZE"]
  },
  {
    standardName: "Bahamas",
    alternateNames: ["Commonwealth of the Bahamas", "The Bahamas"],
    codes: ["BS", "BHS"],
    abbreviations: ["BS", "BHS"]
  },
  {
    standardName: "Bahrain",
    alternateNames: ["Kingdom of Bahrain", "Al Bahrayn"],
    codes: ["BH", "BHR"],
    abbreviations: ["BH", "BHR"]
  },
  {
    standardName: "Bangladesh",
    alternateNames: ["People's Republic of Bangladesh"],
    codes: ["BD", "BGD"],
    abbreviations: ["BD", "BGD"]
  },
  {
    standardName: "Barbados",
    alternateNames: [],
    codes: ["BB", "BRB"],
    abbreviations: ["BB", "BRB"]
  },
  {
    standardName: "Belarus",
    alternateNames: ["Republic of Belarus", "Byelorussia", "White Russia"],
    codes: ["BY", "BLR"],
    abbreviations: ["BY", "BLR"]
  },
  {
    standardName: "Belgium",
    alternateNames: ["Kingdom of Belgium", "België", "Belgique"],
    codes: ["BE", "BEL"],
    abbreviations: ["BE", "BEL"]
  },
  {
    standardName: "Belize",
    alternateNames: ["British Honduras"],
    codes: ["BZ", "BLZ"],
    abbreviations: ["BZ", "BLZ"]
  },
  {
    standardName: "Benin",
    alternateNames: ["Republic of Benin", "Dahomey"],
    codes: ["BJ", "BEN"],
    abbreviations: ["BJ", "BEN"]
  },
  {
    standardName: "Bhutan",
    alternateNames: ["Kingdom of Bhutan", "Druk Yul"],
    codes: ["BT", "BTN"],
    abbreviations: ["BT", "BTN"]
  },
  {
    standardName: "Bolivia",
    alternateNames: ["Plurinational State of Bolivia", "Bolivia (Plurinational State of)"],
    codes: ["BO", "BOL"],
    abbreviations: ["BO", "BOL"]
  },
  {
    standardName: "Bosnia and Herzegovina",
    alternateNames: ["Bosnia & Herzegovina", "BiH"],
    codes: ["BA", "BIH"],
    abbreviations: ["BA", "BIH"]
  },
  {
    standardName: "Botswana",
    alternateNames: ["Republic of Botswana"],
    codes: ["BW", "BWA"],
    abbreviations: ["BW", "BWA"]
  },
  {
    standardName: "Brazil",
    alternateNames: ["Federative Republic of Brazil", "Brasil"],
    codes: ["BR", "BRA"],
    abbreviations: ["BR", "BRA"]
  },
  {
    standardName: "Brunei",
    alternateNames: ["Brunei Darussalam", "Nation of Brunei"],
    codes: ["BN", "BRN"],
    abbreviations: ["BN", "BRN"]
  },
  {
    standardName: "Bulgaria",
    alternateNames: ["Republic of Bulgaria", "Bălgariya"],
    codes: ["BG", "BGR"],
    abbreviations: ["BG", "BGR"]
  },
  {
    standardName: "Burkina Faso",
    alternateNames: ["Upper Volta"],
    codes: ["BF", "BFA"],
    abbreviations: ["BF", "BFA"]
  },
  {
    standardName: "Burundi",
    alternateNames: ["Republic of Burundi"],
    codes: ["BI", "BDI"],
    abbreviations: ["BI", "BDI"]
  },
  {
    standardName: "Cambodia",
    alternateNames: ["Kingdom of Cambodia", "Kampuchea"],
    codes: ["KH", "KHM"],
    abbreviations: ["KH", "KHM"]
  },
  {
    standardName: "Cameroon",
    alternateNames: ["Republic of Cameroon", "Cameroun"],
    codes: ["CM", "CMR"],
    abbreviations: ["CM", "CMR"]
  },
  {
    standardName: "Canada",
    alternateNames: [],
    codes: ["CA", "CAN"],
    abbreviations: ["CA", "CAN"]
  },
  {
    standardName: "Cape Verde",
    alternateNames: ["Cabo Verde", "Republic of Cape Verde"],
    codes: ["CV", "CPV"],
    abbreviations: ["CV", "CPV"]
  },
  {
    standardName: "Central African Republic",
    alternateNames: ["CAR", "Central African Rep."],
    codes: ["CF", "CAF"],
    abbreviations: ["CF", "CAF", "CAR"]
  },
  {
    standardName: "Chad",
    alternateNames: ["Republic of Chad", "Tchad"],
    codes: ["TD", "TCD"],
    abbreviations: ["TD", "TCD"]
  },
  {
    standardName: "Chile",
    alternateNames: ["Republic of Chile"],
    codes: ["CL", "CHL"],
    abbreviations: ["CL", "CHL"]
  },
  {
    standardName: "China",
    alternateNames: ["People's Republic of China", "PRC", "Zhongguo"],
    codes: ["CN", "CHN"],
    abbreviations: ["CN", "CHN", "PRC"]
  },
  {
    standardName: "Colombia",
    alternateNames: ["Republic of Colombia"],
    codes: ["CO", "COL"],
    abbreviations: ["CO", "COL"]
  },
  {
    standardName: "Comoros",
    alternateNames: ["Union of the Comoros"],
    codes: ["KM", "COM"],
    abbreviations: ["KM", "COM"]
  },
  {
    standardName: "Congo",
    alternateNames: ["Republic of the Congo", "Congo-Brazzaville"],
    codes: ["CG", "COG"],
    abbreviations: ["CG", "COG"]
  },
  {
    standardName: "Democratic Republic of the Congo",
    alternateNames: ["DRC", "Congo-Kinshasa", "Zaire"],
    codes: ["CD", "COD"],
    abbreviations: ["CD", "COD", "DRC"]
  },
  {
    standardName: "Costa Rica",
    alternateNames: ["Republic of Costa Rica"],
    codes: ["CR", "CRI"],
    abbreviations: ["CR", "CRI"]
  },
  {
    standardName: "Croatia",
    alternateNames: ["Republic of Croatia", "Hrvatska"],
    codes: ["HR", "HRV"],
    abbreviations: ["HR", "HRV"]
  },
  {
    standardName: "Cuba",
    alternateNames: ["Republic of Cuba"],
    codes: ["CU", "CUB"],
    abbreviations: ["CU", "CUB"]
  },
  {
    standardName: "Cyprus",
    alternateNames: ["Republic of Cyprus", "Kypros"],
    codes: ["CY", "CYP"],
    abbreviations: ["CY", "CYP"]
  },
  {
    standardName: "Czech Republic",
    alternateNames: ["Czechia", "Czech Rep.", "Česká republika"],
    codes: ["CZ", "CZE"],
    abbreviations: ["CZ", "CZE"]
  },
  {
    standardName: "Denmark",
    alternateNames: ["Kingdom of Denmark", "Danmark"],
    codes: ["DK", "DNK"],
    abbreviations: ["DK", "DNK"]
  },
  {
    standardName: "Djibouti",
    alternateNames: ["Republic of Djibouti"],
    codes: ["DJ", "DJI"],
    abbreviations: ["DJ", "DJI"]
  },
  {
    standardName: "Dominica",
    alternateNames: ["Commonwealth of Dominica"],
    codes: ["DM", "DMA"],
    abbreviations: ["DM", "DMA"]
  },
  {
    standardName: "Dominican Republic",
    alternateNames: ["Dominican Rep.", "DR"],
    codes: ["DO", "DOM"],
    abbreviations: ["DO", "DOM", "DR"]
  },
  {
    standardName: "Ecuador",
    alternateNames: ["Republic of Ecuador"],
    codes: ["EC", "ECU"],
    abbreviations: ["EC", "ECU"]
  },
  {
    standardName: "Egypt",
    alternateNames: ["Arab Republic of Egypt", "Misr"],
    codes: ["EG", "EGY"],
    abbreviations: ["EG", "EGY"]
  },
  {
    standardName: "El Salvador",
    alternateNames: ["Republic of El Salvador"],
    codes: ["SV", "SLV"],
    abbreviations: ["SV", "SLV"]
  },
  {
    standardName: "Equatorial Guinea",
    alternateNames: ["Republic of Equatorial Guinea"],
    codes: ["GQ", "GNQ"],
    abbreviations: ["GQ", "GNQ"]
  },
  {
    standardName: "Eritrea",
    alternateNames: ["State of Eritrea"],
    codes: ["ER", "ERI"],
    abbreviations: ["ER", "ERI"]
  },
  {
    standardName: "Estonia",
    alternateNames: ["Republic of Estonia", "Eesti"],
    codes: ["EE", "EST"],
    abbreviations: ["EE", "EST"]
  },
  {
    standardName: "Eswatini",
    alternateNames: ["Swaziland", "Kingdom of Eswatini"],
    codes: ["SZ", "SWZ"],
    abbreviations: ["SZ", "SWZ"]
  },
  {
    standardName: "Ethiopia",
    alternateNames: ["Federal Democratic Republic of Ethiopia"],
    codes: ["ET", "ETH"],
    abbreviations: ["ET", "ETH"]
  },
  {
    standardName: "Fiji",
    alternateNames: ["Republic of Fiji"],
    codes: ["FJ", "FJI"],
    abbreviations: ["FJ", "FJI"]
  },
  {
    standardName: "Finland",
    alternateNames: ["Republic of Finland", "Suomi"],
    codes: ["FI", "FIN"],
    abbreviations: ["FI", "FIN"]
  },
  {
    standardName: "France",
    alternateNames: ["French Republic", "République française"],
    codes: ["FR", "FRA"],
    abbreviations: ["FR", "FRA"]
  },
  {
    standardName: "Gabon",
    alternateNames: ["Gabonese Republic"],
    codes: ["GA", "GAB"],
    abbreviations: ["GA", "GAB"]
  },
  {
    standardName: "Gambia",
    alternateNames: ["Republic of the Gambia", "The Gambia"],
    codes: ["GM", "GMB"],
    abbreviations: ["GM", "GMB"]
  },
  {
    standardName: "Georgia",
    alternateNames: ["Sakartvelo"],
    codes: ["GE", "GEO"],
    abbreviations: ["GE", "GEO"]
  },
  {
    standardName: "Germany",
    alternateNames: ["Federal Republic of Germany", "Deutschland"],
    codes: ["DE", "DEU"],
    abbreviations: ["DE", "DEU", "GER"]
  },
  {
    standardName: "Ghana",
    alternateNames: ["Republic of Ghana"],
    codes: ["GH", "GHA"],
    abbreviations: ["GH", "GHA"]
  },
  {
    standardName: "Greece",
    alternateNames: ["Hellenic Republic", "Hellas", "Ellada"],
    codes: ["GR", "GRC"],
    abbreviations: ["GR", "GRC"]
  },
  {
    standardName: "Grenada",
    alternateNames: [],
    codes: ["GD", "GRD"],
    abbreviations: ["GD", "GRD"]
  },
  {
    standardName: "Guatemala",
    alternateNames: ["Republic of Guatemala"],
    codes: ["GT", "GTM"],
    abbreviations: ["GT", "GTM"]
  },
  {
    standardName: "Guinea",
    alternateNames: ["Republic of Guinea", "Guinea-Conakry"],
    codes: ["GN", "GIN"],
    abbreviations: ["GN", "GIN"]
  },
  {
    standardName: "Guinea-Bissau",
    alternateNames: ["Republic of Guinea-Bissau"],
    codes: ["GW", "GNB"],
    abbreviations: ["GW", "GNB"]
  },
  {
    standardName: "Guyana",
    alternateNames: ["Co-operative Republic of Guyana"],
    codes: ["GY", "GUY"],
    abbreviations: ["GY", "GUY"]
  },
  {
    standardName: "Haiti",
    alternateNames: ["Republic of Haiti", "Haïti"],
    codes: ["HT", "HTI"],
    abbreviations: ["HT", "HTI"]
  },
  {
    standardName: "Honduras",
    alternateNames: ["Republic of Honduras"],
    codes: ["HN", "HND"],
    abbreviations: ["HN", "HND"]
  },
  {
    standardName: "Hungary",
    alternateNames: ["Magyarország"],
    codes: ["HU", "HUN"],
    abbreviations: ["HU", "HUN"]
  },
  {
    standardName: "Iceland",
    alternateNames: ["Republic of Iceland", "Ísland"],
    codes: ["IS", "ISL"],
    abbreviations: ["IS", "ISL"]
  },
  {
    standardName: "India",
    alternateNames: ["Republic of India", "Bharat"],
    codes: ["IN", "IND"],
    abbreviations: ["IN", "IND"]
  },
  {
    standardName: "Indonesia",
    alternateNames: ["Republic of Indonesia"],
    codes: ["ID", "IDN"],
    abbreviations: ["ID", "IDN"]
  },
  {
    standardName: "Iran",
    alternateNames: ["Islamic Republic of Iran", "Persia"],
    codes: ["IR", "IRN"],
    abbreviations: ["IR", "IRN"]
  },
  {
    standardName: "Iraq",
    alternateNames: ["Republic of Iraq"],
    codes: ["IQ", "IRQ"],
    abbreviations: ["IQ", "IRQ"]
  },
  {
    standardName: "Ireland",
    alternateNames: ["Republic of Ireland", "Éire"],
    codes: ["IE", "IRL"],
    abbreviations: ["IE", "IRL"]
  },
  {
    standardName: "Israel",
    alternateNames: ["State of Israel"],
    codes: ["IL", "ISR"],
    abbreviations: ["IL", "ISR"]
  },
  {
    standardName: "Italy",
    alternateNames: ["Italian Republic", "Italia"],
    codes: ["IT", "ITA"],
    abbreviations: ["IT", "ITA"]
  },
  {
    standardName: "Ivory Coast",
    alternateNames: ["Côte d'Ivoire", "Republic of Côte d'Ivoire"],
    codes: ["CI", "CIV"],
    abbreviations: ["CI", "CIV"]
  },
  {
    standardName: "Jamaica",
    alternateNames: [],
    codes: ["JM", "JAM"],
    abbreviations: ["JM", "JAM"]
  },
  {
    standardName: "Japan",
    alternateNames: ["Nippon", "Nihon"],
    codes: ["JP", "JPN"],
    abbreviations: ["JP", "JPN", "JAP"]
  },
  {
    standardName: "Jordan",
    alternateNames: ["Hashemite Kingdom of Jordan", "Al Urdun"],
    codes: ["JO", "JOR"],
    abbreviations: ["JO", "JOR"]
  },
  {
    standardName: "Kazakhstan",
    alternateNames: ["Republic of Kazakhstan", "Qazaqstan"],
    codes: ["KZ", "KAZ"],
    abbreviations: ["KZ", "KAZ"]
  },
  {
    standardName: "Kenya",
    alternateNames: ["Republic of Kenya"],
    codes: ["KE", "KEN"],
    abbreviations: ["KE", "KEN"]
  },
  {
    standardName: "Kiribati",
    alternateNames: ["Republic of Kiribati"],
    codes: ["KI", "KIR"],
    abbreviations: ["KI", "KIR"]
  },
  {
    standardName: "North Korea",
    alternateNames: ["Democratic People's Republic of Korea", "DPRK"],
    codes: ["KP", "PRK"],
    abbreviations: ["KP", "PRK", "DPRK"]
  },
  {
    standardName: "South Korea",
    alternateNames: ["Republic of Korea", "Korea"],
    codes: ["KR", "KOR"],
    abbreviations: ["KR", "KOR"]
  },
  {
    standardName: "Kuwait",
    alternateNames: ["State of Kuwait", "Al Kuwayt"],
    codes: ["KW", "KWT"],
    abbreviations: ["KW", "KWT"]
  },
  {
    standardName: "Kyrgyzstan",
    alternateNames: ["Kyrgyz Republic", "Kirghizstan"],
    codes: ["KG", "KGZ"],
    abbreviations: ["KG", "KGZ"]
  },
  {
    standardName: "Laos",
    alternateNames: ["Lao People's Democratic Republic", "Lao PDR"],
    codes: ["LA", "LAO"],
    abbreviations: ["LA", "LAO"]
  },
  {
    standardName: "Latvia",
    alternateNames: ["Republic of Latvia", "Latvija"],
    codes: ["LV", "LVA"],
    abbreviations: ["LV", "LVA"]
  },
  {
    standardName: "Lebanon",
    alternateNames: ["Lebanese Republic", "Lubnan"],
    codes: ["LB", "LBN"],
    abbreviations: ["LB", "LBN"]
  },
  {
    standardName: "Lesotho",
    alternateNames: ["Kingdom of Lesotho"],
    codes: ["LS", "LSO"],
    abbreviations: ["LS", "LSO"]
  },
  {
    standardName: "Liberia",
    alternateNames: ["Republic of Liberia"],
    codes: ["LR", "LBR"],
    abbreviations: ["LR", "LBR"]
  },
  {
    standardName: "Libya",
    alternateNames: ["State of Libya", "Libiya"],
    codes: ["LY", "LBY"],
    abbreviations: ["LY", "LBY"]
  },
  {
    standardName: "Liechtenstein",
    alternateNames: ["Principality of Liechtenstein"],
    codes: ["LI", "LIE"],
    abbreviations: ["LI", "LIE"]
  },
  {
    standardName: "Lithuania",
    alternateNames: ["Republic of Lithuania", "Lietuva"],
    codes: ["LT", "LTU"],
    abbreviations: ["LT", "LTU"]
  },
  {
    standardName: "Luxembourg",
    alternateNames: ["Grand Duchy of Luxembourg", "Lëtzebuerg"],
    codes: ["LU", "LUX"],
    abbreviations: ["LU", "LUX"]
  },
  {
    standardName: "Madagascar",
    alternateNames: ["Republic of Madagascar", "Madagasikara"],
    codes: ["MG", "MDG"],
    abbreviations: ["MG", "MDG"]
  },
  {
    standardName: "Malawi",
    alternateNames: ["Republic of Malawi"],
    codes: ["MW", "MWI"],
    abbreviations: ["MW", "MWI"]
  },
  {
    standardName: "Malaysia",
    alternateNames: [],
    codes: ["MY", "MYS"],
    abbreviations: ["MY", "MYS"]
  },
  {
    standardName: "Maldives",
    alternateNames: ["Republic of Maldives"],
    codes: ["MV", "MDV"],
    abbreviations: ["MV", "MDV"]
  },
  {
    standardName: "Mali",
    alternateNames: ["Republic of Mali"],
    codes: ["ML", "MLI"],
    abbreviations: ["ML", "MLI"]
  },
  {
    standardName: "Malta",
    alternateNames: ["Republic of Malta"],
    codes: ["MT", "MLT"],
    abbreviations: ["MT", "MLT"]
  },
  {
    standardName: "Marshall Islands",
    alternateNames: ["Republic of the Marshall Islands"],
    codes: ["MH", "MHL"],
    abbreviations: ["MH", "MHL"]
  },
  {
    standardName: "Mauritania",
    alternateNames: ["Islamic Republic of Mauritania"],
    codes: ["MR", "MRT"],
    abbreviations: ["MR", "MRT"]
  },
  {
    standardName: "Mauritius",
    alternateNames: ["Republic of Mauritius"],
    codes: ["MU", "MUS"],
    abbreviations: ["MU", "MUS"]
  },
  {
    standardName: "Mexico",
    alternateNames: ["United Mexican States", "México"],
    codes: ["MX", "MEX"],
    abbreviations: ["MX", "MEX"]
  },
  {
    standardName: "Micronesia",
    alternateNames: ["Federated States of Micronesia", "FSM"],
    codes: ["FM", "FSM"],
    abbreviations: ["FM", "FSM"]
  },
  {
    standardName: "Moldova",
    alternateNames: ["Republic of Moldova"],
    codes: ["MD", "MDA"],
    abbreviations: ["MD", "MDA"]
  },
  {
    standardName: "Monaco",
    alternateNames: ["Principality of Monaco"],
    codes: ["MC", "MCO"],
    abbreviations: ["MC", "MCO"]
  },
  {
    standardName: "Mongolia",
    alternateNames: ["Mongol Uls"],
    codes: ["MN", "MNG"],
    abbreviations: ["MN", "MNG"]
  },
  {
    standardName: "Montenegro",
    alternateNames: ["Crna Gora"],
    codes: ["ME", "MNE"],
    abbreviations: ["ME", "MNE"]
  },
  {
    standardName: "Morocco",
    alternateNames: ["Kingdom of Morocco", "Al Maghrib"],
    codes: ["MA", "MAR"],
    abbreviations: ["MA", "MAR"]
  },
  {
    standardName: "Mozambique",
    alternateNames: ["Republic of Mozambique", "Moçambique"],
    codes: ["MZ", "MOZ"],
    abbreviations: ["MZ", "MOZ"]
  },
  {
    standardName: "Myanmar",
    alternateNames: ["Republic of the Union of Myanmar", "Burma"],
    codes: ["MM", "MMR"],
    abbreviations: ["MM", "MMR"]
  },
  {
    standardName: "Namibia",
    alternateNames: ["Republic of Namibia"],
    codes: ["NA", "NAM"],
    abbreviations: ["NA", "NAM"]
  },
  {
    standardName: "Nauru",
    alternateNames: ["Republic of Nauru"],
    codes: ["NR", "NRU"],
    abbreviations: ["NR", "NRU"]
  },
  {
    standardName: "Nepal",
    alternateNames: ["Federal Democratic Republic of Nepal"],
    codes: ["NP", "NPL"],
    abbreviations: ["NP", "NPL"]
  },
  {
    standardName: "Netherlands",
    alternateNames: ["Kingdom of the Netherlands", "Holland", "Nederland"],
    codes: ["NL", "NLD"],
    abbreviations: ["NL", "NLD"]
  },
  {
    standardName: "New Zealand",
    alternateNames: ["Aotearoa"],
    codes: ["NZ", "NZL"],
    abbreviations: ["NZ", "NZL"]
  },
  {
    standardName: "Nicaragua",
    alternateNames: ["Republic of Nicaragua"],
    codes: ["NI", "NIC"],
    abbreviations: ["NI", "NIC"]
  },
  {
    standardName: "Niger",
    alternateNames: ["Republic of the Niger"],
    codes: ["NE", "NER"],
    abbreviations: ["NE", "NER"]
  },
  {
    standardName: "Nigeria",
    alternateNames: ["Federal Republic of Nigeria"],
    codes: ["NG", "NGA"],
    abbreviations: ["NG", "NGA"]
  },
  {
    standardName: "North Macedonia",
    alternateNames: ["Republic of North Macedonia", "Macedonia", "FYROM"],
    codes: ["MK", "MKD"],
    abbreviations: ["MK", "MKD"]
  },
  {
    standardName: "Norway",
    alternateNames: ["Kingdom of Norway", "Norge"],
    codes: ["NO", "NOR"],
    abbreviations: ["NO", "NOR"]
  },
  {
    standardName: "Oman",
    alternateNames: ["Sultanate of Oman"],
    codes: ["OM", "OMN"],
    abbreviations: ["OM", "OMN"]
  },
  {
    standardName: "Pakistan",
    alternateNames: ["Islamic Republic of Pakistan"],
    codes: ["PK", "PAK"],
    abbreviations: ["PK", "PAK"]
  },
  {
    standardName: "Palau",
    alternateNames: ["Republic of Palau"],
    codes: ["PW", "PLW"],
    abbreviations: ["PW", "PLW"]
  },
  {
    standardName: "Panama",
    alternateNames: ["Republic of Panama", "Panamá"],
    codes: ["PA", "PAN"],
    abbreviations: ["PA", "PAN"]
  },
  {
    standardName: "Papua New Guinea",
    alternateNames: ["Independent State of Papua New Guinea", "PNG"],
    codes: ["PG", "PNG"],
    abbreviations: ["PG", "PNG"]
  },
  {
    standardName: "Paraguay",
    alternateNames: ["Republic of Paraguay"],
    codes: ["PY", "PRY"],
    abbreviations: ["PY", "PRY"]
  },
  {
    standardName: "Peru",
    alternateNames: ["Republic of Peru", "Perú"],
    codes: ["PE", "PER"],
    abbreviations: ["PE", "PER"]
  },
  {
    standardName: "Philippines",
    alternateNames: ["Republic of the Philippines", "Pilipinas"],
    codes: ["PH", "PHL"],
    abbreviations: ["PH", "PHL"]
  },
  {
    standardName: "Poland",
    alternateNames: ["Republic of Poland", "Polska"],
    codes: ["PL", "POL"],
    abbreviations: ["PL", "POL"]
  },
  {
    standardName: "Portugal",
    alternateNames: ["Portuguese Republic"],
    codes: ["PT", "PRT"],
    abbreviations: ["PT", "PRT"]
  },
  {
    standardName: "Qatar",
    alternateNames: ["State of Qatar"],
    codes: ["QA", "QAT"],
    abbreviations: ["QA", "QAT"]
  },
  {
    standardName: "Romania",
    alternateNames: ["România"],
    codes: ["RO", "ROU"],
    abbreviations: ["RO", "ROU"]
  },
  {
    standardName: "Russia",
    alternateNames: ["Russian Federation", "Rossiya"],
    codes: ["RU", "RUS"],
    abbreviations: ["RU", "RUS"]
  },
  {
    standardName: "Rwanda",
    alternateNames: ["Republic of Rwanda"],
    codes: ["RW", "RWA"],
    abbreviations: ["RW", "RWA"]
  },
  {
    standardName: "Saint Kitts and Nevis",
    alternateNames: ["Federation of Saint Christopher and Nevis", "St. Kitts and Nevis"],
    codes: ["KN", "KNA"],
    abbreviations: ["KN", "KNA"]
  },
  {
    standardName: "Saint Lucia",
    alternateNames: ["St. Lucia"],
    codes: ["LC", "LCA"],
    abbreviations: ["LC", "LCA"]
  },
  {
    standardName: "Saint Vincent and the Grenadines",
    alternateNames: ["St. Vincent and the Grenadines"],
    codes: ["VC", "VCT"],
    abbreviations: ["VC", "VCT"]
  },
  {
    standardName: "Samoa",
    alternateNames: ["Independent State of Samoa"],
    codes: ["WS", "WSM"],
    abbreviations: ["WS", "WSM"]
  },
  {
    standardName: "San Marino",
    alternateNames: ["Republic of San Marino"],
    codes: ["SM", "SMR"],
    abbreviations: ["SM", "SMR"]
  },
  {
    standardName: "Sao Tome and Principe",
    alternateNames: ["Democratic Republic of São Tomé and Príncipe"],
    codes: ["ST", "STP"],
    abbreviations: ["ST", "STP"]
  },
  {
    standardName: "Saudi Arabia",
    alternateNames: ["Kingdom of Saudi Arabia", "KSA", "Al Arabiyah as Suudiyah"],
    codes: ["SA", "SAU"],
    abbreviations: ["SA", "SAU", "KSA"]
  },
  {
    standardName: "Senegal",
    alternateNames: ["Republic of Senegal", "Sénégal"],
    codes: ["SN", "SEN"],
    abbreviations: ["SN", "SEN"]
  },
  {
    standardName: "Serbia",
    alternateNames: ["Republic of Serbia", "Srbija"],
    codes: ["RS", "SRB"],
    abbreviations: ["RS", "SRB"]
  },
  {
    standardName: "Seychelles",
    alternateNames: ["Republic of Seychelles"],
    codes: ["SC", "SYC"],
    abbreviations: ["SC", "SYC"]
  },
  {
    standardName: "Sierra Leone",
    alternateNames: ["Republic of Sierra Leone"],
    codes: ["SL", "SLE"],
    abbreviations: ["SL", "SLE"]
  },
  {
    standardName: "Singapore",
    alternateNames: ["Republic of Singapore"],
    codes: ["SG", "SGP"],
    abbreviations: ["SG", "SGP"]
  },
  {
    standardName: "Slovakia",
    alternateNames: ["Slovak Republic", "Slovensko"],
    codes: ["SK", "SVK"],
    abbreviations: ["SK", "SVK"]
  },
  {
    standardName: "Slovenia",
    alternateNames: ["Republic of Slovenia", "Slovenija"],
    codes: ["SI", "SVN"],
    abbreviations: ["SI", "SVN"]
  },
  {
    standardName: "Solomon Islands",
    alternateNames: [],
    codes: ["SB", "SLB"],
    abbreviations: ["SB", "SLB"]
  },
  {
    standardName: "Somalia",
    alternateNames: ["Federal Republic of Somalia", "Soomaaliya"],
    codes: ["SO", "SOM"],
    abbreviations: ["SO", "SOM"]
  },
  {
    standardName: "South Africa",
    alternateNames: ["Republic of South Africa", "RSA"],
    codes: ["ZA", "ZAF"],
    abbreviations: ["ZA", "ZAF", "RSA"]
  },
  {
    standardName: "South Sudan",
    alternateNames: ["Republic of South Sudan"],
    codes: ["SS", "SSD"],
    abbreviations: ["SS", "SSD"]
  },
  {
    standardName: "Spain",
    alternateNames: ["Kingdom of Spain", "España"],
    codes: ["ES", "ESP"],
    abbreviations: ["ES", "ESP"]
  },
  {
    standardName: "Sri Lanka",
    alternateNames: ["Democratic Socialist Republic of Sri Lanka", "Ceylon"],
    codes: ["LK", "LKA"],
    abbreviations: ["LK", "LKA"]
  },
  {
    standardName: "Sudan",
    alternateNames: ["Republic of the Sudan", "As Sudan"],
    codes: ["SD", "SDN"],
    abbreviations: ["SD", "SDN"]
  },
  {
    standardName: "Suriname",
    alternateNames: ["Republic of Suriname"],
    codes: ["SR", "SUR"],
    abbreviations: ["SR", "SUR"]
  },
  {
    standardName: "Sweden",
    alternateNames: ["Kingdom of Sweden", "Sverige"],
    codes: ["SE", "SWE"],
    abbreviations: ["SE", "SWE"]
  },
  {
    standardName: "Switzerland",
    alternateNames: ["Swiss Confederation", "Schweiz", "Suisse", "Svizzera"],
    codes: ["CH", "CHE"],
    abbreviations: ["CH", "CHE"]
  },
  {
    standardName: "Syria",
    alternateNames: ["Syrian Arab Republic", "Suriyah"],
    codes: ["SY", "SYR"],
    abbreviations: ["SY", "SYR"]
  },
  {
    standardName: "Taiwan",
    alternateNames: ["Republic of China", "ROC", "Chinese Taipei"],
    codes: ["TW", "TWN"],
    abbreviations: ["TW", "TWN", "ROC"]
  },
  {
    standardName: "Tajikistan",
    alternateNames: ["Republic of Tajikistan", "Tojikiston"],
    codes: ["TJ", "TJK"],
    abbreviations: ["TJ", "TJK"]
  },
  {
    standardName: "Tanzania",
    alternateNames: ["United Republic of Tanzania"],
    codes: ["TZ", "TZA"],
    abbreviations: ["TZ", "TZA"]
  },
  {
    standardName: "Thailand",
    alternateNames: ["Kingdom of Thailand", "Siam"],
    codes: ["TH", "THA"],
    abbreviations: ["TH", "THA"]
  },
  {
    standardName: "Timor-Leste",
    alternateNames: ["East Timor", "Democratic Republic of Timor-Leste"],
    codes: ["TL", "TLS"],
    abbreviations: ["TL", "TLS"]
  },
  {
    standardName: "Togo",
    alternateNames: ["Togolese Republic"],
    codes: ["TG", "TGO"],
    abbreviations: ["TG", "TGO"]
  },
  {
    standardName: "Tonga",
    alternateNames: ["Kingdom of Tonga"],
    codes: ["TO", "TON"],
    abbreviations: ["TO", "TON"]
  },
  {
    standardName: "Trinidad and Tobago",
    alternateNames: ["Republic of Trinidad and Tobago"],
    codes: ["TT", "TTO"],
    abbreviations: ["TT", "TTO"]
  },
  {
    standardName: "Tunisia",
    alternateNames: ["Republic of Tunisia", "Tunis"],
    codes: ["TN", "TUN"],
    abbreviations: ["TN", "TUN"]
  },
  {
    standardName: "Turkey",
    alternateNames: ["Republic of Turkey", "Türkiye"],
    codes: ["TR", "TUR"],
    abbreviations: ["TR", "TUR"]
  },
  {
    standardName: "Turkmenistan",
    alternateNames: ["Türkmenistan"],
    codes: ["TM", "TKM"],
    abbreviations: ["TM", "TKM"]
  },
  {
    standardName: "Tuvalu",
    alternateNames: [],
    codes: ["TV", "TUV"],
    abbreviations: ["TV", "TUV"]
  },
  {
    standardName: "Uganda",
    alternateNames: ["Republic of Uganda"],
    codes: ["UG", "UGA"],
    abbreviations: ["UG", "UGA"]
  },
  {
    standardName: "Ukraine",
    alternateNames: ["Ukrayina"],
    codes: ["UA", "UKR"],
    abbreviations: ["UA", "UKR"]
  },
  {
    standardName: "United Arab Emirates",
    alternateNames: ["UAE", "Emirates", "Al Imarat"],
    codes: ["AE", "ARE"],
    abbreviations: ["AE", "ARE", "UAE"]
  },
  {
    standardName: "United Kingdom",
    alternateNames: ["UK", "Britain", "Great Britain", "England", "Scotland", "Wales", "Northern Ireland", "U.K."],
    codes: ["GB", "GBR"],
    abbreviations: ["UK", "U.K.", "GB", "GBR"]
  },
  {
    standardName: "United States",
    alternateNames: ["United States of America", "America", "USA", "US", "U.S.", "U.S.A.", "States"],
    codes: ["US", "USA"],
    abbreviations: ["US", "U.S.", "USA", "U.S.A."]
  },
  {
    standardName: "Uruguay",
    alternateNames: ["Oriental Republic of Uruguay"],
    codes: ["UY", "URY"],
    abbreviations: ["UY", "URY"]
  },
  {
    standardName: "Uzbekistan",
    alternateNames: ["Republic of Uzbekistan", "O'zbekiston"],
    codes: ["UZ", "UZB"],
    abbreviations: ["UZ", "UZB"]
  },
  {
    standardName: "Vanuatu",
    alternateNames: ["Republic of Vanuatu"],
    codes: ["VU", "VUT"],
    abbreviations: ["VU", "VUT"]
  },
  {
    standardName: "Vatican City",
    alternateNames: ["Vatican", "Holy See", "Vatican City State"],
    codes: ["VA", "VAT"],
    abbreviations: ["VA", "VAT"]
  },
  {
    standardName: "Venezuela",
    alternateNames: ["Bolivarian Republic of Venezuela"],
    codes: ["VE", "VEN"],
    abbreviations: ["VE", "VEN"]
  },
  {
    standardName: "Vietnam",
    alternateNames: ["Socialist Republic of Vietnam", "Viet Nam"],
    codes: ["VN", "VNM"],
    abbreviations: ["VN", "VNM"]
  },
  {
    standardName: "Yemen",
    alternateNames: ["Republic of Yemen", "Al Yaman"],
    codes: ["YE", "YEM"],
    abbreviations: ["YE", "YEM"]
  },
  {
    standardName: "Zambia",
    alternateNames: ["Republic of Zambia"],
    codes: ["ZM", "ZMB"],
    abbreviations: ["ZM", "ZMB"]
  },
  {
    standardName: "Zimbabwe",
    alternateNames: ["Republic of Zimbabwe"],
    codes: ["ZW", "ZWE"],
    abbreviations: ["ZW", "ZWE"]
  },
  // Additional territories and dependencies
  {
    standardName: "Hong Kong",
    alternateNames: ["Hong Kong SAR", "HK"],
    codes: ["HK", "HKG"],
    abbreviations: ["HK", "HKG"]
  },
  {
    standardName: "Macau",
    alternateNames: ["Macao", "Macau SAR"],
    codes: ["MO", "MAC"],
    abbreviations: ["MO", "MAC"]
  },
  {
    standardName: "Palestine",
    alternateNames: ["State of Palestine", "Palestinian Territories"],
    codes: ["PS", "PSE"],
    abbreviations: ["PS", "PSE"]
  },
  {
    standardName: "Kosovo",
    alternateNames: ["Republic of Kosovo"],
    codes: ["XK", "XKX"],
    abbreviations: ["XK", "XKX"]
  }
];

// Normalize text for comparison (remove punctuation, convert to lowercase)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove all punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Find the standardized country name for a given input
export function getStandardCountryName(input: string): string {
  if (!input || !input.trim()) return input;

  const normalizedInput = normalizeText(input);
  
  // First, check for exact matches with standard names
  for (const mapping of COUNTRY_MAPPINGS) {
    if (normalizeText(mapping.standardName) === normalizedInput) {
      return mapping.standardName;
    }
  }

  // Then check alternate names, codes, and abbreviations
  for (const mapping of COUNTRY_MAPPINGS) {
    const allVariants = [
      ...mapping.alternateNames,
      ...mapping.codes,
      ...mapping.abbreviations
    ];
    
    for (const variant of allVariants) {
      if (normalizeText(variant) === normalizedInput) {
        return mapping.standardName;
      }
    }
  }

  // If no mapping found, return the original input (capitalized)
  return input.trim().split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Get autocomplete suggestions based on user input
export function getCountrySuggestions(input: string, limit: number = 10): string[] {
  if (!input || !input.trim()) {
    // Return all standard country names if no input
    return COUNTRY_MAPPINGS.map(m => m.standardName).slice(0, limit);
  }

  const normalizedInput = normalizeText(input);
  const suggestions = new Set<string>();

  // Find matches in standard names first
  for (const mapping of COUNTRY_MAPPINGS) {
    if (normalizeText(mapping.standardName).includes(normalizedInput)) {
      suggestions.add(mapping.standardName);
    }
  }

  // Then find matches in alternate names, codes, and abbreviations
  for (const mapping of COUNTRY_MAPPINGS) {
    const allVariants = [
      ...mapping.alternateNames,
      ...mapping.codes,
      ...mapping.abbreviations
    ];
    
    for (const variant of allVariants) {
      if (normalizeText(variant).includes(normalizedInput)) {
        suggestions.add(mapping.standardName);
      }
    }
  }

  // Convert to array and sort by relevance (exact matches first, then partial matches)
  const suggestionArray = Array.from(suggestions);
  
  return suggestionArray
    .sort((a, b) => {
      const aExact = normalizeText(a).startsWith(normalizedInput);
      const bExact = normalizeText(b).startsWith(normalizedInput);
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      return a.localeCompare(b);
    })
    .slice(0, limit);
}

// Check if a country name is valid (has a mapping or is already standardized)
export function isValidCountryName(input: string): boolean {
  if (!input || !input.trim()) return false;
  
  const standardized = getStandardCountryName(input);
  return COUNTRY_MAPPINGS.some(m => m.standardName === standardized);
}

// Get all standard country names for dropdowns
export function getAllStandardCountryNames(): string[] {
  return COUNTRY_MAPPINGS.map(m => m.standardName).sort();
}

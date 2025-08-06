export interface LondonArea {
  zone: string;
  color: string;
  areas: string[];
}

export const londonAreas: LondonArea[] = [
  {
    zone: "CENTRAL LONDON (Zone 1)",
    color: "bg-blue-500",
    areas: ["Westminster", "Soho", "Mayfair", "Covent Garden", "Holborn", "Fitzrovia", "Bloomsbury", "Marylebone", "Pimlico", "Belgravia", "St James's", "City of London", "Clerkenwell", "Barbican", "Farringdon", "King's Cross", "South Bank", "Waterloo", "Temple"]
  },
  {
    zone: "WEST LONDON",
    color: "bg-green-500",
    areas: ["Notting Hill", "Chelsea", "Kensington", "Earl's Court", "Ladbroke Grove", "South Kensington", "Holland Park", "North Kensington", "West Brompton", "Hammersmith", "Fulham", "Shepherd's Bush", "White City", "West Kensington", "Parsons Green", "Sands End", "Ealing", "Acton", "Hanwell", "Southall", "Northolt", "Greenford", "Perivale"]
  },
  {
    zone: "NORTH LONDON", 
    color: "bg-yellow-500",
    areas: ["Camden Town", "Hampstead", "Belsize Park", "Kentish Town", "Gospel Oak", "Swiss Cottage", "West Hampstead", "Chalk Farm", "Angel", "Highbury", "Islington", "Holloway", "Barnsbury", "Canonbury", "Finsbury", "Archway", "Finchley", "Golders Green", "Hendon", "Mill Hill", "Edgware", "Burnt Oak", "East Barnet", "Totteridge", "Colindale", "Tottenham", "Wood Green", "Muswell Hill", "Crouch End", "Hornsey", "Bounds Green", "Seven Sisters", "Highgate"]
  },
  {
    zone: "EAST LONDON",
    color: "bg-red-500", 
    areas: ["Hackney Central", "Dalston", "Shoreditch", "Hoxton", "Stoke Newington", "London Fields", "Homerton", "Haggerston", "Canary Wharf", "Whitechapel", "Bethnal Green", "Bow", "Mile End", "Poplar", "Wapping", "Limehouse", "Shadwell", "Stratford", "Plaistow", "East Ham", "West Ham", "Canning Town", "Forest Gate", "Manor Park", "Beckton", "Custom House", "Walthamstow", "Leyton", "Leytonstone", "Chingford", "Highams Park", "Whipps Cross"]
  },
  {
    zone: "SOUTH LONDON",
    color: "bg-purple-500",
    areas: ["Brixton", "Clapham", "Streatham", "Vauxhall", "Kennington", "Norwood", "Stockwell", "Waterloo (South)", "Tulse Hill", "Peckham", "Bermondsey", "Camberwell", "Dulwich", "Elephant & Castle", "Rotherhithe", "Surrey Quays", "Nunhead", "East Dulwich", "Herne Hill", "Lewisham", "Catford", "Deptford", "New Cross", "Brockley", "Hither Green", "Sydenham", "Forest Hill", "Lee", "Croydon Town Centre", "Purley", "South Norwood", "Thornton Heath", "Addiscombe", "Selhurst", "Coulsdon", "Crystal Palace"]
  },
  {
    zone: "SOUTH WEST LONDON",
    color: "bg-orange-500",
    areas: ["Battersea", "Wandsworth Town", "Tooting", "Balham", "Putney", "Earlsfield", "Southfields", "Richmond", "Twickenham", "Kew", "Barnes", "Mortlake", "Sheen", "Hampton", "Teddington", "Whitton", "Kingston", "Surbiton", "New Malden", "Norbiton", "Tolworth", "Chessington"]
  },
  {
    zone: "NORTH WEST LONDON",
    color: "bg-amber-600",
    areas: ["Wembley", "Harlesden", "Kilburn", "Neasden", "Willesden", "Queensbury", "Stonebridge", "Kingsbury", "Harrow", "Wealdstone", "Stanmore", "Pinner", "Rayners Lane", "Hatch End"]
  },
  {
    zone: "OUTER EAST / SOUTH EAST",
    color: "bg-yellow-600", 
    areas: ["Bexleyheath", "Sidcup", "Crayford", "Erith", "Welling", "Belvedere", "Bromley", "Beckenham", "Orpington", "Chislehurst", "West Wickham", "Biggin Hill", "Penge"]
  },
  {
    zone: "HIGH-STREETS / HUBS",
    color: "bg-pink-500",
    areas: ["Oxford Street", "Regent Street", "Bond Street", "The Strand", "Old Street Roundabout", "Brick Lane", "Camden High Street", "Kings Road", "Westfield London (Shepherd's Bush)", "Westfield Stratford", "Carnaby Street", "Borough Market", "Liverpool Street", "Leicester Square", "Tottenham Court Road", "Victoria Station", "London Bridge", "King's Cross/St Pancras"]
  }
];
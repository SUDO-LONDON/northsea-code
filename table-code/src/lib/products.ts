export interface Product {
  id: string;
  name: string;
  hfo: number;
  vlsfo: number;
  mgo: number;
  change: number;
  lastUpdated: string;
  history?: number[]; // Added for price history
}

export const PRODUCTS: Product[] = [
  { id: "550e8400-e29b-41d4-a716-446655440001", name: "Rotterdam", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440002", name: "Antwerp", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440003", name: "Hamburg", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440004", name: "Gibraltar", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440005", name: "Malta", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440006", name: "Valencia", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440007", name: "Istanbul", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440008", name: "Jeddah", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440009", name: "Fujairah", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440010", name: "Mumbai", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440011", name: "Kochi", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440012", name: "Mongla", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440013", name: "Colombo", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440014", name: "Singapore", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440015", name: "Busan", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440016", name: "Shanghai", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440017", name: "Los Angeles", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440018", name: "Houston", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440019", name: "Vancouver", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "550e8400-e29b-41d4-a716-446655440020", name: "Panama", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() }
];

export interface Product {
  id: string;
  name: string;
  hfo: number;
  vlsfo: number;
  mgo: number;
  change: number;
  lastUpdated: string;
}

export const PRODUCTS: Product[] = [
  { id: "1", name: "Rotterdam", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "2", name: "Antwerp", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "3", name: "Hamburg", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "4", name: "Gibraltar", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "5", name: "Malta", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "6", name: "Valencia", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "7", name: "Istanbul", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "8", name: "Jeddah", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "9", name: "Fujairah", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "10", name: "Mumbai", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "11", name: "Kochi", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "12", name: "Mongla", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "13", name: "Colombo", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "14", name: "Singapore", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "15", name: "Busan", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "16", name: "Shanghai", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "17", name: "Los Angeles", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "18", name: "Houston", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "19", name: "Vancouver", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() },
  { id: "20", name: "Panama", hfo: 0, vlsfo: 0, mgo: 0, change: 0, lastUpdated: new Date().toISOString() }
];

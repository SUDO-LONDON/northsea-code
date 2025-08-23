export interface Product {
  id: string;
  name: string;
  hfo: number;
  vlsfo: number;
  mgo: number;
  change: number;
  lastUpdated: string;
}

export const PRODUCTS: Product[] = Array.from({ length: 20 }, (_, i) => ({
  id: (i + 1).toString(),
  name: "blank",
  hfo: 0,
  vlsfo: 0,
  mgo: 0,
  change: 0,
  lastUpdated: new Date().toISOString()
}));

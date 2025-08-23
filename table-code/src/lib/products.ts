export interface Product {
  id: string;
  name: string;
  price: number;
  lastUpdated: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "M0 SING 380 FP",
    price: 0,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "2",
    name: "M0 SG 10PPM FP",
    price: 0,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "3",
    name: "M0 0.5% GC FP",
    price: 0,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "4",
    name: "M0 0.1% BGS",
    price: 0,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "5",
    name: "M0 0.5% BGS FP",
    price: 0,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "6",
    name: "M0 0.5% SG FP",
    price: 0,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "7",
    name: "M0 3% GC FP",
    price: 0,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "8",
    name: "M0 3.5% BGS FP",
    price: 0,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "9",
    name: "M0 1% FOB FP",
    price: 0,
    lastUpdated: new Date().toISOString()
  }
];

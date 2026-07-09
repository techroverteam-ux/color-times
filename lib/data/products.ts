export type CollectionSlug =
  | "wedding"
  | "bridal"
  | "party-wear"
  | "festival"
  | "designer"
  | "accessories";

export interface DressListing {
  id: string;
  name: string;
  designer: string;
  category: CollectionSlug;
  pricePerDay: number;
  securityDeposit: number;
  sizes: string[];
  color: string;
  image: string;
  isNewArrival?: boolean;
}

export const dressCatalog: DressListing[] = [
  {
    id: "1",
    name: "Emerald Silk Anarkali",
    designer: "Ritu Kumar",
    category: "wedding",
    pricePerDay: 2499,
    securityDeposit: 5000,
    sizes: ["S", "M", "L"],
    color: "Emerald Green",
    image: "/images/placeholder/dresses/dress-7.png",
  },
  {
    id: "2",
    name: "Ivory Draped Gown",
    designer: "Tarun Tahiliani",
    category: "bridal",
    pricePerDay: 3299,
    securityDeposit: 8000,
    sizes: ["M", "L"],
    color: "Ivory",
    image: "/images/placeholder/dresses/dress-8.png",
    isNewArrival: true,
  },
  {
    id: "3",
    name: "Rosewood Lehenga",
    designer: "Sabyasachi",
    category: "bridal",
    pricePerDay: 4499,
    securityDeposit: 10000,
    sizes: ["S", "M", "L", "XL"],
    color: "Rosewood",
    image: "/images/placeholder/dresses/dress-10.png",
  },
  {
    id: "4",
    name: "Golden Dune Sharara",
    designer: "Anita Dongre",
    category: "festival",
    pricePerDay: 2199,
    securityDeposit: 4500,
    sizes: ["XS", "S", "M"],
    color: "Golden Dune",
    image: "/images/placeholder/dresses/dress-4.png",
  },
  {
    id: "5",
    name: "Sky Blue Cocktail Dress",
    designer: "Shantanu & Nikhil",
    category: "party-wear",
    pricePerDay: 1899,
    securityDeposit: 4000,
    sizes: ["XS", "S", "M", "L"],
    color: "Sky Blue",
    image: "/images/placeholder/dresses/dress-11.png",
    isNewArrival: true,
  },
  {
    id: "6",
    name: "Royal Indigo Sherwani Set",
    designer: "Manish Malhotra",
    category: "designer",
    pricePerDay: 2799,
    securityDeposit: 6000,
    sizes: ["M", "L", "XL"],
    color: "Royal Indigo",
    image: "/images/placeholder/dresses/dress-9.png",
  },
  {
    id: "7",
    name: "Desert Sand Kurta Set",
    designer: "Ritu Kumar",
    category: "festival",
    pricePerDay: 1699,
    securityDeposit: 3500,
    sizes: ["S", "M", "L", "XL"],
    color: "Desert Sand",
    image: "/images/placeholder/dresses/dress-6.png",
  },
  {
    id: "8",
    name: "Olive Green Draped Saree Gown",
    designer: "Tarun Tahiliani",
    category: "party-wear",
    pricePerDay: 2399,
    securityDeposit: 5500,
    sizes: ["S", "M", "L"],
    color: "Olive Green",
    image: "/images/placeholder/dresses/dress-12.png",
  },
  {
    id: "9",
    name: "Beige Layered Anarkali",
    designer: "Anita Dongre",
    category: "wedding",
    pricePerDay: 2899,
    securityDeposit: 6000,
    sizes: ["M", "L", "XL"],
    color: "Beige",
    image: "/images/placeholder/dresses/dress-2.png",
  },
  {
    id: "10",
    name: "Classic White Ensemble",
    designer: "Manish Malhotra",
    category: "designer",
    pricePerDay: 3599,
    securityDeposit: 7500,
    sizes: ["S", "M", "L"],
    color: "White",
    image: "/images/placeholder/dresses/dress-11.png",
  },
  {
    id: "11",
    name: "Marigold Statement Set",
    designer: "Sabyasachi",
    category: "festival",
    pricePerDay: 2099,
    securityDeposit: 4200,
    sizes: ["XS", "S", "M", "L"],
    color: "Marigold",
    image: "/images/placeholder/dresses/dress-3.png",
    isNewArrival: true,
  },
  {
    id: "12",
    name: "Champagne Drape Gown",
    designer: "Shantanu & Nikhil",
    category: "party-wear",
    pricePerDay: 2699,
    securityDeposit: 5800,
    sizes: ["S", "M"],
    color: "Champagne",
    image: "/images/placeholder/dresses/dress-1.png",
  },
];

export const collectionMeta: Record<
  CollectionSlug,
  { name: string; description: string; heroImage: string }
> = {
  wedding: {
    name: "Wedding Collection",
    description: "Timeless silhouettes for the bride's inner circle — sangeet, mehendi, and reception ready.",
    heroImage: "/images/placeholder/dresses/dress-1.png",
  },
  bridal: {
    name: "Bridal Collection",
    description: "Statement lehengas and gowns for your big day, from India's most celebrated couturiers.",
    heroImage: "/images/placeholder/dresses/dress-2.png",
  },
  "party-wear": {
    name: "Party Wear",
    description: "Cocktail-ready looks that turn heads at every celebration.",
    heroImage: "/images/placeholder/dresses/dress-3.png",
  },
  festival: {
    name: "Festival Collection",
    description: "Vibrant traditional wear for every festivity, from Diwali to Navratri.",
    heroImage: "/images/placeholder/dresses/dress-4.png",
  },
  designer: {
    name: "Designer Collection",
    description: "Runway pieces from India's leading designers, curated for the modern icon.",
    heroImage: "/images/placeholder/dresses/dress-5.png",
  },
  accessories: {
    name: "Accessories",
    description: "Jewellery, clutches & drapes to complete the look.",
    heroImage: "/images/placeholder/dresses/dress-6.png",
  },
};

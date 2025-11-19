export const products = [
    // Running Shoes
    {
        id: "1",
        name: "Nike Air Zoom Pegasus 40",
        category: "Running",
        price: 130,
        description: "A springy ride for every run, the Peg’s familiar, just-for-you feel returns to help you accomplish your goals.",
        imageUrl: "/placeholder.svg", // Replace with actual image paths later
        variants: [
            { size: "8", color: "Black", stock: 10 },
            { size: "9", color: "Black", stock: 5 },
            { size: "9", color: "White", stock: 8 },
        ],
    },
    {
        id: "2",
        name: "Adidas Ultraboost Light",
        category: "Running",
        price: 190,
        description: "Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever. The magic lies in the Light BOOST midsole.",
        imageUrl: "/placeholder.svg",
        variants: [
            { size: "9", color: "Grey", stock: 12 },
            { size: "10", color: "Grey", stock: 3 },
        ],
    },
    // Lifestyle Shoes
    {
        id: "3",
        name: "New Balance 550",
        category: "Lifestyle",
        price: 110,
        description: "The return of a legend. Originally worn by pro ballers in the ’80s and ’90s, the new 550 is simple, clean and true to its legacy.",
        imageUrl: "/placeholder.svg",
        variants: [
            { size: "7", color: "White/Green", stock: 20 },
            { size: "8", color: "White/Green", stock: 15 },
        ],
    },
    // Basketball Shoes
    {
        id: "4",
        name: "Jordan Tatum 2 'Vortex'",
        category: "Basketball",
        price: 125,
        description: "Go full-force from the first quarter to the fourth. The Tatum 2 is designed to keep up with your energy, with a lightweight build that won't weigh you down.",
        imageUrl: "/placeholder.svg",
        variants: [{ size: "11", color: "Mint Foam", stock: 7 }],
    },
];
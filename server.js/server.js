require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Universe Pro Finder API is running",
    status: "online",
  });
});

app.get("/search", (req, res) => {
  const query = (req.query.q || "universe_agency")
    .toLowerCase()
    .trim();

  const famousTakenNames = [
    "nike",
    "adidas",
    "apple",
    "google",
    "tesla",
    "netflix",
    "amazon",
    "instagram",
    "tiktok",
    "youtube",
    "spotify",
    "zara",
    "gucci",
    "prada",
    "dior",
    "louisvuitton",
    "chanel"
  ];

  const cleanedQuery = query.replace(/[^a-z0-9]/g, "");

  const isFamous = famousTakenNames.includes(cleanedQuery);

  const status = isFamous ? "Taken" : "Available";
  const score = isFamous ? 18 : 87;

  res.json({
    query,
    globalScore: score,
    message: isFamous
      ? "This name is already strongly occupied."
      : "Search completed successfully.",

    platforms: [
      { name: "Instagram", status },
      { name: "TikTok", status },
      { name: "YouTube", status },
      { name: "X / Twitter", status },
      { name: "LinkedIn", status },
      { name: "Facebook", status },
    ],

    domains: [
      { name: `${query}.com`, status, price: "$12/yr" },
      { name: `${query}.co`, status, price: "$28/yr" },
      { name: `${query}.studio`, status: "Available", price: "$42/yr" },
    ],

    suggestions: [
      `${query}Lab`,
      `${query}Studio`,
      `${query}World`,
      `${query}Collective`,
    ],
  });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Universe Pro Finder API running on port ${PORT}`);
});
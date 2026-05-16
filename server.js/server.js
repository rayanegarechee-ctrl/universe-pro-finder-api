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
async function checkUrl(url, platformName) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = await response.text();
    const text = html.toLowerCase();

    if (response.status === 404) {
  return platformName === "domain"
    ? "available"
    : "unknown";
}

    if (
      platformName === "Instagram" &&
      (
        text.includes("page isn't available") ||
        text.includes("cette page n’est malheureusement pas disponible") ||
        text.includes("le lien que vous avez suivi est peut-être rompu")
      )
    ) {
      return "unknown";

    }

if (platformName === "X / Twitter") {
  const handle = url.split("/").pop().toLowerCase();

  if (
    text.includes("this account doesn’t exist") ||
    text.includes("this account doesn't exist") ||
    text.includes("ce compte n'existe pas")
  ) {
    return "available";
  }

  if (
    text.includes(`@${handle}`) ||
    text.includes(`/${handle}`) ||
    text.includes(handle)
  ) {
    return "taken";
  }

  return "unknown";
}

if (response.status >= 200 && response.status < 400) {
  return "taken";
}

    return platformName === "domain" || platformName === "LinkedIn"
  ? "available"
  : "unknown";
  } catch (error) {
    return platformName === "domain" || platformName === "LinkedIn"
  ? "available"
  : "unknown";
  }
}
app.get("/search", async (req, res) => {
  const query = String(req.query.q || "").trim().toLowerCase();

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const platformsToCheck = [
    {
      name: "Instagram",
      url: `https://www.instagram.com/${query}/`
    },
    {
      name: "TikTok",
      url: `https://www.tiktok.com/@${query}`
    },
    {
      name: "YouTube",
      url: `https://www.youtube.com/@${query}`
    },
    {
      name: "X / Twitter",
      url: `https://x.com/${query}`
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/in/${query}`
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/${query}`
    }
  ];

  const domainsToCheck = [
    {
      name: `${query}.com`,
      url: `https://${query}.com`,
      price: "$12/yr"
    },
    {
      name: `${query}.co`,
      url: `https://${query}.co`,
      price: "$28/yr"
    },
    {
      name: `${query}.studio`,
      url: `https://${query}.studio`,
      price: "$42/yr"
    }
  ];

  const platforms = await Promise.all(
    platformsToCheck.map(async (platform) => ({
      name: platform.name,
      status: await checkUrl(platform.url, platform.name),
      url: platform.url
    }))
  );

  const domains = await Promise.all(
    domainsToCheck.map(async (domain) => ({
      name: domain.name,
      status: await checkUrl(domain.url, "domain"),
      price: domain.price,
      url: domain.url
    }))
  );

async function checkEmail(email) {
  try {
    const apiKey = process.env.QEV_API_KEY;

    if (!apiKey) return "unknown";

    const response = await fetch(
      `https://api.quickemailverification.com/v1/verify?email=${encodeURIComponent(email)}&apikey=${apiKey}`
    );

    const data = await response.json();

    if (data.result === "valid") {
      return "taken";
    }

    if (data.result === "invalid") {
      return "available";
    }

    return "unknown";

  } catch (error) {
    console.error("Email check error:", error);
    return "unknown";
  }
}
const emailsToCheck = [
  `hello@${query}.com`,
  `contact@${query}.com`,
  `team@${query}.com`,
  `studio@${query}.com`,
  `founder@${query}.com`,
  `press@${query}.com`,
  `business@${query}.com`,
  `${query}@gmail.com`,
  `${query}@outlook.com`,
  `${query}@hotmail.com`
];

const emails = await Promise.all(
  emailsToCheck.map(async (email) => ({
    email,
    status: await checkEmail(email)
  }))
);
  const takenCount =
    platforms.filter((p) => p.status === "taken").length +
    domains.filter((d) => d.status === "taken").length;

  const globalScore = Math.max(0, 100 - takenCount * 12);

  res.json({
    query,
    globalScore,
    message:
      takenCount > 0
        ? "Some names are already taken."
        : "This name looks available.",
    platforms,
    domains,
    emails,
    suggestions: [
      `${query}Lab`,
      `${query}Studio`,
      `${query}World`,
      `${query}Collective`
    ]
  });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Universe Pro Finder API running on port ${PORT}`);
});
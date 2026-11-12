# Triveni Terrace Café Website

A React + Vite website with a futuristic 3D-inspired homepage, menu cards, café story and visit information.

## Run locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Project structure

```text
triveni-terrace-cafe/
├── public/                       # Static files served as-is
├── src/
│   ├── assets/images/            # Logo and local image assets
│   ├── components/
│   │   ├── layout/               # Header and Footer
│   │   └── sections/             # Homepage sections
│   ├── data/
│   │   ├── menuData.js           # Dish names, prices, descriptions and photos
│   │   └── siteData.js           # Address, phone, email, hours and navigation
│   ├── pages/                    # Add separate route-level pages here
│   ├── styles/
│   │   ├── global.css            # Theme tokens and main layout styling
│   │   ├── header.css            # Header-specific styles
│   │   ├── hero.css              # Hero-specific styles
│   │   ├── menu.css              # Menu-specific styles
│   │   ├── sections.css          # Story, terrace and visit styles
│   │   ├── footer.css            # Footer styles
│   │   └── responsive.css        # Additional responsive overrides
│   ├── App.jsx                   # Combines the homepage components
│   └── main.jsx                  # React entry point
├── index.html
├── package.json
└── vite.config.js (optional; add when needed)
```

## Where to make changes

- **Change a dish, price, description or dish photo:** `src/data/menuData.js`
- **Change address, phone, email, opening hours or map link:** `src/data/siteData.js`
- **Change the café logo:** replace `src/assets/images/triveni-logo.png` with your logo (keep the same filename).
- **Edit the header or footer:** `src/components/layout/`
- **Edit a homepage section:** `src/components/sections/`
- **Change colours, typography, spacing and overall design:** `src/styles/global.css`
- **Add small component-specific CSS:** corresponding file in `src/styles/`
- **Change the overall homepage order:** `src/App.jsx`

## Notes

- Publicly listed prices and hours may change. Confirm them with the café before publishing.
- Some menu images are representative images; verify image rights and exact dish matches before commercial use.
- Remote menu photos require an internet connection.

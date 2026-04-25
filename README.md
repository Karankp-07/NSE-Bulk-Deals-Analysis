# NSE Bulk Deals Event Study + Interactive Dashboard

This is my major project for analyzing whether NSE bulk-deal disclosures contain useful signal for future price movement.

The project has two parts:

1. Research notebook for data prep, event-study computation, EDA, and modeling
2. Next.js dashboard to explore results interactively

## What This Project Tries To Answer

If institutions do large BUY/SELL bulk deals, can we use that information to estimate short-term future returns?

## Live Dashboard

Experience the project in action:

### NSE Bulk Deals Signal Dashboard

See the full interactive analytics app here:

https://nse-bulk-deals-analysis.vercel.app/

<img width="1886" height="1054" alt="image" src="https://github.com/user-attachments/assets/3161544a-0be7-4bf8-b154-e4c5ec8fff96" />


## Verified Current Folder Structure

Below is the structure currently present in this repository (checked against the actual workspace):

```text
Major Project/
├── Bulk-Deals-24-04-2025-to-24-04-2026.csv
├── bulk_deals_analysis.ipynb
├── event_study.csv
├── outputs/
│   └── (generated analysis charts)
├── nse-dashboard/
│   ├── public/
│   │   ├── Bulk-Deals-24-04-2025-to-24-04-2026.csv
│   │   └── event_study.csv
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── package.json
│   └── ... (Next.js config and build files)
└── README.md
```

## Data Files

1. Raw bulk deals:
	`Bulk-Deals-24-04-2025-to-24-04-2026.csv`
2. Processed event-study data:
	`event_study.csv`

The dashboard reads both CSVs from:

- `nse-dashboard/public/Bulk-Deals-24-04-2025-to-24-04-2026.csv`
- `nse-dashboard/public/event_study.csv`

## Notebook Workflow

Main notebook:

- `bulk_deals_analysis.ipynb`

What it does:

1. Loads raw bulk-deal records
2. Cleans and standardizes columns
3. Pulls historical prices via yfinance
4. Computes event-window returns (`Return_1D`, `Return_5D`, `Return_10D`, `Return_30D`)
5. Exports `event_study.csv`
6. Creates EDA plots in `outputs/`
7. Trains baseline models (Logistic Regression and Random Forest)

## Run Notebook Environment

Use Python 3.10+.

Install packages:

```bash
pip install pandas numpy matplotlib seaborn yfinance scikit-learn jupyter
```

Launch:

```bash
jupyter lab
```

## Dashboard Stack

Inside `nse-dashboard/`:

- Next.js + TypeScript + Tailwind CSS
- Recharts for visualization
- Papa Parse for CSV parsing

Current dashboard features:

1. KPI overview and activity charts
2. Top stocks and top buyers (descending order)
3. Searchable stock picker with return insight panel
4. Positive/negative return color coding
5. Filterable, sortable, paginated deals table

## Run Dashboard Locally

```bash
cd nse-dashboard
npm install
npm run dev
```

Open:

- http://localhost:3000

Production check:

```bash
cd nse-dashboard
npm run build
npm run start
```

## Notes on Interpretation

1. Symbols with fewer events have lower statistical confidence
2. Prefer checking mean return and positive-rate together
3. This is academic analysis, not trading advice

## Disclaimer

This project is for educational and research purposes only.

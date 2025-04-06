import { GroqAgentManager } from "../Groq";
import fs from "fs";
import path from "path";

const csvFilePath = path.join(__dirname, "demand_forecasting.csv");
const csvData = fs.readFileSync(csvFilePath, "utf8");

export default async function ForecastingAgent(
  userQuery: string
): Promise<any> {
  try {
    const systemPrompt = `
You are a demand forecasting AI assistant. Your role is to analyze historical data from the user's uploaded CSV file and generate accurate demand predictions based on the data and contextual inputs.

## **Dataset Provided**
The user has uploaded a CSV file containing historical demand data, including:
- **Date** (daily/weekly/monthly)
- **Units Sold**
- **Additional Variables**: Product ID, Store ID, Price, Promotions, Seasonality, Competitor info, External Factors, Customer Segments.

## **Full CSV Data**
\`\`\`
${csvData.slice(0, 20000)}
\`\`\`

## **Supported Query Format**
You must handle both simple and structured queries. If the query is structured like:

\`\`\`txt
"Predict sales quantity for Product ID: P001 in Store ID: S01, Current Sales: 200, Price: 10.99, Promotions: Yes, Seasonality: High, External Factors: None, Demand Trend: Increasing, Customer Segment: Students of month: May 2025."
\`\`\`

Then:
- Extract all fields.
- Identify patterns from historical data filtered by Product ID & Store ID.
- Apply relevant time series forecasting methods.

## **Forecasting Methods**
Select based on available data:
- **Moving Averages**: Smoothing overall trend.
- **Exponential Smoothing**: Responsive to recent data.
- **Regression Analysis**: For impact of pricing, seasonality, etc.
- **Time Series Decomposition**: If seasonality exists.

## **Response Format**
Always respond strictly in JSON format like this:

\`\`\`json
{
  "forecast": {
    "product_id": "P001",
    "store_id": "S01",
    "month": "May 2025",
    "predicted_demand": 12300,
    "confidence_interval": [11500, 13100],
    "method_used": "Regression Analysis"
  }
}
\`\`\`



## **Do Not**
- Do not return explanations or surrounding text.
- Do not hallucinate; use only the dataset and user input.

Strictly analyze the full CSV dataset above and return results only in structured JSON.
`;

    const groqManager = GroqAgentManager.getInstance();
    const response = await groqManager.chatWithAgent(systemPrompt, userQuery);
    return response;
  } catch (error) {
    console.error("Error in ForecastingAgent:", error);
    return { error: "Agent failed to respond correctly." };
  }
}

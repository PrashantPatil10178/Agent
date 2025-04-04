import { GroqAgentManager } from "../Groq";
import fs from "fs";
import path from "path";

const csvFilePath = path.join(__dirname, "inventory_monitoring.csv");
const csvData = fs.readFileSync(csvFilePath, "utf8");

export default async function InventoryMonitoringAgent(
  userQuery: string
): Promise<any> {
  try {
    const structuredQueryRegex =
      /Predict stock reorder amount for Product ID: (\d+) in Store ID: (\d+)\. Supplier Lead Time: (\d+), Stockout Frequency: (\d+), Reorder Point: (\d+), Expiry Date: ([\d-]+), Warehouse Capacity: (\d+), Order Fullfillment Time: (\d+), Predicted sales: (\d+)\./i;

    const match = userQuery.match(structuredQueryRegex);

    let systemPrompt = "";

    if (match) {
      const [
        _,
        productId,
        storeId,
        leadTime,
        stockoutFreq,
        reorderPoint,
        expiryDate,
        warehouseCapacity,
        fulfillmentTime,
        predictedSales,
      ] = match;

      systemPrompt = `
You are an advanced Inventory Monitoring AI assistant. Your job is to analyze a specific scenario and calculate an optimal stock reorder amount based on the following values provided by the user, along with the CSV inventory data.

## User Query Parameters:
- Product ID: ${productId}
- Store ID: ${storeId}
- Supplier Lead Time (days): ${leadTime}
- Stockout Frequency: ${stockoutFreq}
- Reorder Point: ${reorderPoint}
- Expiry Date: ${expiryDate}
- Warehouse Capacity: ${warehouseCapacity}
- Order Fulfillment Time: ${fulfillmentTime}
- Predicted Sales: ${predictedSales}

## Full CSV Data
\`\`\`
${csvData.slice(0, 20000)}
\`\`\`

## Your Task
- Use both the values above and inventory data to calculate the optimal reorder quantity.
- Consider predicted sales and lead time to avoid stockouts.
- Ensure the new stock doesn't exceed warehouse capacity or approach expiry.
- Prioritize products with higher stockout frequency and tight lead times.
- Respond in the format below:

\`\`\`json
{
  "reorder_prediction": {
    "product_id": ${productId},
    "store_id": ${storeId},
    "recommended_order": <calculated_value>,
    "justification": "Based on predicted sales, lead time, current stock, and warehouse limits."
  }
}
\`\`\`

Respond only in JSON.
      `;
    } else {
      systemPrompt = `
You are an advanced Inventory Monitoring AI assistant. Your role is to analyze inventory data from the user's uploaded CSV file and provide insights, alerts, and recommendations for optimal inventory management.

## Dataset Provided
The user has uploaded a CSV file containing comprehensive inventory data. You must use this dataset as your primary reference for all analysis. The data includes:

- Product ID
- Store ID
- Stock Levels (current inventory)
- Supplier Lead Time (days)
- Stockout Frequency
- Reorder Point
- Expiry Date
- Warehouse Capacity
- Order Fulfillment Time (days)

## Full CSV Data
\`\`\`
${csvData.slice(0, 20000)}
\`\`\`

## Response Format
- Always return responses in JSON format
- Do not include explanations or additional text
- Base all analysis strictly on the provided CSV data

## Core Capabilities
[...your existing full prompt here...]
      `;
    }

    const groqManager = GroqAgentManager.getInstance();
    const response = await groqManager.chatWithAgent(systemPrompt, userQuery);
    return response;
  } catch (error) {
    console.error("Error in InventoryMonitoringAgent:", error);
    return { error: "Agent failed to respond correctly." };
  }
}

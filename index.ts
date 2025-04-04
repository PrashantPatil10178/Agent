import express, { type Request, type Response } from "express";
import ForecastingAgent from "./ForeCasting/ForecastingAgent";
import InventoryMonitoringAgent from "./InventoryMonitoring/InventoryAgent";
import PriceOptimizationAgent from "./priceOptimization/priceOptimization";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/forecast", async (req: Request, res: Response): Promise<void> => {
  const userQuery: string = req.body.query;

  if (!userQuery) {
    res.status(400).json({ error: "User query is required." });
    return;
  }

  try {
    const forecastResponse = await ForecastingAgent(userQuery);
    res.json(forecastResponse);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

app.post("/inventory", async (req: Request, res: Response): Promise<void> => {
  const userQuery: string = req.body.query;
  if (!userQuery) {
    res.status(400).json({ error: "User query is required." });
    return;
  }
  try {
    const inventoryResponse = await InventoryMonitoringAgent(userQuery);
    res.json(inventoryResponse);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

app.post(
  "/priceOptimization",
  async (req: Request, res: Response): Promise<void> => {
    const userQuery: string = req.body.query;
    console.log("User Query:", userQuery);
    if (!userQuery) {
      res.status(400).json({ error: "User query is required." });
      return;
    }
    try {
      const priceOptimizationResponse = await PriceOptimizationAgent(userQuery);
      res.json(priceOptimizationResponse);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    }
  }
);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Demand Forecasting API!");
});

app.listen(6000, () => {
  console.log("Server is running on port 3000");
});

import express from "express";
import { youtrackRouter } from "./routes/youtrack";
import { errorHandler } from "./middleware/errorHandler";
import pico from "picocolors";

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", youtrackRouter);

// Error handling middleware
app.use(errorHandler);

// Function to start the server
export const startServer = (port: number | string) => {
  return app.listen(port, () => {
    console.log(pico.green(`YouTrack API running on port ${port}`));
    console.log();
    console.log(pico.bold("Available endpoints:"));
    console.log(`  GET   /health`);
    console.log(`  GET   /api/ticket/:ticketId`);
    console.log(`  POST  /api/ticket/:parentTicketId/subtask`);
    console.log(`  PATCH /api/ticket/:ticketId/description`);
    console.log(`  GET   /api/tickets/changes/:from/:to`);
    console.log();
    console.log(pico.bold("Examples:"));
    console.log(`  curl http://localhost:${port}/health`);
    console.log(`  curl http://localhost:${port}/api/ticket/PROJECT-123`);
    console.log(
      `  curl http://localhost:${port}/api/tickets/changes/2024-01-01/2024-01-31`,
    );
    console.log();
    console.log(pico.bold("Create a subtask (PowerShell):"));
    console.log(
      `  curl.exe -X POST http://localhost:${port}/api/ticket/PROJECT-123/subtask \``,
    );
    console.log(`    -H "Content-Type: application/json" \``);
    console.log(
      `    -d '{"title": "My feature", "description": "**Markdown** description"}'`,
    );
    console.log();
    console.log(pico.bold("Update ticket description (PowerShell):"));
    console.log(
      `  curl.exe -X PATCH http://localhost:${port}/api/ticket/PROJECT-123/description \``,
    );
    console.log(`    -H "Content-Type: application/json" \``);
    console.log(`    -d '{"description": "**Updated** description"}'`);
  });
};

// Export the app for testing purposes
export default app;

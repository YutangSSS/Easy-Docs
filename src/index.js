const fs = require("fs");
// Path to your original OpenAPI JSON file
const inputFilePath = "./data/input.json";
const outputFilePath = "./data/output.json";
// The bearer token you want to add
const bearerToken = "your_bearer_token_here";
// Read the existing OpenAPI JSON file
fs.readFile(inputFilePath, "utf8", (err, data) => {
    if (err) {
        console.error("Error reading the file:", err);
        return;
    }
    // Parse the JSON data
    let openApiJson = JSON.parse(data);
    console.log({openApiJson})
    // Add or update the authorization section
    openApiJson.components = openApiJson.components || {};
    openApiJson.components.securitySchemes = {
        BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "For accessing the API a valid JWT token must be passed in all the queries in the “Authorization” header.",
            value: `Bearer ${bearerToken}`
        }
    };
    // Convert the updated JSON object back to string
    const updatedJson = JSON.stringify(openApiJson, null, 4);
    // Save the updated JSON to a new file
    fs.writeFile(outputFilePath, updatedJson, "utf8", (err) => {
        if (err) {
            console.error("Error writing the file:", err);
            return;
        }
        console.log("Updated OpenAPI JSON saved to output.json");
    });
});
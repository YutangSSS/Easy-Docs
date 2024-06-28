const fs = require("fs");
// Path to your original OpenAPI JSON file
const inputFilePath = "./data/input.json";
const outputFilePath = "./data/output.json";

// List of allowed methods and paths
const allowedEndpoints = [
  { method: "POST", path: "/v1/chat/users" },
  { method: "GET", path: "/v1/chat/users/{id}" },
  { method: "GET", path: "/v1/chat/users" },
  { method: "POST", path: "/v1/chat/users/get-or-create" },
  { method: "PUT", path: "/v1/chat/users/{id}" },
  { method: "DELETE", path: "/v1/chat/users/{id}" },
  { method: "POST", path: "/v1/chat/conversations" },
  { method: "GET", path: "/v1/chat/conversations/{id}" },
  { method: "GET", path: "/v1/chat/conversations" },
  { method: "POST", path: "/v1/chat/conversations/get-or-create" },
  { method: "PUT", path: "/v1/chat/conversations/{id}" },
  { method: "DELETE", path: "/v1/chat/conversations/{id}" },
  { method: "GET", path: "/v1/chat/conversations/{id}/participants" },
  { method: "POST", path: "/v1/chat/conversations/{id}/participants" },
  { method: "GET", path: "/v1/chat/conversations/{id}/participants/{userId}" },
  {
    method: "DELETE",
    path: "/v1/chat/conversations/{id}/participants/{userId}",
  },
  { method: "POST", path: "/v1/chat/events" },
  { method: "GET", path: "/v1/chat/events/{id}" },
  { method: "GET", path: "/v1/chat/events" },
  { method: "POST", path: "/v1/chat/messages" },
  { method: "POST", path: "/v1/chat/messages/get-or-create" },
  { method: "GET", path: "/v1/chat/messages/{id}" },
  { method: "PUT", path: "/v1/chat/messages/{id}" },
  { method: "GET", path: "/v1/chat/messages" },
  { method: "DELETE", path: "/v1/chat/messages/{id}" },
  { method: "GET", path: "/v1/chat/states/{type}/{id}/{name}" },
  { method: "POST", path: "/v1/chat/states/{type}/{id}/{name}" },
  { method: "POST", path: "/v1/chat/states/{type}/{id}/{name}/get-or-set" },
  { method: "PATCH", path: "/v1/chat/states/{type}/{id}/{name}" },
  { method: "POST", path: "/v1/chat/actions" },
  { method: "POST", path: "/v1/admin/bots" },
  { method: "PUT", path: "/v1/admin/bots/{id}" },
  { method: "GET", path: "/v1/admin/bots" },
  { method: "GET", path: "/v1/admin/bots/{id}" },
  { method: "DELETE", path: "/v1/admin/bots/{id}" },
  { method: "GET", path: "/v1/admin/bots/{id}/logs" },
  { method: "GET", path: "/v1/admin/bots/{id}/analytics" },
  { method: "GET", path: "/v1/admin/bots/{id}/issues" },
  { method: "DELETE", path: "/v1/admin/bots/{id}/issues/{issueId}" },
  { method: "GET", path: "/v1/admin/bots/{id}/issues/{issueId}/events" },
];

fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }
  // Parse the JSON data
  let openApiJson = JSON.parse(data);

  // todo 0 : remove all endpoints not found in the website

  const isAllowed = (method, path) => {
    return allowedEndpoints.some((endpoint) => {
      const pathRegex = new RegExp(
        "^" + endpoint.path.replace(/{\w+}/g, "[^/]+") + "$"
      );
      return endpoint.method === method && pathRegex.test(path);
    });
  };

  // Filter the paths in the openapi object
  for (const path in openApiJson.paths) {
    for (const method in openApiJson.paths[path]) {
      if (!isAllowed(method.toUpperCase(), path)) {
        delete openApiJson.paths[path][method];
      }
    }
    if (Object.keys(openApiJson.paths[path]).length === 0) {
      delete openApiJson.paths[path];
    }
  }

  // todo 1 : add authentication methods

  openApiJson.components = openApiJson.components || {};
  openApiJson.components.securitySchemes = {
    PATAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "PAT",
    },
  };
  openApiJson.security = [
    {
      PATAuth: [],
    },
  ];

  // todo 2 : add correct headers to each request

  // todo 3: classify each endpoint using "tags" so they are organized

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

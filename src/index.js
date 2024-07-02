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
  {
    method: "GET",
    path: "/v1/tables"
  },
  {
    method: "GET",
    path: "/v1/tables/{table}"
  },
  {
    method: "POST",
    path: "/v1/tables/{table}"
  },
  {
    method: "POST",
    path: "/v1/tables"
  },
  {
    method: "POST",
    path: "/v1/tables/{sourceTableId}/duplicate"
  },
  {
    method: "PUT",
    path: "/v1/tables/{table}"
  },
  {
    method: "PUT",
    path: "/v1/tables/{table}/column"
  },
  {
    method: "DELETE",
    path: "/v1/tables/{table}"
  },
  {
    method: "GET",
    path: "/v1/tables/{table}/row"
  },
  {
    method: "POST",
    path: "/v1/tables/{table}/rows/find"
  },
  {
    method: "POST",
    path: "/v1/tables/{table}/rows"
  },
  {
    method: "POST",
    path: "/v1/tables/{table}/rows/delete"
  },
  {
    method: "PUT",
    path: "/v1/tables/{table}/rows"
  },
  {
    method: "POST",
    path: "/v1/tables/{table}/rows/upsert"
  },
  {
    method: "PUT",
    path: "/v1/files"
  },
  {
    method: "DELETE",
    path: "/v1/files/{id}"
  },
  {
    method: "GET",
    path: "/v1/files"
  },
  {
    method: "GET",
    path: "/v1/files/{id}"
  },
  {
    method: "PUT",
    path: "/v1/files/{id}"
  },
  {
    method: "GET",
    path: "/v1/files/search"
  }
]

const pathIncludesCategories = {
  '/chat/users': 'conversations',
  '/chat/conversations': 'conversations',
  '/chat/messages': 'conversations',
  '/chat/events': 'events',
  '/chat/states': 'states',
  '/chat/actions': 'actions',
  '/admin/bots': 'bots',
  '/files': 'files',
  '/tables': 'tables',
}
const headerIncludesCategories = {
  '/chat/': ["x-integration-id", "x-bot-id"],
  '/bots': ["x-workspace-id"],
  '/files': ["x-bot-id", "x-workspace-id"],
  '/tables': ["x-bot-id", "x-workspace-id"],
}

const getCategoryFromPath = (path) => { // for step 3

  for (const keyPath in pathIncludesCategories) {
    if (path.includes(keyPath)) {
      return pathIncludesCategories[keyPath]
    }
  }

  return "unclassified" //example   
}



const getHeadersFromPath = (path) => {
  for (const keyPath in headerIncludesCategories) {
    if (path.includes(keyPath)) {
      return headerIncludesCategories[keyPath]
    }
  }
  return []
}



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



  for (const path in openApiJson.paths) {
    for (const method in openApiJson.paths[path]) {
      // todo 2 : add correct headers to each request
      if (!openApiJson.paths[path][method].parameters) {
        openApiJson.paths[path][method].parameters = []

      }

      const requiredHeaders = getHeadersFromPath(path)

      openApiJson.paths[path][method].parameters.push(...requiredHeaders.map(headerName => ({
        "name": headerName,
        "in": "header",
        "required": true,
        "schema": {
          "type": "string"
        },
        "description": "Workspace ID"
      })))

      // todo 3: classify each endpoint using "tags" so they are organized
      openApiJson.paths[path][method].tags = [getCategoryFromPath(path)]

    }
  }

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

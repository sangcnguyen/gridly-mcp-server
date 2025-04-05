#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const API_BASE = "https://api.gridly.com/v1";
const API_KEY = process.env.GRIDLY_API_KEY;
if (!API_KEY) {
  throw new Error("GRIDLY_API_KEY variable is required!!");
}

const server = new Server(
  {
    name: "gridly-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const projectIdSchema = z.object({
  projectId: z.number().describe("Please provide the project ID"),
});

const optionalProjectIdSchema = z.object({
  projectId: z
    .number()
    .optional()
    .describe("Please provide the project ID (optional)"),
});

const databaseIdSchema = z.object({
  databaseId: z.string().describe("Please provide the database ID"),
});

const gridIdSchema = z.object({
  gridId: z.string().describe("Please provide the grid ID"),
});

const gridMetadataSchema = z.object({
  metadata: z
    .record(z.any())
    .optional()
    .describe(
      "Metadata object containing properties of the grid. Passing null into value will remove that key-value property (Optional)"
    ),
});

const columnIdSchema = z.object({
  columnId: z.string().describe("Please provide the column ID"),
});

const columnSchema = z.object({
  id: z.string().describe("Column ID"),
  editable: z.boolean().describe("Enable editable for this column"),
});

const viewIdSchema = z.object({
  viewId: z
    .string()
    .describe(
      "ID of the view. It can be found in the API quick start right panel of your Gridly Dashboard"
    ),
});

const recordIdSchema = z.object({
  recordId: z.string().describe("Id of the record to getting history"),
});

const dependencyIdSchema = z.object({
  dependencyId: z.string().describe("Please provide the dependency ID"),
});

const viewColumnSchema = viewIdSchema.merge(columnIdSchema);

const viewDependencySchema = viewIdSchema.merge(dependencyIdSchema);

const createGridSchema = z.object({
  ...databaseIdSchema.shape,
  name: z.string().describe("Please provide the grid name"),
  templateGridId: z
    .string()
    .optional()
    .describe("Please provide the template grid ID (Optional)"),
  ...gridMetadataSchema.shape,
});

const updateGridSchema = z.object({
  ...gridIdSchema.shape,
  name: z.string().describe("Please provide the grid name"),
  ...gridMetadataSchema.shape,
});

const createViewSchema = z.object({
  name: z.string().describe("View name"),
  ...gridIdSchema.shape,
  columns: z
    .array(columnSchema)
    .optional()
    .describe("List of columns (Optional)"),
});

const typeEnum = z.enum([
  "singleLine",
  "multipleLines",
  "richText",
  "markdown",
  "singleSelection",
  "multipleSelections",
  "boolean",
  "number",
  "datetime",
  "files",
  "reference",
  "language",
  "formula",
  "json",
  "yaml",
]);

const createColumnSchema = z.object({
  ...viewIdSchema.shape,
  id: z.string().optional().describe("Column ID (Optional)"),
  name: z.string().describe("Please provide the column name"),
  type: typeEnum.describe("Please provide the column type"),
});

const cellSchema = z.object({
  columnId: z.string().describe("ID of a column in a view"),
  value: z.string().describe("Value of a cell"),
});

const recordSchema = z.object({
  id: z
    .string()
    .optional()
    .describe("This parameter specify record Id of this record"),
  path: z
    .string()
    .optional()
    .describe(
      "This parameter specify path (folder) of this record. Use character / to indicate folder level (e.g Path Level 1/Path Level 2)"
    ),
  cells: z.array(cellSchema),
});

const addRecordsSchema = z.object({
  ...viewIdSchema.shape,
  records: z.array(recordSchema),
});

const deleteRecordsSchema = z.object({
  ...viewIdSchema.shape,
  ids: z.array(z.string()).describe("List of record IDs need to be deleted"),
});

const pageSchema = z.object({
  offset: z.number(),
  limit: z.number(),
});

const sortSchema = z.record(
  z.string().describe("The ID of the column to be sorted"),
  z.enum(["asc", "desc"])
);

const listRecordsSchema = z.object({
  ...viewIdSchema.shape,
  columnIds: z
    .array(z.string())
    .optional()
    .describe("Specify data of what columns of view to include in response"),
  page: pageSchema.optional().describe("Starting index and number of records"),
  sort: sortSchema.optional().describe("Order of records"),
});

const getRecordHistorySchema = z.object({
  ...viewIdSchema.shape,
  ...recordIdSchema.shape,
  page: pageSchema.optional(),
});

async function getProjects() {
  const response = await fetch(`${API_BASE}/projects`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
  });
  return response.json();
}

async function getProject(id: number) {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
  });
  return response.json();
}

async function getDatabases(projectId?: number) {
  const url = new URL(`${API_BASE}/databases`);

  if (projectId !== undefined) {
    url.searchParams.append("projectId", projectId.toString());
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
  });
  return response.json();
}

async function getDatabase(id: string) {
  const response = await fetch(`${API_BASE}/databases/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
  });
  return response.json();
}

async function getGrid(id: string) {
  const response = await fetch(`${API_BASE}/grids/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
  });
  return response.json();
}

async function createGrid(args: z.infer<typeof createGridSchema>) {
  const { databaseId, name } = createGridSchema.parse(args);
  const response = await fetch(`${API_BASE}/grids?dbId=${databaseId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
    body: JSON.stringify({
      name: name,
    }),
  });
  return response.json();
}

async function updateGrid(args: z.infer<typeof updateGridSchema>) {
  const { gridId, name, metadata } = updateGridSchema.parse(args);
  const response = await fetch(`${API_BASE}/grids/${gridId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
    body: JSON.stringify({
      name: name,
      metadata: metadata,
    }),
  });
  return response.json();
}

async function deleteGrid(gridId: string) {
  const response = await fetch(`${API_BASE}/grids/${gridId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
  });
  if (response.status === 204) {
    return true;
  }
}

async function getView(id: string) {
  const response = await fetch(`${API_BASE}/views/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
  });
  return response.json();
}

async function createView(args: z.infer<typeof createViewSchema>) {
  const { name, gridId, columns } = createViewSchema.parse(args);
  const response = await fetch(`${API_BASE}/views`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
    body: JSON.stringify({
      name: name,
      gridId: gridId,
      columns: columns,
    }),
  });
  return response.json();
}

async function getColumn(args: z.infer<typeof viewColumnSchema>) {
  const { viewId, columnId } = viewColumnSchema.parse(args);
  const response = await fetch(
    `${API_BASE}/views/${viewId}/columns/${columnId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${API_KEY}`,
      },
    }
  );
  return response.json();
}

async function createColumn(args: z.infer<typeof createColumnSchema>) {
  const { viewId, name, type } = createColumnSchema.parse(args);
  const response = await fetch(`${API_BASE}/views/${viewId}/columns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
    body: JSON.stringify({
      name: name,
      type: type,
    }),
  });
  return response.json();
}

async function deleteColumn(args: z.infer<typeof viewColumnSchema>) {
  const { viewId, columnId } = viewColumnSchema.parse(args);

  const response = await fetch(
    `${API_BASE}/views/${viewId}/columns/${columnId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${API_KEY}`,
      },
    }
  );
  if (response.status === 204) {
    return true;
  }
}

async function getDependencies(viewId: string) {
  const response = await fetch(`${API_BASE}/views/${viewId}/dependencies`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
  });
  return response.json();
}

async function getDependency(args: z.infer<typeof viewDependencySchema>) {
  const { viewId, dependencyId } = viewDependencySchema.parse(args);
  const response = await fetch(
    `${API_BASE}/views/${viewId}/dependencies/${dependencyId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${API_KEY}`,
      },
    }
  );
  return response.json();
}

async function deleteDependency(args: z.infer<typeof viewDependencySchema>) {
  const { viewId, dependencyId } = viewDependencySchema.parse(args);

  const response = await fetch(
    `${API_BASE}/views/${viewId}/dependencies/${dependencyId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${API_KEY}`,
      },
    }
  );
  if (response.status === 204) {
    return true;
  }
}

async function getRecords(args: z.infer<typeof listRecordsSchema>) {
  const { viewId, columnIds, page, sort } = listRecordsSchema.parse(args);

  const queryParams: string[] = [];
  if (columnIds) {
    queryParams.push(`columnIds=${columnIds}`);
  }
  if (page) {
    queryParams.push(`page=${encodeURIComponent(JSON.stringify(page))}`);
  }
  if (sort) {
    queryParams.push(`sort=${encodeURIComponent(JSON.stringify(sort))}`);
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

  const response = await fetch(
    `${API_BASE}/views/${viewId}/records${queryString}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${API_KEY}`,
      },
    }
  );
  return response.json();
}

async function addRecords(args: z.infer<typeof addRecordsSchema>) {
  const { viewId, records } = addRecordsSchema.parse(args);
  const response = await fetch(`${API_BASE}/views/${viewId}/records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
    body: JSON.stringify(records),
  });
  return response.json();
}

async function deleteRecords(args: z.infer<typeof deleteRecordsSchema>) {
  const { viewId, ids } = deleteRecordsSchema.parse(args);

  const response = await fetch(`${API_BASE}/views/${viewId}/records`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
    body: JSON.stringify({
      ids: ids,
    }),
  });
  if (response.status === 204) {
    return true;
  }
}

async function getRecordHistory(args: z.infer<typeof getRecordHistorySchema>) {
  const { viewId, recordId, page } = getRecordHistorySchema.parse(args);
  const queryParam = page
    ? `?page=${encodeURIComponent(JSON.stringify(page))}`
    : "";
  const response = await fetch(
    `${API_BASE}/views/${viewId}/records/${recordId}/histories${queryParam}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${API_KEY}`,
      },
    }
  );
  return response.json();
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_projects",
        description: "List projects of a company",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "retrieve_project",
        description: "Retrieve a project",
        inputSchema: zodToJsonSchema(projectIdSchema),
      },
      {
        name: "list_databases",
        description: "List databases in a project",
        inputSchema: zodToJsonSchema(optionalProjectIdSchema),
      },
      {
        name: "retrieve_database",
        description: "Retrieve a database",
        inputSchema: zodToJsonSchema(databaseIdSchema),
      },
      {
        name: "retrieve_grid",
        description: "Retrieve a grid",
        inputSchema: zodToJsonSchema(gridIdSchema),
      },
      {
        name: "create_grid",
        description: "Create a grid",
        inputSchema: zodToJsonSchema(createGridSchema),
      },
      {
        name: "update_grid",
        description: "Update a grid",
        inputSchema: zodToJsonSchema(updateGridSchema),
      },
      {
        name: "delete_grid",
        description: "Delete a grid",
        inputSchema: zodToJsonSchema(gridIdSchema),
      },
      {
        name: "retrieve_view",
        description: "Retrieve a view",
        inputSchema: zodToJsonSchema(viewIdSchema),
      },
      {
        name: "create_view",
        description: "Create a view",
        inputSchema: zodToJsonSchema(createViewSchema),
      },
      {
        name: "retrieve_column",
        description: "Retrieve a column",
        inputSchema: zodToJsonSchema(viewColumnSchema),
      },
      {
        name: "create_column",
        description: "Create a column",
        inputSchema: zodToJsonSchema(createColumnSchema),
      },
      {
        name: "delete_column",
        description: "Delete a column",
        inputSchema: zodToJsonSchema(viewColumnSchema),
      },
      {
        name: "list_dependencies",
        description: "List dependencies",
        inputSchema: zodToJsonSchema(viewIdSchema),
      },
      {
        name: "retrieve_dependency",
        description: "Retrieve a dependency",
        inputSchema: zodToJsonSchema(viewDependencySchema),
      },
      {
        name: "delete_dependency",
        description: "Delete a dependency",
        inputSchema: zodToJsonSchema(viewDependencySchema),
      },
      {
        name: "add_records",
        description: "Add new records to a view",
        inputSchema: zodToJsonSchema(addRecordsSchema),
      },
      {
        name: "delete_records",
        description: "Delete existing records of a view",
        inputSchema: zodToJsonSchema(deleteRecordsSchema),
      },
      {
        name: "list_records",
        description: "List records in a view",
        inputSchema: zodToJsonSchema(listRecordsSchema),
      },
      {
        name: "get_record_history",
        description: "Get record histories of a record in a view",
        inputSchema: zodToJsonSchema(getRecordHistorySchema),
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "list_projects": {
        const projects = await getProjects();
        return {
          content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
        };
      }

      case "retrieve_project": {
        const args = projectIdSchema.parse(request.params.arguments);
        const project = await getProject(args.projectId);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      }

      case "list_databases": {
        const args = projectIdSchema.partial().parse(request.params.arguments);
        const databases = await getDatabases(args.projectId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(databases, null, 2),
            },
          ],
        };
      }

      case "retrieve_database": {
        const args = databaseIdSchema.parse(request.params.arguments);
        const project = await getDatabase(args.databaseId);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      }

      case "retrieve_grid": {
        const args = gridIdSchema.parse(request.params.arguments);
        const project = await getGrid(args.gridId);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      }

      case "create_grid": {
        const args = createGridSchema.parse(request.params.arguments);
        const databases = await createGrid(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(databases, null, 2),
            },
          ],
        };
      }

      case "update_grid": {
        const args = updateGridSchema.parse(request.params.arguments);
        const databases = await updateGrid(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(databases, null, 2),
            },
          ],
        };
      }

      case "delete_grid": {
        const args = gridIdSchema.parse(request.params.arguments);
        const success = await deleteGrid(args.gridId);
        return {
          content: [
            {
              type: "text",
              text: success
                ? "Grid successfully deleted."
                : "Failed to delete grid.",
            },
          ],
        };
      }

      case "retrieve_view": {
        const args = viewIdSchema.parse(request.params.arguments);
        const project = await getView(args.viewId);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      }

      case "create_view": {
        const args = createViewSchema.parse(request.params.arguments);
        const databases = await createView(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(databases, null, 2),
            },
          ],
        };
      }

      case "retrieve_column": {
        const args = viewColumnSchema.parse(request.params.arguments);
        const project = await getColumn(args);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      }

      case "create_column": {
        const args = createColumnSchema.parse(request.params.arguments);
        const databases = await createColumn(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(databases, null, 2),
            },
          ],
        };
      }

      case "delete_column": {
        const args = viewColumnSchema.parse(request.params.arguments);
        const success = await deleteColumn(args);
        return {
          content: [
            {
              type: "text",
              text: success
                ? "Column successfully deleted."
                : "Failed to delete column.",
            },
          ],
        };
      }

      case "list_dependencies": {
        const args = viewIdSchema.parse(request.params.arguments);
        const databases = await getDependencies(args.viewId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(databases, null, 2),
            },
          ],
        };
      }

      case "retrieve_dependency": {
        const args = viewDependencySchema.parse(request.params.arguments);
        const project = await getDependency(args);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      }

      case "delete_dependency": {
        const args = viewDependencySchema.parse(request.params.arguments);
        const success = await deleteDependency(args);
        return {
          content: [
            {
              type: "text",
              text: success
                ? "Dependency successfully deleted."
                : "Failed to delete dependency.",
            },
          ],
        };
      }

      case "list_records": {
        const args = listRecordsSchema.parse(request.params.arguments);
        const records = await getRecords(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(records, null, 2),
            },
          ],
        };
      }

      case "add_records": {
        const args = addRecordsSchema.parse(request.params.arguments);
        const records = await addRecords(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(records, null, 2),
            },
          ],
        };
      }

      case "delete_records": {
        const args = deleteRecordsSchema.parse(request.params.arguments);
        const success = await deleteRecords(args);
        return {
          content: [
            {
              type: "text",
              text: success
                ? "Record(s) successfully deleted."
                : "Failed to delete record(s).",
            },
          ],
        };
      }

      case "get_record_history": {
        const args = getRecordHistorySchema.parse(request.params.arguments);
        const recordHistory = await getRecordHistory(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(recordHistory, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
    }
    throw error;
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Gridly MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

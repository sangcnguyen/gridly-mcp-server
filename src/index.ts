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

const ProjectIdSchema = z.object({
  projectId: z.number().describe("Please provide the project ID"),
});

const OptionalProjectIdSchema = z.object({
  projectId: z
    .number()
    .optional()
    .describe("Please provide the project ID (optional)"),
});

const DatabaseIdSchema = z.object({
  databaseId: z.string().describe("Please provide the database ID"),
});

const GridIdSchema = z.object({
  gridId: z.string().describe("Please provide the grid ID"),
});

const GridMetadataSchema = z.object({
  metadata: z
    .record(z.any())
    .optional()
    .describe("Please provide the metadata (Optional)"),
});

const ColumnIdSchema = z.object({
  columnId: z.string().describe("Please provide the column ID"),
});

const ColumnSchema = z.object({
  id: z.string().describe("Column ID"),
  editable: z.boolean().describe("Enable editable for this column"),
});

const ViewIdSchema = z.object({
  viewId: z.string().describe("Please provide the view ID"),
});

const DependencyIdSchema = z.object({
  dependencyId: z.string().describe("Please provide the dependency ID"),
});

const ViewColumnSchema = ViewIdSchema.merge(ColumnIdSchema);

const ViewDependencySchema = ViewIdSchema.merge(DependencyIdSchema);

const CreateGridSchema = z.object({
  ...DatabaseIdSchema.shape,
  name: z.string().describe("Please provide the grid name"),
  templateGridId: z
    .string()
    .optional()
    .describe("Please provide the template grid ID (Optional)"),
  ...GridMetadataSchema.shape,
});

const UpdateGridSchema = z.object({
  ...GridIdSchema.shape,
  name: z.string().describe("Please provide the grid name"),
  ...GridMetadataSchema.shape,
});

const CreateViewSchema = z.object({
  name: z.string().describe("Please provide the view name"),
  ...GridIdSchema.shape,
  columns: z
    .array(ColumnSchema)
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

const CreateColumnSchema = z.object({
  ...ViewIdSchema.shape,
  id: z.string().optional().describe("Column ID (Optional)"),
  name: z.string().describe("Please provide the column name"),
  type: typeEnum.describe("Please provide the column type"),
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

async function createGrid(args: z.infer<typeof CreateGridSchema>) {
  const { databaseId, name } = CreateGridSchema.parse(args);
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

async function updateGrid(args: z.infer<typeof UpdateGridSchema>) {
  const { gridId, name, metadata } = UpdateGridSchema.parse(args);
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

async function createView(args: z.infer<typeof CreateViewSchema>) {
  const { name, gridId, columns } = CreateViewSchema.parse(args);
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

async function getColumn(args: z.infer<typeof ViewColumnSchema>) {
  const { viewId, columnId } = ViewColumnSchema.parse(args);
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

async function createColumn(args: z.infer<typeof CreateColumnSchema>) {
  const { viewId, name, type } = CreateColumnSchema.parse(args);
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

async function deleteColumn(args: z.infer<typeof ViewColumnSchema>) {
  const { viewId, columnId } = ViewColumnSchema.parse(args);

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

async function getDependency(args: z.infer<typeof ViewDependencySchema>) {
  const { viewId, dependencyId } = ViewDependencySchema.parse(args);
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

async function deleteDependency(args: z.infer<typeof ViewDependencySchema>) {
  const { viewId, dependencyId } = ViewDependencySchema.parse(args);

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

const server = new Server(
  {
    name: "gridly-mcp-server",
    version: "0.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

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
        inputSchema: zodToJsonSchema(ProjectIdSchema),
      },
      {
        name: "list_databases",
        description: "List databases in a project",
        inputSchema: zodToJsonSchema(OptionalProjectIdSchema),
      },
      {
        name: "retrieve_database",
        description: "Retrieve a database",
        inputSchema: zodToJsonSchema(DatabaseIdSchema),
      },
      {
        name: "retrieve_grid",
        description: "Retrieve a grid",
        inputSchema: zodToJsonSchema(GridIdSchema),
      },
      {
        name: "create_grid",
        description: "Create a grid",
        inputSchema: zodToJsonSchema(CreateGridSchema),
      },
      {
        name: "update_grid",
        description: "Update a grid",
        inputSchema: zodToJsonSchema(UpdateGridSchema),
      },
      {
        name: "delete_grid",
        description: "Delete a grid",
        inputSchema: zodToJsonSchema(GridIdSchema),
      },
      {
        name: "retrieve_view",
        description: "Retrieve a view",
        inputSchema: zodToJsonSchema(ViewIdSchema),
      },
      {
        name: "create_view",
        description: "Create a view",
        inputSchema: zodToJsonSchema(CreateViewSchema),
      },
      {
        name: "retrieve_column",
        description: "Retrieve a column",
        inputSchema: zodToJsonSchema(ViewColumnSchema),
      },
      {
        name: "create_column",
        description: "Create a column",
        inputSchema: zodToJsonSchema(CreateColumnSchema),
      },
      {
        name: "delete_column",
        description: "Delete a column",
        inputSchema: zodToJsonSchema(ViewColumnSchema),
      },
      {
        name: "list_dependencies",
        description: "List dependencies",
        inputSchema: zodToJsonSchema(ViewIdSchema),
      },
      {
        name: "retrieve_dependency",
        description: "Retrieve a dependency",
        inputSchema: zodToJsonSchema(ViewDependencySchema),
      },
      {
        name: "delete_dependency",
        description: "Delete a dependency",
        inputSchema: zodToJsonSchema(ViewDependencySchema),
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
        const args = ProjectIdSchema.parse(request.params.arguments);
        const project = await getProject(args.projectId);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      }

      case "list_databases": {
        const args = ProjectIdSchema.partial().parse(request.params.arguments);
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
        const args = DatabaseIdSchema.parse(request.params.arguments);
        const project = await getDatabase(args.databaseId);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      }

      case "retrieve_grid": {
        const args = GridIdSchema.parse(request.params.arguments);
        const project = await getGrid(args.gridId);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      }

      case "create_grid": {
        const args = CreateGridSchema.parse(request.params.arguments);
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
        const args = UpdateGridSchema.parse(request.params.arguments);
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
        const args = GridIdSchema.parse(request.params.arguments);
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
        const args = ViewIdSchema.parse(request.params.arguments);
        const project = await getView(args.viewId);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      }

      case "create_view": {
        const args = CreateViewSchema.parse(request.params.arguments);
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
        const args = ViewColumnSchema.parse(request.params.arguments);
        const project = await getColumn(args);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      }

      case "create_column": {
        const args = CreateColumnSchema.parse(request.params.arguments);
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
        const args = ViewColumnSchema.parse(request.params.arguments);
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
        const args = ViewIdSchema.parse(request.params.arguments);
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
        const args = ViewDependencySchema.parse(request.params.arguments);
        const project = await getDependency(args);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      }

      case "delete_dependency": {
        const args = ViewDependencySchema.parse(request.params.arguments);
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
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

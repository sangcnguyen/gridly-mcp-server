# Gridly MCP Server
MCP Server for the Gridly API offers functionality for managing projects, grids, databases, and more.
## Installation
1. Clone the repository
`git clone git@github.com:sangcnguyen/gridly-mcp-server.git`.

2. Install dependencies `npm install`.

3. Build the server `npm run build`. Notice the `index.js` file in the build folder. Please copy its absolute path and paste it into Step 4 under args.

4. Open [Developer in Claude](https://modelcontextprotocol.io/quickstart/user) & edit claude_desktop_config.json (in case you don't have [Claude desktop](https://claude.ai/download), please download it first )
```
{
  "mcpServers": {
    "gridly-server": {
      "command": "node",
      "args": ["path/to/build/folder/index.js"],
      "env": {
        "GRIDLY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## API
### Tools
#### Project
- `list_projects`: List grids of a database
- `retrieve_project`: Retrieve a project
#### Database
- `list_databases`: List databases of a project
- `retrieve_database`: Retrieve a database
#### Grid
- `retrieve_grid`: List grids of a database
- `create_grid`: Create a grid
- `update_grid`: Update a grid from a database
- `delete_grid`: Delete a grid
#### View
- `retrieve_view`: Retrieve an existing view
- `create_view`: Create a collaborative view
#### Column
- `retrieve_column`: Retrieve a column
- `create_column`: Create a column
- `delete_column`: Delete a column
#### Dependency
- `list_dependencies`: List dependencies
- `retrieve_dependency`: Retrieve a dependency
- `delete_dependency`: Delete a dependency
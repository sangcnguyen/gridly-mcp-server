[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/sangcnguyen-gridly-mcp-server-badge.png)](https://mseep.ai/app/sangcnguyen-gridly-mcp-server)

# Gridly MCP Server
MCP Server for Gridly API offers functionality for managing projects, grids, databases, and more.
## Requirements
1. Install [Claude Desktop](https://claude.ai/download) or any MCP Client that supports an MCP Server
2. Obtain Gridly API Key
## Installation
### Method 1: Using npx (Recommended)
1. Open Claude Desktop app > Settings > Developer > Edit Config
2. Edit claude_desktop_config.json with the following config:
```json
{
  "mcpServers": {
    "gridly-server": {
      "command": "npx",
      "args": ["-y", "gridly-mcp-server"],
      "env": {
        "GRIDLY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```
### Method 2: Development installation (For Developer)
1. Clone the repository
`git clone git@github.com:sangcnguyen/gridly-mcp-server.git`.

1. Install dependencies `npm install`
2. Build the server `npm run build`. Notice the `index.js` file in the `dist` folder. Please copy its absolute path and paste it into Step 4 under args
3. Open Claude Desktop app > Settings > Developer > Edit Config
4. Edit claude_desktop_config.json with the following config:
```json
{
  "mcpServers": {
    "gridly-server": {
      "command": "node",
      "args": ["path/to/dist/folder/index.js"],
      "env": {
        "GRIDLY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```
## Available Tools
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
- `add_column_to_view`: Add an existing grid column to a view
- `remove_column_from_view`: Remove a column from a view
#### Dependency
- `list_dependencies`: List dependencies
- `retrieve_dependency`: Retrieve a dependency
- `delete_dependency`: Delete a dependency
#### Record
- `add_records`: Add new records to a view
- `delete_records`: Delete existing records of a view
- `list_records`: List records in a view
- `get_record_history`: Get record histories of a record in a view
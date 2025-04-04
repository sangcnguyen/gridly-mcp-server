## Installation
1. Clone the repository
git clone git@github.com:sangcnguyen/gridly-mcp-server.git

2. Install dependencies
npm install

3. Build the server
npm run build


4. Edit claude_desktop_config.json
```
{
  "gridly-server": {
    "command": "node",
    "args": ["path/to/gridly/index.js"],
    "disabled": false,
    "env": {
      "GRIDLY_API_KEY": "your_api_key_here"
    }
  }
}
```
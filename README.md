# Send message with Webex

## Example

```yaml
name: Send notification

on:
  pull_request:
    types: [opened, reopened]
    branches:
      - 'main'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send message to room
        uses: bndynet/github-action-webex@v1
        with:
          action: message
          token: ${{ secrets.WX_TOKEN }}
          server: ${{ secrets.WX_SERVER }}
          room-id: ${{ secrets.WX_ROOMID }}
          message: "# PR ${{ github.event.pull_request.number }} opened"
```
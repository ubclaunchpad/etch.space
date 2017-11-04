<a href="https://zenhub.com"><img src="https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png"></a>

# etch.io
A live multi-user collaborative etch-a-sketch built on websockets.
![Alt text](/logo.png?raw=true "etch")
## features
- one etch a sketch board shared by everyone currently on the website
- visitors are assigned random colors/positions
- visitors can optionally add a nickname
- chat

## Roadmap

Current goal is to demo on bigger websites with more ppl (hackernews, reddit, etc...)

### v2

Reqs:
- database so that certain things persist on server restart/crash (users, chat, board)
- validation of all requests/socket events coming into back end
- throttling
- https
- easier way to know where you are
- show current (x, y)
- pixel counts on users
- cookies (optional)

### Future
- voting mechanism (clear the board, shuffle colors, etc... (should use the chat for simplicity))
- mobile page
- bigger map ("camera" centered around your pen, camera pans as you move to the edges, option to view whole map)
- some mechanic by which you can change your color

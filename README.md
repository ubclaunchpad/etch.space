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

### MVP

Goal for MVP is to have something we can deploy to a domain and invite people to test. 

Logging will be important as its highly likely something will break. 

We are not going to worry about scaling initially, just the basic mechanic of the site.

Reqs:
- desktop only
- fixed board size
- moving/drawing
- user list
- chat
- nickname prompt
- logging/monitoring (server logs + usage logs (google analytics or something))
- some way to clear the board w/o restarting server (secret command or something)

### Future
- voting mechanism (clear the board, shuffle colors, etc... (should use the chat for simplicity))
- mobile page
- bigger map ("camera" centered around your pen, camera pans as you move to the edges, option to view whole map)
- some mechanic by which you can change your color (i.e. if I walk over 10 squares of someone elses color, I become their color)

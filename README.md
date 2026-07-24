Team Members:

- Mikey Hadley, github: mhadley-umass
- Jonathan Fang, github: jonathanfangg

Working agreement:

- Day to day communication will happen over text, and we will update each other whenever this is progress to share.
- PR's must pass review from both team members to be merged.
- We will resolve disagreements by communicating frequently and transparently, and maintaining a collaborative spirit throughout.

Idea:

- We want to build a website that is a hybrid search engine / note taking app. This website would reroute a search through Google, making sure to append "-ai-none" to the search to remove Google's default AI search option.
- It would then allow you to highlight a portion of text from your current search window and save that to a note corresponding to your search history.
- This would allow for more sustainable searching as regular Google searches use less resources and being able to revisit a search would allow you to not have to search again.
- The note taking feature would also help you better commit the search result to memory, hopefully letting you learn more from your searches.

What the project is:

- It is a note taking app designed to make searching the web more sustainable, meaningful, and informative.
- We currently have three pages: a home page, a notes page, and an about page.

How to get it started:

- Open your preferred IDE and run Git: Clone, putting this link in when prompted: https://github.com/jonathanfangg/compsci326-project
- Once inside the project, open a terminal and run:
  - npm install
  - npm start
- Visit http://localhost:3000 to view the server.
- To shut the server down, type Ctrl + C into your terminal.

New features: 
- We have added two new features, search and notes
- /search is accessed through the home page, and it opens a new tab with your search query and "-ai-none" appended to it.
- /notes lets you create and saves notes that capture what your search query was and what you learned from the search.
- The form consists of a "Search Query" title section and a "Note" body section.
- To use search, simply visit the home page and type a search query into the search bar under "search the web" and hit submit.
- To use Notes, visit http://localhost:3000/notes or just click on the notes tab below the header.
- Then simply enter a search query and note body text, then click "save note".
- After you submit the notes form, it validates the submission and writes the changes to notes.json through notesRepository.js.

## System Diagram:

### Application  Layers:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                     │
│            Home Page | Notes Page | About Page          │
└────────────────────────┬────────────────────────────────┘
                         │
                    HTTP Request
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              ROUTES LAYER (Express)                     │
│   /search  |  /notes  |  /  |  /about                   │
└────────────────────────┬────────────────────────────────┘
                         │
                    Route Handler
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              CONTROLLER LAYER                           │
│   Handles HTTP request logic and validation             │
└────────────────────────┬────────────────────────────────┘
                         │
                   Business Logic
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              SERVICE LAYER                              │
│   Core application logic for search and notes           │
└────────────────────────┬────────────────────────────────┘
                         │
                   Data Operations
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              REPOSITORY LAYER                           │
│   notesRepository.js (reads/writes to notes.json)       │
└────────────────────────┬────────────────────────────────┘
                         │
                   File I/O
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE (notes.json)                      │
│              Persistent note storage                    │
└─────────────────────────────────────────────────────────┘
```

### Search Feature Request Flow:

```
A user enters a search query on home page
            │
            ▼
[Routes] GET /search?q=example
            │
            ▼
[Controller] Validate query parameter
            │
            ▼
[Service] Append "-ai-none" to search query
            │
            ▼
[Response] Redirect to Google with modified query
            │
            ▼
New tab opens with search results
```

### Notes Feature Request Flow:

```
A user fills out a search query and note body on /notes
            │
            ▼
[Routes] POST /notes
            │
            ▼
[Controller] Extract and validate form data
            │
            ▼
[Service] Format note object with search query and note text
            │
            ▼
[Repository] Write note to notes.json file
            │
            ▼
[Response] Return success/error to client
            │
            ▼
Notes list updated and displayed on page
```
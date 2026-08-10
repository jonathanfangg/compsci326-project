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
  - npm run build:css
  - npm start
- The server requires MongoDB. Set `MONGODB_URI` to your MongoDB connection string; when it is not set, the app uses `mongodb://dev:devpassword@mongo:27017/devdb?authSource=admin`, which matches the development container.
- Visit http://localhost:3000 to view the server.
- To shut the server down, type Ctrl + C into your terminal.

Sprint2 updates:

- We have added search and notes. `/search` is accessed through the home page, and it opens a new tab with your search query and `-ai-none` appended to it.
- `/notes` lets you create and save notes that capture what your search query was and what you learned from the search. The form consists of a "Search Query" title section and a "Note" body section.
- To use search, visit the home page, enter a search query under "Search the web," and submit the form.
- To use notes, visit http://localhost:3000/notes or click the Notes link in the header. Enter a search query and note body, then click "Save note."

Sprint3 updates:

- MongoDB repository: Notes are no longer read from or written to a JSON file. `repositories/notesRepository.js` defines a Mongoose schema and uses the operations: `find`, `findById`, `create`, `findByIdAndUpdate`, and `findByIdAndDelete`. `GET /notes` reads from MongoDB, `POST /notes` creates a new note, and `DELETE /notes/:id` removes one. MongoDB's `_id` is converted to the client `id` by `dtos/noteDto.js`.
- Jest service tests: `__tests__/notesService.test.js` tests the service layer's validation and business rules, including missing or whitespace-only fields, trimming, search URL creation, listing notes through the DTO, and deleting existing or missing notes. The repository is mocked with `jest.unstable_mockModule`, so the suite does not need to connect to MongoDB to be run. Run it with `npm test`.
- HTMX delete interaction: The delete buttons on `/notes` uses `hx-delete`, `hx-target="closest li"`, and `hx-swap="outerHTML"`. The server returns a successful and empty response. HTMX removes that note from the page without a reload. Save a note and click the delete button on the note to see the HTMX in action.
- Tailwind visual design: The entire visual design has been overhauled with Tailwind utility classes generated from `src/input.css`. On a phone the navigation, search controls, form, and notes will stack vertically. At `sm` width the navigation and search controls use two columns. At `lg` width the notes page has a sticky note form beside the saved notes. Run `npm run build:css` then resize the browser to see the responsive layouts.

Sprint4 updates:

- Session based authentication: Create an account with `curl -X POST http://localhost:3000/signup -H "Content-Type: application/json" -d '{"email":"member@example.com","password":"choose-a-password"}'`, then open `/login` and enter those credentials. Passwords are hashed with bcrypt, and we use express-session with connect-mongo so session records persist in MongoDB. `POST /signup` creates a `member`, supports `member` and `admin` roles, and `POST /logout` destroys the session.
- Service auth: Creating and deleting notes first passes through `requireLogin`, for deletion, `notesService.deleteNote` loads the note and then applies the `isOwnerOrAdmin` rule inside the service layer. The owner or an admin may delete it a note, while another member receives `403 Forbidden`, and an unauthenticated request receives `401 Unauthorized`. To verify it, log in as the seeded `alice@example.com`, or `admin@example.com`, both using password `hunter2`, then try deleting Alice's seeded note as its owner, an unrelated member, and an admin.
- Accessibility improvements: Every text input has a label, and keyboard focus is restored to the next or previous Delete button after an HTMX deletion. Focus moves to a newly created note on creation. Contrast follows WCAG guidelines throughout the UI.
- Health check: `GET /health` returns `{ "status": "ok" }` with HTTP 200. Test it with `curl http://localhost:3000/health`; it does not use `requireLogin`.

## System Diagram:

### Application Layers:

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                           │
│ Home | Notes | About | Login                                       │
│ EJS + Tailwind | login.js | app.js + accessible HTMX updates       │
└────────────────────────────────┬───────────────────────────────────┘
                                 │ HTTP / HTML / JSON / session cookie
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                       ROUTES LAYER (Express)                       │
│ Public: /, /about, /search, GET /login, POST /login, GET /health   │
│ Auth: /signup, /logout, /me                                        │
│ Notes: GET /notes | requireLogin -> POST /notes, DELETE /notes/:id │
└────────────────────────────────┬───────────────────────────────────┘
                                 │ Route handler
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                        CONTROLLER LAYER                            │
│ Renders views and translates HTTP input/service results            │
│ Login regenerates/saves the session; logout destroys it            │
└────────────────────────────────┬───────────────────────────────────┘
                                 │ Business operation
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                          SERVICE LAYER                             │
│ authService: validation + bcrypt hash/compare                      │
│ notesService: validation + ownership/role authorization            │
│ deleteNote loads note -> isOwnerOrAdmin -> 403 when forbidden      │
└───────────────────────┬───────────────────────┬────────────────────┘
                        │ Data operation        │ Session operation
                        ▼                       ▼
┌──────────────────────────────────┐  ┌──────────────────────────────┐
│        REPOSITORY / MODELS       │  │       SESSION LAYER          │
│ notesRepository: Note + ownerId  │  │ express-session              │
│ usersRepository: User            │  │ HTTP-only signed session ID  │
│ User: email, passwordHash, role  │  │ connect-mongo store          │
└──────────────────┬───────────────┘  └──────────────┬───────────────┘
                   │ Mongoose queries                │ Session records
                   └──────────────────┬──────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────┐
│                         DATABASE (MongoDB)                         │
│ Users (member/admin) | Notes (ownerId) | Persistent sessions       │
└────────────────────────────────────────────────────────────────────┘
```

### Authentication and Health Request Flow:

```
A user opens the login page
            │
            ▼
[Routes + Controller] GET /login renders login.ejs
            │
            ▼
[Client login.js] POST /login with email and password
            │
            ▼
[authService] Find User and compare password with bcrypt
            │
            ▼
[Controller] Regenerate session and store userId
            │
            ▼
[express-session + connect-mongo] Persist session in MongoDB
            │
            ▼
[Response] Set HTTP-only session cookie and redirect to /notes

A client checks whether the app is alive
            │
            ▼
[Public route] GET /health (no requireLogin)
            │
            ▼
[Response] HTTP 200 { "status": "ok" }
```

### Protected Note Authorization Flow:

```
DELETE /notes/:id
            │
            ▼
[Route] requireLogin checks session userId ── missing ──> 401
            │ logged in
            ▼
[Service] Load the specific note for deletion
            │
            ▼
[Service] isOwnerOrAdmin(note, actor)
       │ allowed                 │ forbidden
       ▼                         ▼
[Repository] Delete note       HTTP 403
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
A user opens /notes
            │
            ▼
[Routes] GET /notes
            │
            ▼
[Controller + Service] Request all notes
            │
            ▼
[Mongoose Repository] Read notes from MongoDB
            │
            ▼
[Response] Render the responsive Tailwind notes view

A user submits a search query and note body
            │
            ▼
[Routes] POST /notes
            │
            ▼
[requireLogin] Confirm session userId or return 401
            │
            ▼
[Controller] Extract JSON request data
            │
            ▼
[Service] Validate and trim fields, then build the search URL
            │
            ▼
[Mongoose Repository] Create the note in MongoDB
            │
            ▼
[Response] Return the created note DTO as JSON
            │
            ▼
[Client app.js] Add and focus the styled note
            │
            ▼
[ARIA live region] Announce that the note was added

A user clicks a note's Delete button
            │
            ▼
[HTMX] DELETE /notes/:id
            │
            ▼
[Route] requireLogin confirms the session or returns 401
            │
            ▼
[Service] Load note and run isOwnerOrAdmin
            │
            ▼
[Repository] Delete note
            │
            ▼
[Response] Empty 200 response
            │
            ▼
[HTMX] Remove the matching <li> without reloading the page
            │
            ▼
[Client app.js] Restore focus and announce the deletion
```

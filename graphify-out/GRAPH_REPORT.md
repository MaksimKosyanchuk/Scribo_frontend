# Graph Report - Scribo_frontend  (2026-09-05)

## Corpus Check
- 92 files · ~112,137 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 364 nodes · 1049 edges · 14 communities
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `65ee4ba0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Categories.jsx
- Logs.jsx
- Request.jsx
- package.json
- apiFetch
- App.jsx
- PostHeader/index.jsx
- Popup/index.jsx
- dependencies
- Installation & Running
- manifest.json

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 41 edges
2. `AppContext` - 29 edges
3. `format_date_time()` - 19 edges
4. `format_back()` - 17 edges
5. `Tooltip()` - 14 edges
6. `Input` - 13 edges
7. `getCategories()` - 12 edges
8. `Loading()` - 12 edges
9. `PrimaryButton()` - 12 edges
10. `PostActions()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `App()` --indirect_call--> `setAccessToken()`  [INFERRED]
  src/App.jsx → src/api/http.js
- `Header()` --indirect_call--> `logout()`  [INFERRED]
  src/components/Header/index.jsx → src/api/auth.api.js
- `MobileNavigationBar()` --indirect_call--> `logout()`  [INFERRED]
  src/components/MobileNavigationBar/index.jsx → src/api/auth.api.js
- `replySupportRequest()` --calls--> `apiFetch()`  [EXTRACTED]
  src/api/support.api.js → src/api/http.js
- `SupportEntity()` --calls--> `kindLabel()`  [EXTRACTED]
  src/pages/AdminPanel/Logs.jsx → src/pages/Support/constants.js

## Import Cycles
- 3-file cycle: `src/App.jsx -> src/pages/Profile/index.jsx -> src/components/FollowButton/index.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/pages/Article/index.jsx -> src/components/PostComments/index.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/pages/Article/index.jsx -> src/components/PostActions/index.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/components/MobileNavigationBar/index.jsx -> src/components/CurrentUserBadge/index.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/pages/HomePage/index.jsx -> src/components/Posts/index.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/pages/AdminPanel/index.jsx -> src/pages/AdminPanel/Admins.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/pages/Support/Mine.jsx -> src/pages/AdminPanel/Requests.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/pages/Support/Request.jsx -> src/pages/AdminPanel/Requests.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/pages/AdminPanel/index.jsx -> src/pages/AdminPanel/Categories.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/pages/AdminPanel/index.jsx -> src/pages/AdminPanel/Logs.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/pages/AdminPanel/index.jsx -> src/pages/AdminPanel/Requests.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/components/Header/index.jsx -> src/components/CurrentUserBadge/index.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/components/Footer/index.jsx -> src/components/LinkToProfile/index.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/pages/Profile/index.jsx -> src/components/Posts/index.jsx -> src/App.jsx`
- 3-file cycle: `src/App.jsx -> src/pages/Article/index.jsx -> src/components/PostHeader/index.jsx -> src/App.jsx`
- 4-file cycle: `src/App.jsx -> src/pages/Article/index.jsx -> src/components/PostComments/index.jsx -> src/components/CurrentUserBadge/index.jsx -> src/App.jsx`
- 4-file cycle: `src/App.jsx -> src/pages/AdminPanel/index.jsx -> src/pages/AdminPanel/Logs.jsx -> src/pages/AdminPanel/Requests.jsx -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/pages/HomePage/index.jsx -> src/components/Posts/index.jsx -> src/components/PostCard/index.jsx -> src/components/PostActions/index.jsx -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/pages/Profile/index.jsx -> src/components/Posts/index.jsx -> src/components/PostCard/index.jsx -> src/components/PostActions/index.jsx -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/pages/HomePage/index.jsx -> src/components/Posts/index.jsx -> src/components/PostCard/index.jsx -> src/components/PostHeader/index.jsx -> src/App.jsx`

## Communities (14 total, 0 thin omitted)

### Community 0 - "Categories.jsx"
Cohesion: 0.10
Nodes (41): applyAuthResult(), deleteSession(), emailRegister(), getSessions(), googleRegister(), loginGoogle(), loginUsername(), logout() (+33 more)

### Community 1 - "Logs.jsx"
Cohesion: 0.08
Nodes (31): getAllLogs(), getPosts(), unwrapPostsResponse(), getUsers(), updateRole(), Banner(), NoPosts(), EMPTY_QUERY (+23 more)

### Community 2 - "Request.jsx"
Cohesion: 0.12
Nodes (31): createSupportRequest(), getMySupportRequests(), getPublicSupportRequest(), getSupportRequest(), getSupportRequests(), jsonHeaders, replyPublicSupportRequest(), replySupportRequest() (+23 more)

### Community 3 - "package.json"
Cohesion: 0.05
Nodes (37): eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, globals, author, description, devDependencies (+29 more)

### Community 4 - "apiFetch"
Cohesion: 0.15
Nodes (22): deleteComment(), editComment(), likeComment(), apiFetch(), getAccessToken(), isAuthRefreshUrl(), listeners, parseJson() (+14 more)

### Community 5 - "App.jsx"
Cohesion: 0.11
Nodes (18): getApiDocs(), ApiDocs, AppContext, Footer(), LinkToProfile(), ModalWindow(), SidebarPage(), SceletonProvider() (+10 more)

### Community 6 - "PostHeader/index.jsx"
Cohesion: 0.16
Nodes (21): deletePost(), getPostById(), likePost(), savePost(), follow(), Category, categoryIcons, FollowButton() (+13 more)

### Community 7 - "Popup/index.jsx"
Cohesion: 0.12
Nodes (16): getAccountMenuBody(), isAdminRole(), CurrentUserBadge(), Header(), isPathActive(), MobileNavigationBar(), canHoverFinePointer(), findActiveItem() (+8 more)

### Community 8 - "dependencies"
Cohesion: 0.08
Nodes (25): @floating-ui/react, @fontsource/geist, lexical, @lexical/html, @lexical/link, @lexical/list, @lexical/react, dependencies (+17 more)

### Community 9 - "Installation & Running"
Cohesion: 0.20
Nodes (9): 1. Clone the repository, 2. Setup environment variables, 3. Install dependencies, 4. Run the development server, Features, Installation & Running, Links, Scribo — React Blog Project (+1 more)

### Community 10 - "manifest.json"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

## Knowledge Gaps
- **67 isolated node(s):** `name`, `version`, `private`, `type`, `description` (+62 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 86 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppContext` connect `App.jsx` to `Categories.jsx`, `Logs.jsx`, `Request.jsx`, `apiFetch`, `PostHeader/index.jsx`, `Popup/index.jsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `apiFetch()` connect `apiFetch` to `Categories.jsx`, `Logs.jsx`, `Request.jsx`, `PostHeader/index.jsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _67 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Categories.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09701928696668614 - nodes in this community are weakly interconnected._
- **Should `Logs.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Request.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12323232323232323 - nodes in this community are weakly interconnected._
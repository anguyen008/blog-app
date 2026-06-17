# Ink. — A Full-Stack Blogging Platform

Ink. is a full-stack blogging application that lets users create one or more blogs, write posts with a rich-text editor, and publish them publicly. It's built as a learning/reference project demonstrating a modern FastAPI + React stack with JWT authentication.

## Tech Stack

**Backend** (`server/`)
- [FastAPI](https://fastapi.tiangolo.com/) — Python web framework with auto-generated OpenAPI docs
- [SQLAlchemy](https://www.sqlalchemy.org/) ORM with PostgreSQL
- [pwdlib](https://pypi.org/project/pwdlib/) (Argon2) for password hashing
- [PyJWT](https://pyjwt.readthedocs.io/) for access/refresh token authentication
- [Pydantic](https://docs.pydantic.dev/) for request/response validation
- Package management via [uv](https://docs.astral.sh/uv/)

**Frontend** (`client/`)
- [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/) for client-side routing
- [TipTap](https://tiptap.dev/) rich-text editor for writing posts
- [Axios](https://axios-http.com/) for API requests

## Features

- Email/password registration and login with JWT access tokens and HTTP-only refresh token cookies
- Create, edit, and delete blogs (each with a title, tagline, and about section)
- Create, edit, delete, and publish/unpublish posts within a blog using a rich-text editor with autosave and word count
- Public endpoints for viewing published blogs and posts without authentication
- User profile management, including updating profile details and changing passwords
- Authorization checks ensuring only a blog's author can modify or delete its content

## Project Structure

```
app/
├── server/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # App entry point, router registration, CORS
│   │   ├── config.py       # Settings loaded from .env via pydantic-settings
│   │   ├── database.py     # SQLAlchemy engine/session setup
│   │   ├── models.py       # ORM models: User, Blog, Post
│   │   ├── schemas.py      # Pydantic request/response schemas
│   │   ├── oauth2.py       # JWT creation/verification, current-user dependency
│   │   ├── utils.py        # Password hashing utilities
│   │   └── routes/
│   │       ├── auth.py     # /login, /refresh, /logout, /verify-user
│   │       ├── users.py    # /users CRUD + profile/password updates
│   │       ├── blogs.py    # /blogs CRUD
│   │       └── posts.py    # /posts CRUD + public endpoints
│   └── pyproject.toml
└── client/                 # React frontend
    └── src/
        ├── App.jsx                 # Route definitions
        ├── context/AuthContext.jsx # Auth state, token refresh, login/logout
        ├── api/api.js               # Axios calls to the backend
        ├── components/              # Shared UI (Topbar, Sidebar, editor, etc.)
        └── pages/                   # Login, Register, Dashboard, Editor, and panels
```

## What You Can Do

**Sign up and log in.** Create an account with a name, email, and password. Passwords are hashed with Argon2 before storage, and sessions are handled with a short-lived JWT access token plus a longer-lived refresh token stored in an HTTP-only cookie, so a logged-in user stays logged in across visits without re-entering credentials.

**Run multiple blogs.** Each user can create more than one blog, each with its own title, tagline, and "about" description. A dashboard sidebar lists all of a user's blogs alongside placeholder sections for things like followed blogs and a personal library.

**Write posts in a rich-text editor.** The post editor is built on TipTap and supports the usual formatting (bold, italics, links, text alignment, etc.), with a live word count and an autosave that debounces 2 seconds after typing stops, so a draft is saved without an explicit "save" click. A preview mode shows the post the way a reader would see it before it's published.

**Publish or keep drafts.** Posts can be saved as unpublished drafts or published to make them publicly visible. A blog's settings panel shows totals for posts and published posts.

**Browse publicly** Published blogs and posts are exposed through public endpoints, so a visitor can read a blog's posts without logging in, while drafts remain visible only to the author.

**Manage your account.** A settings panel lets a user update their profile (name/email) or change their password, with the old password required to confirm the change.

## What It Looks Like

The app is organized around a single dashboard shell after login: a top bar, a left sidebar for navigation between blogs and account areas, and a main panel that swaps based on the route — viewing all blogs, viewing a single blog's posts, editing blog settings, or editing account settings. Writing happens in a dedicated full-screen editor route, separate from the dashboard, so the writing surface isn't competing with navigation chrome.

| Page/Panel | Purpose |
|---|---|
| Login / Register | Email + password auth, with client-side validation (e.g. minimum password length) |
| Dashboard | Shell that renders the sidebar, top bar, and the active panel based on the URL |
| Blogs Panel | List of the current user's blogs, with creation via a modal |
| Posts Panel | List of posts within a selected blog, with publish status |
| Blog Settings Panel | Edit a blog's title/tagline/about, see post counts |
| Editor Page | Full-screen TipTap rich-text editor with autosave, word count, and preview |
| Reader Panel | Public-facing view of a published blog/post |
| User Settings Panel | Update profile info and change password |

## API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/users` | POST | Register a new user |
| `/login` | POST | Log in, returns access token + sets refresh token cookie |
| `/refresh` | POST | Exchange a valid refresh token for a new access token |
| `/logout` | POST | Clear auth cookies |
| `/verify-user` | GET | Validate the current access token |
| `/blogs` | GET, POST | List all blogs / create a blog (auth required to create) |
| `/blogs/{blog_id}/public` | GET | View a single blog publicly |
| `/blogs/{blog_id}/posts` | GET | List all posts in a blog (auth required) |
| `/posts` | POST | Create a post (auth required) |
| `/posts/public` | GET | List all published posts |
| `/posts/{post_id}` | GET, PUT, DELETE | Read/update/delete a post |

Full interactive documentation is generated automatically by FastAPI and served at `/docs` once the backend is running.

## Notes for Later

A few things are currently set up for local development only and will need attention before this goes anywhere beyond a local machine:

- CORS is hardcoded to `http://localhost:5173`.
- The frontend's API base URL is hardcoded to `http://localhost:8000` in `client/src/api/api.js`.

## License

This project is licensed under the MIT License — see LICENSE for details.

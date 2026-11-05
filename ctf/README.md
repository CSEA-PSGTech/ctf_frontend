# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
## Project pages and routing

We use `react-router-dom` for multiple pages. The entry HTML is `index.html`, React mounts in `src/main.jsx`, and routes are defined in `src/App.jsx`.

### Add a new page
1. Create your page component under `src/pages/YourPage.jsx` (and optional CSS next to it).
2. Export a default React component.
3. Import it in `src/App.jsx` and add a `<Route>` for your path.

Example:

```jsx
// src/pages/About.jsx
export default function About() {
  return <div>About</div>
}
```

```jsx
// in src/App.jsx
import About from './pages/About.jsx'
// ...
<Routes>
  <Route path="/about" element={<About />} />
  {/* add your other routes */}
  <Route path="/answer" element={<AnswerSolving />} />
  <Route path="/" element={<Home />} />
  <Route path="*" element={<NotFound />} />
  {/* optional */}
  
```

### Development
- Run `npm run dev` and open the shown local URL.
- Navigate to your page via its route, e.g. `/answer`.

## Docker

Build and run the production image from this directory:

```bash
docker build --build-arg VITE_BACKEND_URL=https://your-backend.example.com -t ctf-frontend .
docker run --rm -p 8080:80 ctf-frontend
```

Open `http://localhost:8080`. The backend URL is compiled into the Vite bundle, so provide
`VITE_BACKEND_URL` when building the image rather than copying `.env` into the image.

The GitHub Actions workflow at `../.github/workflows/docker-publish.yml` publishes the image to
GitHub Container Registry on pushes to `main` and version tags. Set the repository variable
`VITE_BACKEND_URL` under **Settings → Secrets and variables → Actions → Variables** before
publishing.


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

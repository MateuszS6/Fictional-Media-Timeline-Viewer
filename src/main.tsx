import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import AppRoutes from './AppRoutes.tsx'
import './index.css'
import './styles/auth.css'
import './styles/character-panel.css'
import './styles/layout.css'
import './styles/management.css'
import './styles/timeline-guide.css'
import './styles/timeline.css'
import './styles/workspace.css'

const router = createBrowserRouter([
	{ path: "*", element: <AppRoutes /> }
]);

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
)

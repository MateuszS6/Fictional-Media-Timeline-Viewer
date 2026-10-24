import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import StudioAccess from './components/auth/StudioAccess.tsx'
import { WorkspaceProvider } from './context/WorkspaceProvider.tsx'
import './index.css'
import './styles/auth.css'
import './styles/layout.css'
import './styles/management.css'
import './styles/timeline-guide.css'
import './styles/timeline.css'
import './styles/workspace.css'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<StudioAccess>
			{(canEdit) => (
				<WorkspaceProvider
					key={canEdit ? "studio" : "viewer"}
					canEdit={canEdit}
				>
					<App />
				</WorkspaceProvider>
			)}
		</StudioAccess>
	</StrictMode>,
)

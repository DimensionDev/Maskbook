import { createRoot } from 'react-dom/client'
import { App } from './app.js'

const root = document.createElement('main')
document.body.appendChild(root)

createRoot(root).render(<App />)

import { createRoot } from 'react-dom/client'

import { Entry } from './Entry'

const container = document.createElement('main')

document.body.appendChild(container)
createRoot(container).render(<Entry />)

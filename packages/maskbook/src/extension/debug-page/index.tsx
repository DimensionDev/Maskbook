import ReactDOM from 'react-dom'

import { Entry } from './Entry'

const container = document.createElement('main')

ReactDOM.render(<Entry />, container, () => {
    document.body.appendChild(container)
})

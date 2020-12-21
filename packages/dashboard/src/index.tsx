/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />
import React from 'react'
import ReactDOM from 'react-dom'
import {App} from './App'

// Patch for esbuild (not support JSX new transform)
Object.assign(globalThis, { React })

ReactDOM.unstable_createRoot(document.getElementById('root')!).render(<App />)

if (!import.meta.hot) {
    throw new Error('This app is not used to run as an isolated web site currently')
} else {
    import.meta.hot.accept()
}

import React from 'react'

// Patch for esbuild (not support JSX new transform)
Object.assign(globalThis, { React })

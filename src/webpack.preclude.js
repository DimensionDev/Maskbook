// This file should be handled by Webpack. Should not be loaded by ES Module.

if (process.env.NODE_ENV === 'development') require('react-devtools')

const __deps__ = require('../temp/__deps__esm__generated__').default
Object.assign(globalThis, { __deps__ })

// Requirement of webcrypto-liner
import elliptic from 'elliptic'
Object.assign(globalThis, { elliptic })

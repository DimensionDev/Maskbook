// @ts-ignore WebCrypto
import { crypto } from 'webcrypto-liner/build/index.es'
Object.defineProperty(globalThis, 'crypto', { configurable: true, enumerable: true, get: () => crypto })

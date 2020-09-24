import allSettled from '@ungap/promise-all-settled'
import matchAll from 'string.prototype.matchall'

matchAll.shim() // will be a no-op if not needed
if (!Promise.allSettled) Promise.allSettled = allSettled

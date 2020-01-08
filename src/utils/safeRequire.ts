import { GetContext } from '@holoflows/kit/es'

export function safeReact() {
    if (GetContext() === 'background') throw new Error('Illegal context')
    return require('react') as typeof import('react')
}

export function safeMUI() {
    if (GetContext() === 'background') throw new Error('Illegal context')
    return require('@material-ui/core') as typeof import('@material-ui/core')
}

export function safeGetActiveUI() {
    if (GetContext() === 'background') throw new Error('Illegal context')
    return (require('../social-network/ui') as typeof import('../social-network/ui')).getActivatedUI()
}

export function safeOptionsPageWorker() {
    if (GetContext() !== 'options') return
    return require('../social-network-provider/options-page/index') as typeof import('../social-network-provider/options-page/index')
}

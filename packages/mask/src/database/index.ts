export * from '../../background/database/avatar-cache/avatar'
export * from '../../background/database/post'
export * from './Persona/helpers'
export * from './Persona/types'
export * from './Plugin'

// https://developer.apple.com/forums/thread/681201
if (process.env.engine === 'safari') {
    try {
        window.indexedDB
        setInterval(() => {
            window.indexedDB
        }, 30 * 1000)
    } catch {}
}

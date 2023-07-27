import { createHashHistory } from 'history'

function __create__<T>(creator: () => T): NonNullable<T> {
    const run = () => {
        if (process.env.NODE_ENV === 'test') return
        return creator()
    }
    return run()!
}

export const PopupsHistory = __create__(() => {
    if (location.href.includes('popups.html')) return createHashHistory()
    return
})

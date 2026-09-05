import { useCallback, useSyncExternalStore } from 'react'

/** Current route id, e.g. "components/ActionButton". Empty string means "home". */
function getRoute(): string {
    return decodeURIComponent(globalThis.location.hash.replace(/^#\/?/, ''))
}

function subscribe(onChange: () => void): () => void {
    globalThis.addEventListener('hashchange', onChange)
    return () => globalThis.removeEventListener('hashchange', onChange)
}

export function useRoute(): [string, (id: string) => void] {
    const route = useSyncExternalStore(subscribe, getRoute, () => '')
    const navigate = useCallback((id: string) => {
        globalThis.location.hash = `#/${id}`
    }, [])
    return [route, navigate]
}

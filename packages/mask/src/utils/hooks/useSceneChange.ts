import { useEffect } from 'react'

export function useSceneChange(handler: (event: WindowEventMap['scenechange']) => void) {
    useEffect(() => {
        window.addEventListener('scenechange', handler)
        return () => window.removeEventListener('scenechange', handler)
    }, [handler])
}

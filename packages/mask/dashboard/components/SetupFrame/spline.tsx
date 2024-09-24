import { useEffect, useRef, useState } from 'react'
// cspell:disable-next-line
import { Application } from '@splinetool/runtime'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'

export interface SplineProps {
    scene: string
    onLoad?: (e: Application) => void
}

export default function Spline({ scene, onLoad }: SplineProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isLoading, setIsLoading] = useState(true)

    useRenderPhraseCallbackOnDepsChange(() => setIsLoading(true), [scene])
    useEffect(() => {
        let disposed = false
        let speApp: Application
        if (canvasRef.current) {
            speApp = new Application(canvasRef.current)
            async function init() {
                await speApp.load(scene)
                if (disposed) return
                setIsLoading(false)
                onLoad?.(speApp)
            }
            init()
        }
        return () => {
            disposed = true
            speApp.dispose()
        }
    }, [scene])

    return <canvas ref={canvasRef} style={{ display: isLoading ? 'none' : 'block' }} />
}

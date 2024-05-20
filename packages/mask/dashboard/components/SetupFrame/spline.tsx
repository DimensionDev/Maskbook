import { useEffect, useRef, useState, forwardRef } from 'react'
import { Application } from '@splinetool/runtime'
import ParentSize from './ParentSize.js'

export interface SplineProps {
    scene: string
    onLoad?: (e: Application) => void
}

const Spline = forwardRef<HTMLDivElement, SplineProps>(({ scene, onLoad }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
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

    return (
        <ParentSize ref={ref}>
            {() => <canvas ref={canvasRef} style={{ display: isLoading ? 'none' : 'block' }} />}
        </ParentSize>
    )
})

export default Spline

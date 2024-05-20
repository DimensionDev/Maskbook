// Modified version of
// https://github.com/splinetool/react-spline/blob/main/src/ParentSize.tsx
import { debounce } from 'lodash-es'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'

interface ParentSizeProps {
    children: (
        args: {
            ref: HTMLDivElement | null
            resize: (state: ParentSizeState) => void
        } & ParentSizeState,
    ) => React.ReactNode
}

type ParentSizeState = {
    width: number
    height: number
    top: number
    left: number
}

const defaultParentSizeStyles = { width: '100%', height: '100%' }

export default forwardRef<HTMLDivElement, ParentSizeProps>(function ParentSize({ children }: ParentSizeProps, ref) {
    const target = useRef<HTMLDivElement | null>(null)
    const animationFrameID = useRef(0)

    const [state, setState] = useState<ParentSizeState>({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
    })

    const resize = useMemo(() => debounce(setState, 50), [])

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                const { left, top, width, height } = entry?.contentRect ?? {}
                animationFrameID.current = window.requestAnimationFrame(() => {
                    resize({ width, height, top, left })
                })
            })
        })
        if (target.current) observer.observe(target.current)

        return () => {
            window.cancelAnimationFrame(animationFrameID.current)
            observer.disconnect()
            resize.cancel()
        }
    }, [resize])

    return (
        <div
            style={defaultParentSizeStyles}
            ref={(r) => {
                typeof ref === 'function' ? ref(r) : ref !== null && (ref.current = r)
                target.current = r
            }}>
            {children({
                ...state,
                ref: target.current,
                resize,
            })}
        </div>
    )
})

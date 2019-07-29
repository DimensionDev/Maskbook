// ? This hook is from: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
// ? published at it own license
import React from 'react'
export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = React.useRef<typeof callback>()

    React.useEffect(() => {
        savedCallback.current = callback
    })

    React.useEffect(() => {
        function tick() {
            savedCallback.current && savedCallback.current()
        }
        if (delay !== null) {
            const id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}

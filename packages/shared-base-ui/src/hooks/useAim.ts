import { RefObject, useEffect, useRef, useState } from 'react'

type Point = [x: number, y: number]
type Polygon = Point[]

/**
 * https://www.algorithms-and-technologies.com/point_in_polygon/javascript
 * Performs the even-odd-rule Algorithm (a ray-casting algorithm) to find out whether a point is in a given polygon.
 * This runs in O(n) where n is the number of edges of the polygon.
 *
 * @param polygon an array representation of the polygon where polygon[i][0] is the x Value of the i-th point and polygon[i][1] is the y Value.
 * @param point   an array representation of the point where point[0] is its x Value and point[1] is its y Value
 * @return whether the point is in the polygon (not on the edge, just turn < into <= and > into >= for that)
 */
const pointInPolygon = (polygon: Polygon, point: Point): boolean => {
    // A point is in a polygon if a line from the point to infinity crosses the polygon an odd number of times
    let odd = false
    // For each edge (In this case for each point of the polygon and the previous one)
    for (let i = 0, j = polygon.length - 1; i < polygon.length; i += 1) {
        // If a line from the point into infinity crosses this edge
        if (
            polygon[i][1] > point[1] !== polygon[j][1] > point[1] && // One point needs to be above, one below our y coordinate
            // ...and the edge doesn't cross our Y coordinate before our x coordinate (but between our x coordinate and infinity)
            point[0] <
                ((polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1])) / (polygon[j][1] - polygon[i][1]) +
                    polygon[i][0]
        ) {
            // Invert odd
            odd = !odd
        }
        j = i
    }
    // If the number of crossings was odd, the point is in the polygon
    return odd
}

// Inspired by http://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown
export function useAim(sourceRef: RefObject<HTMLElement>, targetRef: RefObject<HTMLElement>) {
    const [active, setActive] = useState(false)
    const inSourceRef = useRef(false)
    const inTargetRef = useRef(false)

    useEffect(() => {
        const source = sourceRef.current
        const target = targetRef.current
        if (!source) return

        let unmounted = false
        let timer: number

        const updateActive = (status: boolean) => {
            if (unmounted) return
            setActive(inSourceRef.current || inTargetRef.current || status)
        }
        const show = () => {
            clearTimeout(timer)
            updateActive(true)
        }
        const hide = () => {
            clearTimeout(timer)
            timer = setTimeout(updateActive, 50, false)
        }

        const handleSourceMouseEnter = () => {
            if (unmounted) return
            show()
            inSourceRef.current = true
        }
        const handleSourceLeave = () => {
            inSourceRef.current = false
        }
        const handleTargetMouseEnter = () => {
            inTargetRef.current = true
            show()
        }
        const handleTargetMouseLeave = () => {
            inTargetRef.current = false
            hide()
        }
        const handleDocMouseMove = (evt: MouseEvent) => {
            if (inSourceRef.current || inTargetRef.current) return
            const source = sourceRef.current
            const target = targetRef.current
            if (!source || !target) return
            const sourceRect = source.getBoundingClientRect()
            const targetRect = target.getBoundingClientRect()
            const p1: Point = [sourceRect.left, sourceRect.top]
            const p2: Point = [sourceRect.right, sourceRect.top]
            const p3: Point = [targetRect.right, targetRect.top]
            const p4: Point = [targetRect.left, targetRect.top]

            const mousePoint: Point = [evt.x, evt.y]
            const polygon = [p1, p2, p3, p4, p1]
            const inArea = pointInPolygon(polygon, mousePoint)
            inArea ? show() : hide()
        }
        source.addEventListener('mouseenter', handleSourceMouseEnter)
        source.addEventListener('mouseleave', handleSourceLeave)
        target?.addEventListener('mouseenter', handleTargetMouseEnter)
        target?.addEventListener('mouseleave', handleTargetMouseLeave)
        document.addEventListener('mousemove', handleDocMouseMove)

        return () => {
            unmounted = true
            clearTimeout(timer)
            source.removeEventListener('mouseenter', handleSourceMouseEnter)
            source.removeEventListener('mouseleave', handleSourceLeave)
            target?.removeEventListener('mouseenter', handleTargetMouseEnter)
            target?.removeEventListener('mouseleave', handleTargetMouseLeave)
            document.removeEventListener('mousemove', handleDocMouseMove)
        }
    }, [])

    return active
}

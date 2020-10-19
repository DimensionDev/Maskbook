import * as d3 from 'd3'
import { useEffect, RefObject } from 'react'

export interface Dimension {
    width: number
    height: number
    top: number
    right: number
    bottom: number
    left: number
}

export function useDimension(svgRef: RefObject<SVGSVGElement>, { width, height }: Dimension) {
    useEffect(() => {
        if (!svgRef.current) return
        d3.select(svgRef.current).attr('width', width).attr('height', height)
    }, [svgRef.current, width, height])
}

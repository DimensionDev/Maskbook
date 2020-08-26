import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import type { Stat } from '../type'
import { makeStyles, Theme, createStyles, CircularProgress } from '@material-ui/core'

const DEFAULT_WIDTH = 460
const DEFAULT_HEIGHT = 250
const DEFAULT_MARGIN = {
    top: 32,
    right: 16,
    bottom: 32,
    left: 16,
}

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {
            position: 'relative',
        },
        svg: {},
        progress: {
            bottom: theme.spacing(1),
            right: theme.spacing(1),
            position: 'absolute',
        },
    })
})

export interface PriceChartProps {
    stats: Stat[]
    loading?: boolean
    width?: number
    height?: number
    children?: React.ReactNode
}

export function PriceChart(props: PriceChartProps) {
    const classes = useStyles()
    const svgRef = useRef<SVGSVGElement>(null)

    // define dimensions
    const {
        width = DEFAULT_WIDTH - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right,
        height = DEFAULT_HEIGHT - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom,
    } = props
    const canvasWidth = width + DEFAULT_MARGIN.left + DEFAULT_MARGIN.right
    const canvasHeight = height + DEFAULT_MARGIN.top + DEFAULT_MARGIN.bottom

    // process data
    const data = props.stats.map(([date, price]) => ({
        date: new Date(date),
        value: price,
    }))

    useEffect(() => {
        if (!svgRef.current) return
        if (!props.stats.length) return

        // empty the svg
        svgRef.current.innerHTML = ''

        // contine to create the chart
        const svg = d3
            .select(svgRef.current)
            .attr('width', canvasWidth)
            .attr('height', canvasHeight)
            .append('g')
            .attr('transform', `translate(${DEFAULT_MARGIN.left}, ${DEFAULT_MARGIN.top})`)

        // create X axis
        const x = d3
            .scaleTime()
            .domain(d3.extent(data, (d) => d.date) as [Date, Date])
            .range([0, width])

        // create Y axis
        const min = d3.min(data, (d) => d.value) as number
        const max = d3.max(data, (d) => d.value) as number
        const dist = Math.abs(max - min)
        const y = d3
            .scaleLinear()
            .domain([min - dist * 0.05, max + dist * 0.05])
            .range([height, 0])

        // add X axis
        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(width / 100))

        // add Y axis
        svg.append('g')
            .attr('transform', `translate(0, 0)`)
            .call(
                d3
                    .axisRight(y)
                    .ticks(height / 50, '$,.2s')
                    .tickSize(width),
            )
            .call((g) => g.select('.domain').remove())
            .call((g) => g.selectAll('.tick line').attr('stroke-opacity', 0.5).attr('stroke-dasharray', '2,2'))
            .call((g) => g.selectAll('.tick text').attr('x', 4).attr('dy', -4))

        // add line
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr(
                'd',
                d3
                    .line()
                    .x((d) => x((d as any).date))
                    .y((d) => y((d as any).value)) as any,
            )
    }, [svgRef, data.length])
    return (
        <div className={classes.root} style={{ width: canvasWidth, height: canvasHeight }}>
            {props.children}
            <svg className={classes.svg} ref={svgRef} width={canvasWidth} height={canvasHeight}></svg>
            {props.loading ? <CircularProgress className={classes.progress} color="primary" size={15} /> : null}
        </div>
    )
}

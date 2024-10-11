import * as d3 from 'd3'
import { useEffect, type RefObject } from 'react'
import stringify from 'json-stable-stringify'
import type { Dimension } from '../useDimension.js'
import { format } from 'date-fns'
import { alpha, useTheme } from '@mui/material'
import { bound, fixOverPosition } from './utils.js'

// TODO chart morph transform
export function useLineChart(
    svgRef: RefObject<SVGSVGElement | null>,
    data: Array<{
        date: Date
        value: number
    }>,
    dimension: Dimension,
    id: string,
    opts: {
        color?: string
        tickFormat?: string
        formatTooltip?: (value: number) => number | string
    },
) {
    const theme = useTheme()
    const { color = 'steelblue', tickFormat = ',.2s', formatTooltip = (value: number) => value } = opts
    const { top, right, bottom, left, width, height } = dimension
    const contentWidth = width - left - right
    const contentHeight = height - top - bottom
    useEffect(() => {
        if (!svgRef.current) return

        // remove old graph
        d3.select(svgRef.current).select(`#${id}`).remove()

        // not necessary
        if (data.length === 0) return

        // create new graph
        const graph = d3
            .select(svgRef.current)
            .append('g')
            .attr('id', id)
            .attr('transform', `translate(${left}, ${top})`)

        // create X axis
        const x = d3
            .scaleTime()
            .domain(d3.extent(data, (d) => d.date) as [Date, Date])
            .range([0, contentWidth])

        // create Y axis
        const min = d3.min(data, (d) => d.value) as number
        const max = d3.max(data, (d) => d.value) as number
        const dist = Math.abs(max - min)
        const y = d3
            .scaleLinear()
            .domain([min - dist * 0.05, max + dist * 0.05])
            .range([contentHeight, 0])

        const minPosition = {
            x: (x(data.find((x) => x.value === min)?.date as Date) ?? 0) - 30,
            y: (y(min) ?? 0) + 24,
        }

        const maxPosition = {
            x: (x(data.find((x) => x.value === max)?.date as Date) ?? 0) - 10,
            y: (y(max) ?? 0) - 16,
        }

        const minFixedPosition = fixOverPosition(contentWidth, contentHeight, minPosition.x, minPosition.y, 0, 10)
        const maxFixedPosition = fixOverPosition(contentWidth, contentHeight, maxPosition.x, maxPosition.y, 0)

        const minTextSelection = graph
            .append('text')
            .style('font-size', 14)
            .style('font-weight', 700)
            .attr('fill', theme.palette.text.secondary)
            .text(formatTooltip(min))
        const minTextNode = minTextSelection.node()
        const minTextRect = minTextNode?.getBoundingClientRect()

        const boundedMinPosition = bound({
            containerWidth: contentWidth,
            containerHeight: height,
            targetWidth: minTextRect?.width ?? 0,
            targetHeight: minTextRect?.height ?? 0,
            ...minFixedPosition,
        })
        minTextSelection.attr('transform', `translate(${boundedMinPosition.x}, ${boundedMinPosition.y})`)

        const maxTextSelection = graph
            .append('text')
            .style('font-size', 14)
            .style('font-weight', 700)
            .attr('fill', theme.palette.text.secondary)
            .text(formatTooltip(max))
        const maxTextNode = maxTextSelection.node()
        const maxTextRect = maxTextNode?.getBoundingClientRect()
        const boundedMaxPosition = bound({
            containerWidth: contentWidth,
            containerHeight: contentHeight,
            targetWidth: maxTextRect?.width ?? 0,
            targetHeight: maxTextRect?.height ?? 0,
            ...maxFixedPosition,
        })
        maxTextSelection.attr('transform', `translate(${boundedMaxPosition.x}, ${boundedMaxPosition.y})`)

        graph
            .append('g')
            .attr('transform', 'translate(0, 0)')
            .call((g) => g.select('.domain').remove())
            .call((g) => g.selectAll('.tick line').attr('stroke-opacity', 0.5).attr('stroke-dasharray', '2,2'))
            .call((g) => g.selectAll('.tick text').attr('x', 4).attr('dy', -4))

        // add line
        graph
            .append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr(
                'd',
                d3
                    .line()
                    .x((d) => x((d as any).date)!)
                    .y((d) => y((d as any).value)!) as any,
            )

        // create tooltip
        const tooltipLine = graph
            .append('line')
            .style('stroke', '#E0ECFF')
            .style('stroke-width', 1)
            .style('stroke-dasharray', '5,5')
            .style('display', 'none')
            .attr('x1', 0)
            .attr('y1', -top)
            .attr('x2', 0)
            .attr('y2', height)
        const tooltip = graph.append('g')

        const lineCallout = (g: d3.Selection<SVGLineElement, unknown, null, undefined>, value: any) => {
            if (!value) {
                g.style('display', 'none')
                return
            }
            g.style('display', null)
        }

        const callout = (
            g: d3.Selection<SVGGElement, unknown, null, undefined>,
            value: {
                text: string
                position: {
                    x: number
                    y: number
                }
            },
        ) => {
            if (!value) {
                g.style('display', 'none')
                return
            }

            const { text: textContent, position } = value

            g.style('display', null).style('pointer-events', 'none').style('font', '12px sans-serif')

            const path = g.selectAll('path').data([null]).join('path').attr('fill', theme.palette.background.tipMask)

            const text = g
                .selectAll('text')
                .data([null])
                .join('text')
                .call((text) =>
                    text
                        .selectAll('tspan')
                        .data((textContent + '').split(/\n/).map((x) => x.trim()))
                        .join('tspan')
                        .attr('x', 0)
                        .attr('y', (d, i) => `${i * 1.2}em`)
                        .style('font-weight', (_, i) => (i ? null : 'bold'))
                        .attr('fill', theme.palette.maskColor.bottom)
                        .text((d) => d),
                )

            const textNodeBox = (text.node() as SVGTextElement)?.getBBox()

            if (textNodeBox) {
                const { y: yValue, width: w } = textNodeBox
                const boxHalfWidth = w / 2
                const offset =
                    position.x - boxHalfWidth < 0 ? boxHalfWidth - position.x
                    : position.x + boxHalfWidth > contentWidth ? -(position.x + boxHalfWidth - contentWidth)
                    : 0
                const boxArrowX = 42.5 - offset
                const isFirstIndex = position.x === 35

                if (position.y + 54 > contentHeight) {
                    text.attr('transform', `translate(${-boxHalfWidth + offset},${-46 - yValue})`)
                    path.attr(
                        'd',
                        `M-${boxArrowX} -54h105s4 0 4 4v38s0 4 -4 4h-120s-4 0 -4 -4v-38s0 -4 4 -4 ${
                            isFirstIndex ? 'M -35 0 L -42 -10 L 11 -10 L -28 -10 Z' : 'M0 0L-7 -10L12 -10L7 -10Z'
                        }`,
                    ).attr('fill', alpha(theme.palette.background.tipMask, 0.9))
                } else {
                    text.attr('transform', `translate(${-boxHalfWidth + offset},${18 - yValue})`)

                    path.attr(
                        'd',
                        `M-${boxArrowX} 10h105s4 0 4 4v38s0 4 -4 4h-120s-4 0 -4 -4v-38s0 -4 4 -4 ${
                            isFirstIndex ? 'M -35 2 L -41 10 L 12 10 L -23 16 Z' : 'M0 2L-7 10L12 10L7 10Z'
                        } `,
                    ).attr('fill', alpha(theme.palette.background.tipMask, 0.9))
                }
            }
        }

        const hide = () => {
            tooltip.call(callout, null)
            tooltipLine.call(lineCallout, null)
        }

        // add tooltip
        d3.select(svgRef.current).on('mousemove', function () {
            const mx = d3.mouse(this)[0]
            if (mx < left - 10 || mx > left + contentWidth) {
                // mouse not in the content view
                hide()
                return
            }
            const fixedX = mx - left
            const bisect = (mx: number) => {
                const date = x.invert(mx)
                const index = d3
                    .bisector<
                        {
                            date: Date
                            value: number
                        },
                        Date
                    >((d) => d.date)
                    .left(data, date, 0)
                return { ...data[index], index }
            }

            const { date, value, index } = bisect(fixedX)

            tooltipLine.attr('transform', `translate(${Number(x(date))}, 0)`).call(lineCallout, date)

            tooltip
                .attr('transform', `translate(${index === 0 ? Number(x(date)) + 35 : Number(x(date))},${y(value)})`)
                .call(callout, {
                    text: `${formatTooltip(value)}
                ${format(date, 'MMM d, yyyy hh:mm')}`,
                    position: { x: index === 0 ? Number(x(date)) + 35 : Number(x(date)), y: y(value) },
                })
        })

        d3.select(svgRef.current).on('mouseleave', hide)
    }, [svgRef.current, data.length, stringify(dimension), tickFormat, formatTooltip])
}

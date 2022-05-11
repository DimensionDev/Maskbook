import * as d3 from 'd3'
import { useEffect, RefObject } from 'react'
import stringify from 'json-stable-stringify'
import type { Dimension } from './useDimension'
import format from 'date-fns/format'
import { useTheme } from '@mui/material'

export function useLineChart(
    svgRef: RefObject<SVGSVGElement>,
    data: Array<{ date: Date; value: number }>,
    dimension: Dimension,
    id: string,
    opts: { color?: string; tickFormat?: string; formatTooltip?: Function },
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

        // add X axis
        graph
            .append('g')
            .attr('transform', `translate(0, ${contentHeight})`)
            .call(d3.axisBottom(x).ticks(contentWidth / 100))

        // add Y axis
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
                // @ts-ignore
                d3
                    .line()
                    .x((d) => x((d as any).date))
                    .y((d) => y((d as any).value)),
            )

        // create tooltip
        const tooltip = graph.append('g')
        const tooltipLine = graph
            .append('line')
            .style('stroke', 'green')
            .style('stroke-width', 1.6)
            .style('stroke-dasharray', '5,5')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', contentHeight)

        const lineCallout = (g: d3.Selection<SVGLineElement, unknown, null, undefined>, value: any) => {
            if (!value) {
                g.style('display', 'none')
                return
            }
            g.style('display', null)
        }

        const callout = (
            g: d3.Selection<SVGGElement, unknown, null, undefined>,
            value: { text: string; position: { x: number; y: number } },
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
                        .style('color', '#ffffff')
                        .attr('color', '#ffffff')
                        .attr('fill', '#ffffff')
                        .text((d) => d),
                )

            const textBBox = (text.node() as SVGTextElement)?.getBBox()

            if (textBBox) {
                const { x, y: yValue, width: w, height: h } = textBBox
                if (position.y + 54 > contentHeight) {
                    text.attr('transform', `translate(${-w / 2},${-46 - yValue})`)
                    path.attr(
                        'd',
                        'M-42.5 -54h85s4 0 4 4v38s0 4 -4 4h-85s-4 0 -4 -4v-38s0 -4 4 -4 M0 0L-7 -10L12 -10L7 -10Z',
                    ).attr('fill', theme.palette.background.tipMask)
                } else {
                    text.attr('transform', `translate(${-w / 2},${14 - yValue})`)

                    path.attr(
                        'd',
                        'M-42.5 10h85s4 0 4 4v38s0 4 -4 4h-85s-4 0 -4 -4v-38s0 -4 4 -4 M0 2L-7 10L12 10L7 10Z',
                    ).attr('fill', theme.palette.background.tipMask)
                }
            }
        }

        const hide = () => {
            tooltip.call(callout, null)
            tooltipLine.call(lineCallout, null)
        }

        // add tooltip
        d3.select(svgRef.current).on('mousemove', function () {
            // eslint-disable-next-line @typescript-eslint/no-invalid-this
            const mx = d3.mouse(this)[0]
            if (mx < left || mx > left + contentWidth) {
                // mouse not in the content view
                hide()
                return
            }
            const fixedX = mx - left
            const bisect = (mx: number) => {
                const date = x.invert(mx)
                const index = d3.bisector<{ date: Date; value: number }, Date>((d) => d.date).left(data, date, 1)
                return data[index]
            }

            const { date, value } = bisect(fixedX)

            tooltipLine.attr('transform', `translate(${Number(x(date))}, 0)`).call(lineCallout, date)

            tooltip.attr('transform', `translate(${Number(x(date))},${y(value)})`).call(callout, {
                text: `${formatTooltip(value)}
                ${format(date, 'MMM d, yyyy')}`,
                position: { x: Number(x(date)), y: y(value) },
            })
        })

        d3.select(svgRef.current).on('mouseleave', hide)
    }, [svgRef, data.length, stringify(dimension), tickFormat, formatTooltip])
}

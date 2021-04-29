import * as d3 from 'd3'
import { useEffect, RefObject } from 'react'
import stringify from 'json-stable-stringify'
import type { Dimension } from './useDimension'

export function usePriceLineChart(
    svgRef: RefObject<SVGSVGElement>,
    data: { date: Date; value: number }[],
    dimension: Dimension,
    id: string,
    color = 'steelblue',
    sign = '$',
) {
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
            .call(
                d3
                    .axisRight(y)
                    .ticks(contentHeight / 50, `${sign},.2s`)
                    .tickSize(contentWidth),
            )
            .call((g) => g.select('.domain').remove())
            .call((g) => g.selectAll('.tick line').attr('stroke-opacity', 0.5).attr('stroke-dasharray', '2,2'))
            .call((g) => g.selectAll('.tick text').attr('x', 4).attr('dy', -4))

        // add line
        graph
            .append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
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
        const callout = (g: d3.Selection<SVGGElement, unknown, null, undefined>, value: any) => {
            if (!value) {
                g.style('display', 'none')
                return
            }

            g.style('display', null).style('pointer-events', 'none').style('font', '10px sans-serif')

            const path = g.selectAll('path').data([null]).join('path').attr('fill', 'white').attr('stroke', 'black')

            const text = g
                .selectAll('text')
                .data([null])
                .join('text')
                .call((text) =>
                    text
                        .selectAll('tspan')
                        .data((value + '').split(/\n/))
                        .join('tspan')
                        .attr('x', 0)
                        .attr('y', (d, i) => `${i * 1.1}em`)
                        .style('font-weight', (_, i) => (i ? null : 'bold'))
                        .text((d) => d),
                )

            const textBBox = (text.node() as SVGTextElement)?.getBBox()
            if (textBBox) {
                const { x, y, width: w, height: h } = textBBox
                text.attr('transform', `translate(${x},${15 - y})`)
                path.attr('d', `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`)
            }
        }

        // add tooltip
        d3.select(svgRef.current).on('mousemove', function (event) {
            const bisect = (mx: any) => {
                const date = x.invert(mx)
                const index = d3.bisector<{ date: Date; value: number }, Date>((d) => d.date).left(data, date, 1)
                return data[index]
            }

            const { date, value } = bisect(d3.mouse(this)[0])

            tooltip.attr('transform', `translate(${Number(x(date)) - 18},${y(value)})`).call(
                callout,
                `${value.toLocaleString('en', {
                    style: 'currency',
                    currency: 'USD',
                })}
                ${date.toLocaleString('en', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'UTC',
                })}`,
            )
        })

        d3.select(svgRef.current).on('mouseleave', () => tooltip.call(callout, null))
    }, [svgRef, data.length, stringify(dimension), sign])
}

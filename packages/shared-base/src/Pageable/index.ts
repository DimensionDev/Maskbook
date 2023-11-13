export interface Pageable<Item, Indicator = unknown> {
    /** the indicator of the current page */
    indicator: Indicator
    /** the indicator of the next page */
    nextIndicator?: Indicator
    /** items data */
    data: Item[]
}

export interface PageIndicator {
    /** The id of the page (cursor). */
    id: string
    /** The index number of the page. */
    index: number
}

export function createIndicator(indicator?: PageIndicator, id?: string): PageIndicator {
    const index = indicator?.index ?? 0
    return {
        id: id ?? indicator?.id ?? index.toString(),
        index,
    }
}

export function createNextIndicator(indicator?: PageIndicator, id?: string): PageIndicator {
    const index = (indicator?.index ?? 0) + 1
    return typeof id === 'string' ?
            {
                id,
                index,
            }
        :   {
                id: index.toString(),
                index,
            }
}

export function createPageable<Item, Indicator = PageIndicator>(
    data: Item[],
    indicator: Indicator,
    nextIndicator?: Indicator,
) {
    // with next page
    if (typeof nextIndicator !== 'undefined') {
        return {
            data,
            indicator,
            nextIndicator,
        }
    }
    // without next page
    return {
        data,
        indicator,
    }
}

export async function* pageableToIterator<T>(
    getPageable: (indicator?: PageIndicator) => Promise<Pageable<T> | void>,
    {
        maxSize = 25,
    }: {
        maxSize?: number
    } = {},
) {
    let indicator = createIndicator()
    for (let i = 0; i < maxSize; i += 1) {
        try {
            const pageable = await getPageable(indicator)
            if (!pageable) return
            yield* pageable.data
            if (!pageable.nextIndicator) return
            indicator = pageable.nextIndicator as PageIndicator
        } catch (error) {
            yield new Error((error as Error).message)
        }
    }
}

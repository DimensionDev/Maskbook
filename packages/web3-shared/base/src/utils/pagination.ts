import type { HubIndicator, Pageable } from '../specs'

export function createIndicator(indicator?: HubIndicator, id?: string) {
    const index = indicator?.index ?? 0
    return {
        id: id ?? indicator?.id ?? index.toString(),
        index,
    }
}

export function createNextIndicator(indicator?: HubIndicator, id?: string) {
    const index = (indicator?.index ?? 0) + 1
    return typeof id === 'string'
        ? {
              id,
              index,
          }
        : {
              id: index.toString(),
              index,
          }
}

export function createPageable<Item, Indicator = HubIndicator>(
    data: Item[],
    indicator: Indicator,
    nextIndicator?: Indicator,
) {
    if (typeof nextIndicator !== 'undefined') {
        return {
            data,
            indicator,
            nextIndicator,
        }
    }
    return {
        data,
        indicator,
    }
}

export async function* pageableToIterator<T>(
    getPageable: (indicator?: HubIndicator) => Promise<Pageable<T> | void>,
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
            indicator = pageable.nextIndicator as HubIndicator
        } catch (error) {
            yield new Error((error as Error).message)
        }
    }
}

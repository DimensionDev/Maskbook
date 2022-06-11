import type { HubIndicator } from '../specs'

export function createIndicator(indicator?: HubIndicator, id?: string) {
    const index = indicator?.index ?? 0
    return {
        id: id ?? index.toString(),
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

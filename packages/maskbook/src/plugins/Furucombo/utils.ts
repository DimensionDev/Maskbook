export function liquidityFormatter(num: number, digits: number) {
    const lookup = [
        { value: 1, symbol: '' },
        { value: 1e3, symbol: 'K' },
        { value: 1e6, symbol: 'M' },
        { value: 1e9, symbol: 'B' },
        { value: 1e12, symbol: 'T' },
        { value: 1e15, symbol: 'P' },
        { value: 1e18, symbol: 'E' },
    ]
    const rx = /\.0+$|(\.\d*[1-9])0+$/
    const item = lookup
        .slice()
        .reverse()
        .find(function (item) {
            return num >= item.value
        })
    return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0'
}

export function apyFormatter(num: number) {
    return (num * 100).toFixed(2) + '%'
}

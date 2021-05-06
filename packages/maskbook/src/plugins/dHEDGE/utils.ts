export function formatAmountPostfix(amount: any) {
    let postfix = ''
    let formatedAmount = Number(amount)

    if (amount >= 1000 * 1000 * 1000 * 1000) {
        postfix = 'T'
        formatedAmount = amount / (1000 * 1000 * 1000 * 1000)
    } else if (amount >= 1000 * 1000 * 1000) {
        postfix = 'B'
        formatedAmount = amount / (1000 * 1000 * 1000)
    } else if (amount >= 1000 * 1000) {
        postfix = 'M'
        formatedAmount = amount / (1000 * 1000)
    } else if (amount >= 1000) {
        postfix = 'K'
        formatedAmount = amount / 1000
    }
    return formatedAmount.toFixed(1).replace(/\.0$/, '') + postfix
}

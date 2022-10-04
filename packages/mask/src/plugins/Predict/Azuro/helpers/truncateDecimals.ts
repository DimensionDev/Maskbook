const truncateDecimals = function (number: number) {
    const digits = 2
    const multiplier = Math.pow(10, digits)
    const adjustedNum = number * multiplier
    const truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum)

    return truncatedNum / multiplier
}

export default truncateDecimals

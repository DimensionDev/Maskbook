const RANGE_SIZE = 50000

const makeRanges = (fromBlock: number, latestBlock: number, rangeSize: number = RANGE_SIZE) => {
    const ranges: Array<[number, number]> = []

    for (let startBlock = fromBlock; startBlock < latestBlock; startBlock += rangeSize) {
        startBlock === fromBlock ? startBlock : startBlock + 1
        const endBlock = startBlock + rangeSize > latestBlock ? latestBlock : startBlock + rangeSize

        ranges.push([startBlock, endBlock])
    }

    return ranges
}

export default makeRanges

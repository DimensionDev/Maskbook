const ETH_GAS_STATION_API = 'https://ethgasstation.info/api/ethgasAPI.json'
const WATCH_INTERVAL = 30 /* seconds */ * 1000 /* milliseconds */

class EthGasStationManager {
    private timer: NodeJS.Timer | null = null

    public async fetch() {
        const response = await fetch(ETH_GAS_STATION_API)
        const data = (await response.json()) as {
            average: number
            avgWait: number
            blockNum: number
            block_time: number
            fast: number
            fastWait: number
            fastest: number
            fastestWait: number
            gasPriceRange: {
                [key: string]: number
            }
            safeLow: number
            safeLowWait: number
            speed: number
        }
        console.log(data)
    }

    public watch() {
        const tick = async () => {
            try {
                await this.fetch()
            } catch (e) {
                // do nothing
            } finally {
                setTimeout(tick, WATCH_INTERVAL)
            }
        }
        setTimeout(tick, WATCH_INTERVAL)
    }

    public unwatch() {
        if (this.timer !== null) clearTimeout(this.timer)
    }
}

const manager = new EthGasStationManager()

export function watch() {
    manager.watch()
}

export function unwatch() {
    manager.unwatch()
}

import Gun from 'gun'
import 'gun/sea'
import 'gun/lib/radix'
import 'gun/lib/radisk'
import 'gun/lib/store'
import 'gun/lib/rindexed'
import { gunServers } from '.'
import { startEffects } from '../../../utils-pure'

const { signal } = startEffects(import.meta.webpackHot)

export type GunRoot = ReturnType<typeof createGun>
let gun: GunRoot | undefined
export function getGunInstance(): GunRoot {
    if (gun) return gun
    return (gun = createGun())
}

function createGun() {
    class WebSocket extends globalThis.WebSocket {
        constructor(url: string | URL) {
            super(url)
            const abort = (this.abort = () => {
                gun = undefined
                this.close()
                console.log('[Network/gun] WebSocket of the Gun instance is killed due to inactive.')
            })
            const tick = (this.tick = () => {
                if (this.timer) clearTimeout(this.timer)
                this.timer = setTimeout(abort, 15 * 60 * 1000)
            })
            signal.addEventListener('abort', abort)
            this.addEventListener('message', tick, { signal })
        }
        private declare abort: () => void
        private declare tick: () => void
        declare timer: NodeJS.Timeout | undefined
        override send(data: any) {
            this.tick()
            super.send(data)
        }
    }

    const _ = new Gun({
        peers: [...gunServers],
        localStorage: false,
        radisk: true,
        WebSocket,
    })
    _.opt({ retry: Number.POSITIVE_INFINITY })
    return _
}

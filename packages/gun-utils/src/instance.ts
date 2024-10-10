import { gunServers } from './server.js'
declare const Gun: typeof import('gun')

type GunRoot = ReturnType<typeof createGun>
let gun: GunRoot | undefined
export function getGunInstance(): GunRoot {
    if (gun) return gun
    return (gun = createGun())
}
export const OnCloseEvent = new Set<() => void>()

function createGun() {
    class WebSocket extends globalThis.WebSocket {
        constructor(url: string | URL) {
            super(url)
            const abort = (this.abort = () => {
                gun?.off()
                gun = undefined
                this.close()
                for (const each of OnCloseEvent) each()
                console.log('[Network/gun] WebSocket of the Gun instance is killed due to inactive.')
            })
            const keepAlive = (this.keepAlive = () => {
                if (this.timer) clearTimeout(this.timer)
                this.timer = setTimeout(abort, 3 * 60 * 1000)
            })
            this.addEventListener(
                'message',
                (e) => {
                    // if there is no meaningful data exchange, then do not keep the connection alive.
                    if (typeof e.data === 'string' && e.data.length < 3) return
                    keepAlive()
                },
                {},
            )
        }
        private declare abort: () => void
        private declare keepAlive: () => void
        declare timer: ReturnType<typeof setTimeout> | undefined
        override send(data: any) {
            this.keepAlive()
            super.send(data)
        }
        override get onclose() {
            return null
        }
        override set onclose(f) {}
    }

    const _ = new Gun({
        peers: [...gunServers],
        localStorage: false,
        // cspell:disable-next-line
        radisk: true,
        WebSocket,
    })
    _.opt({ retry: Number.POSITIVE_INFINITY })
    return _
}

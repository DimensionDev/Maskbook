// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

function uuid() {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const s4 = () =>
        Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .slice(1)
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`
}

class TickManager {
    get defaults() {
        return {
            isRunning: false,
            time: {
                elapsed: 0,
                delta: 0,
                prev: 0,
                stamp: Date.now(),
            },
        }
    }

    constructor(autostart = true) {
        this.state = { ...this.defaults }
        this.stack = []

        autostart && this.start()
    }

    // Return a static copy of the current time data
    get time() {
        return { ...this.state.time }
    }

    // Public
    // ------

    start() {
        if (this.state.isRunning) {
            console.error('TickManager.js: instance was already running!')
            return
        }

        this.state.isRunning = true

        this.addEvents()
    }

    stop() {
        this.state.isRunning = false

        this.removeEvents()
    }

    register(handler, ID) {
        const id = ID !== undefined ? ID : uuid()

        this.stack[id] = handler

        return id
    }

    // Alias 'on' for registration
    on = (handler) => this.register(handler)

    deregister(id) {
        delete this.stack[id]
    }

    // Alias 'off' for deregistration
    off = (id) => this.deregister(id)

    // Bindings
    // --------

    addEvents() {
        this.raf = window.requestAnimationFrame(this.onTick)
    }

    removeEvents() {
        window.cancelAnimationFrame(this.raf)
    }

    // Handlers
    // --------

    onTick = () => {
        this.raf = window.requestAnimationFrame(this.onTick)

        this.updateTime()
        this.propagate()
    }

    updateTime() {
        const now = performance.now()

        this.state.time.elapsed = now
        this.state.time.delta = now - this.state.time.prev
        this.state.time.prev = now
        this.state.time.stamp = Date.now()
    }

    propagate() {
        const { delta, elapsed, stamp } = this.state.time
        const keys = Object.keys(this.stack)

        // eslint-disable-next-line no-plusplus
        for (let i = 0, len = keys.length; i < len; i++) {
            this.stack[keys[i]](delta, elapsed, stamp)
        }
    }
}

export default TickManager

import type { VoiceChatExtendedAnalyserNode as Analyser } from '../types'

export interface Options {
    context: AudioContext
    fftSize?: number
    tweenIn?: number
    tweenOut?: number
    onEnterFrame(next: number): void
}

export function VolumeMeter(options: Options): Analyser {
    const { context, onEnterFrame } = options
    const fftSize = options.fftSize ?? 32
    const tweenIn = options.tweenIn ?? 1.618
    const tweenOut = options.tweenOut ?? tweenIn * 3

    let range,
        next: number,
        tween: number,
        last: number = 0
    let handle: number = null!
    const analyser = context.createAnalyser() as Analyser

    analyser.stop = function () {
        this.ended = true
        window.cancelAnimationFrame(handle)
    }

    analyser.fftSize = fftSize
    const buffer = new Uint8Array(fftSize)

    function render() {
        if (analyser.ended) return

        analyser.getByteTimeDomainData(buffer)
        range = getDynamicRange(buffer) * (Math.E - 1)
        next = Math.floor(Math.log1p(range) * 100)
        tween = next > last ? tweenIn : tweenOut
        next = last = last + (next - last) / tween

        onEnterFrame(next)
        handle = window.requestAnimationFrame(render)
    }

    render()

    return analyser
}

function getDynamicRange(buffer: Uint8Array) {
    const len = buffer.length
    let min = 128
    let max = 128

    for (let i = 0; i < len; i++) {
        const sample = buffer[i]
        if (sample < min) min = sample
        else if (sample > max) max = sample
    }

    return (max - min) / 255
}

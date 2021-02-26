import type { VoiceChatExtendedAnalyserNode as Analyser } from '../types'

export interface Opts {
    fftSize?: number
    tweenIn?: number
    tweenOut?: number
}
export function VolumeMeter(context: AudioContext, opts: Opts, onEnterFrame: (next: number) => void): Analyser {
    opts.fftSize = opts.fftSize ?? 32
    opts.tweenIn = opts.tweenIn ?? 1.618
    opts.tweenOut = opts.tweenOut ?? opts.tweenIn * 3

    const { fftSize, tweenIn, tweenOut } = opts as Required<Opts>

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

    analyser.fftSize = opts.fftSize
    const buffer = new Uint8Array(opts.fftSize)

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

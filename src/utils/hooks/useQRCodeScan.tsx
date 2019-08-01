/** This file is published under MIT License */
import { useRef, useEffect } from 'react'
import { useRequestCamera, getFrontVideoDevices } from './useRequestCamera'
import { useInterval } from './useInterval'
import { BarcodeDetector } from '../../components/Welcomes/QRScanner/ShapeDetectionPolyfill'
export function useQRCodeScan(
    video: React.MutableRefObject<HTMLVideoElement | null>,
    isScanning: boolean,
    onResult: (data: string) => void,
    onError: () => void,
) {
    // ? Get video stream
    {
        const permission = useRequestCamera(isScanning)
        const ref = useRef<MediaStream | null>(null)
        useEffect(() => {
            ref.current && ref.current.getTracks().forEach(x => x.stop())
        }, [])
        useEffect(() => {
            async function start() {
                if (permission !== 'granted') return
                const device = await getFrontVideoDevices()
                const media = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: device === null ? { facingMode: 'environment' } : { deviceId: device },
                })
                ref.current = media
                if (!video.current) return
                video.current.srcObject = media
                video.current.play()
            }
            function stop() {
                ref.current && ref.current.getTracks().forEach(x => x.stop())
                ref.current = null
                video.current!.pause()
            }
            if (!video.current) return
            if (isScanning && !ref.current) start()
            if (isScanning && ref.current) video.current.play()
            if (!isScanning && ref.current) stop()
            if (!isScanning && !ref.current) video.current.pause()
        }, [isScanning, permission, video.current])
    }
    // ? Do scan
    {
        const scanner = useRef(new BarcodeDetector({ formats: ['qr_code'] }))
        const lastScanning = useRef(false)
        const errorTimes = useRef(0)
        useInterval(async () => {
            if (errorTimes.current >= 10)
                if (errorTimes.current === 10) {
                    errorTimes.current += 1
                    return onError()
                } else return
            if (lastScanning.current) return
            if (!video.current || !isScanning) return
            lastScanning.current = true
            try {
                const [result] = await scanner.current.detect(video.current)
                if (result) onResult(result.rawValue)
            } catch (e) {
                errorTimes.current += 1
                console.error(e)
            } finally {
                lastScanning.current = false
            }
        }, 500)
    }
}

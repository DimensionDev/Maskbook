/// <reference path="../../components/Welcomes/QRScanner/ShapeDetectionSpec.d.ts" />
/** This file is published under MIT License */
import { useRef, useEffect, useState } from 'react'
import { useRequestCamera, getBackVideoDeviceId } from './useRequestCamera'
import { useInterval } from './useInterval'
import '../../components/Welcomes/QRScanner/ShapeDetectionPolyfill'

export function useQRCodeScan(
    video: React.MutableRefObject<HTMLVideoElement | null>,
    isScanning: boolean,
    onResult: (data: string) => void,
    onError: () => void,
) {
    // ? Get video stream
    {
        const permission = useRequestCamera(isScanning)
        const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)

        useEffect(() => {
            async function start() {
                if (permission !== 'granted' || !video.current) return
                try {
                    let media = mediaStream
                    if (!media) {
                        const device = await getBackVideoDeviceId()
                        media = await navigator.mediaDevices.getUserMedia({
                            audio: false,
                            video: device === null ? { facingMode: 'environment' } : { deviceId: device },
                        })
                        setMediaStream(media)
                    }
                    video.current.srcObject = media
                    video.current.play()
                } catch (e) {
                    console.error(e)
                    setMediaStream(null)
                    video.current.srcObject = null
                    video.current.pause()
                }
            }
            function stop() {
                if (mediaStream) {
                    mediaStream.getTracks().forEach(x => x.stop())
                    setMediaStream(null)
                }
                video.current!.pause()
            }
            if (!video.current) return
            start()
            return () => {
                stop()
            }
        }, [isScanning, mediaStream, permission, video])
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
        }, 100)
    }
}

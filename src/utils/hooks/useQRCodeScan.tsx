/// <reference path="../../components/QRScanner/ShapeDetectionSpec.d.ts" />
/** This file is published under MIT License */
import { useRef, useEffect, useState } from 'react'
import { useInterval } from 'react-use'
import { useRequestCamera } from './useRequestCamera'
import '../../components/QRScanner/ShapeDetectionPolyfill'

export async function getBackVideoDeviceId() {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter((devices) => devices.kind === 'videoinput')
    const back = devices.find(
        (device) =>
            (device.label.toLowerCase().search('back') !== -1 || device.label.toLowerCase().search('rear') !== -1) &&
            device.label.toLowerCase().search('front') === -1,
    )
    if (back) return back.deviceId
    if (devices[0]) return devices[0].deviceId
    return null
}

export function useQRCodeScan(
    video: React.MutableRefObject<HTMLVideoElement | null>,
    isScanning: boolean,
    onResult: (data: string) => void,
    onError: () => void,
) {
    // TODO!: ? not work See https://github.com/DimensionDev/Maskbook/issues/810
    // ? Get video stream
    {
        const permission = useRequestCamera(isScanning)
        const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)

        useEffect(() => {
            function stop() {
                if (mediaStream) {
                    mediaStream.getTracks().forEach((x) => x.stop())
                }
                video.current!.pause()
            }
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
                        return setMediaStream(media)
                    }
                    video.current.srcObject = media
                    video.current.play()
                } catch (e) {
                    console.error(e)
                    stop()
                }
            }
            if (!video.current) return
            if (!isScanning) return stop()

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
            } finally {
                lastScanning.current = false
            }
        }, 100)
    }
}

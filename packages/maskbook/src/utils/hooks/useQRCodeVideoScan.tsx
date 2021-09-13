/// <reference path="../../components/QRScanner/ShapeDetectionSpec.d.ts" />
/** This file is published under MIT License */
import { filter, find, first } from 'lodash-es'
import { useRef, useEffect, useState } from 'react'
import { useInterval } from 'react-use'
import { useQueryNavigatorPermission } from './useQueryNavigatorPermission'
import '../../components/QRScanner/ShapeDetectionPolyfill'

async function getBackVideoDeviceId() {
    const devices = filter(await navigator.mediaDevices.enumerateDevices(), ({ kind }) => kind === 'videoinput')
    const back = find(devices, ({ label }) => !/front/i.test(label) && /back|rear/i.test(label))
    return (back ?? first(devices))?.deviceId ?? null
}

export function useQRCodeVideoScan(
    video: React.MutableRefObject<HTMLVideoElement | null>,
    isScanning: boolean,
    deviceId?: string,
    onResult?: (data: string) => void,
    onError?: () => void,
) {
    // TODO!: ? not work See https://github.com/DimensionDev/Maskbook/issues/810
    // ? Get video stream
    {
        const permission = useQueryNavigatorPermission(isScanning, 'camera')
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
                        const device = deviceId ?? (await getBackVideoDeviceId())
                        media = await navigator.mediaDevices.getUserMedia({
                            audio: false,
                            video: device === null ? { facingMode: 'environment' } : { deviceId: device },
                        })
                        return setMediaStream(media)
                    }
                    video.current.srcObject = media
                    video.current.play()
                } catch (error) {
                    console.error(error)
                    stop()
                }
            }
            if (!video.current) return
            if (!isScanning) return stop()

            start()
            return () => {
                stop()
            }
        }, [deviceId, isScanning, mediaStream, permission, video])
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
                    return onError?.()
                } else return
            if (lastScanning.current) return
            if (!video.current || !isScanning) return
            lastScanning.current = true
            try {
                const [result] = await scanner.current.detect(video.current)
                if (result) onResult?.(result.rawValue)
            } catch {
                errorTimes.current += 1
            } finally {
                lastScanning.current = false
            }
        }, 100)
    }
}

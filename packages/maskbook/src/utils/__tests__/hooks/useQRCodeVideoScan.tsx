import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

import { createRef, RefObject } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { useQRCodeVideoScan, getBackVideoDeviceId } from '../../hooks/useQRCodeVideoScan'
import { delay } from '../../utils'

const videoRef: RefObject<HTMLVideoElement> = createRef<HTMLVideoElement>()

beforeAll(() => {
    window.HTMLMediaElement.prototype.play = () => Promise.resolve()
    window.HTMLMediaElement.prototype.pause = () => {}
})

afterAll(() => {
    // @ts-ignore
    delete window.HTMLMediaElement.prototype.play
    // @ts-ignore
    delete window.HTMLMediaElement.prototype.pause
})

beforeEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
        value: {
            getUserMedia() {
                return {
                    getTracks() {
                        return [{ stop() {} }]
                    },
                }
            },
            enumerateDevices() {
                return [
                    {
                        kind: 'videoinput',
                        label: 'back',
                        deviceId: 'back',
                    },
                ]
            },
        },
        writable: true,
    })
    mount(
        <div>
            <video ref={videoRef} />
        </div>,
    )
})

afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {})
})

test('get back video device id', async () => {
    expect(await getBackVideoDeviceId()).toEqual('back')
})

test('scan succeeded', async () => {
    class BarcodeDetector {
        detect() {
            return 'test'
        }
    }
    // @ts-ignore
    window.BarcodeDetector = BarcodeDetector

    const onResultSpy = jasmine.createSpy()
    const hook = renderHook(() => useQRCodeVideoScan(videoRef, true, undefined, onResultSpy, () => {}))

    await hook.waitForNextUpdate()
    expect(onResultSpy.calls.count()).toBe(0)
    await delay(1000)
    expect(onResultSpy.calls.count() > 0).toBeTruthy()
})

test('scan failed', async () => {
    class BarcodeDetector {
        detect() {
            throw new Error('error')
        }
    }
    // @ts-ignore
    window.BarcodeDetector = BarcodeDetector

    const onErrorSpy = jasmine.createSpy()
    const hook = renderHook(() => useQRCodeVideoScan(videoRef, true, undefined, () => {}, onErrorSpy))

    await hook.waitForNextUpdate()
    expect(onErrorSpy.calls.count()).toBe(0)
    await delay(2000)
    expect(onErrorSpy.calls.count() > 0).toBeTruthy()
})

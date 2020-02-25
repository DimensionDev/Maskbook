import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

import React, { createRef, RefObject } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { useCapturedInput, captureEevnts } from '../../hooks/useCapturedEvents'

let containerRef: RefObject<HTMLDivElement>
let inputRef: RefObject<HTMLInputElement>

beforeEach(() => {
    containerRef = createRef<HTMLDivElement>()
    inputRef = createRef<HTMLInputElement>()
    mount(
        <div ref={containerRef}>
            <input ref={inputRef} />
        </div>,
    )
})

test('invoke callback with input value', () => {
    const inputSpy = jasmine.createSpy()
    renderHook(() => useCapturedInput(inputSpy, [], inputRef))

    inputRef.current!.dispatchEvent(new CustomEvent('input', { bubbles: true }))
    expect(inputSpy.calls.argsFor(0)).toStrictEqual([''])

    inputRef.current!.value = 'test'
    inputRef.current!.dispatchEvent(new CustomEvent('input', { bubbles: true }))
    expect(inputSpy.calls.argsFor(1)).toStrictEqual(['test'])
})

for (const name of captureEevnts) {
    test(`bypass event: ${name}`, () => {
        const containerSpy = jasmine.createSpy()

        containerRef.current!.addEventListener(name, containerSpy)
        inputRef.current!.dispatchEvent(new CustomEvent(name, { bubbles: true }))
        expect(containerSpy.calls.count()).toBe(1)

        containerRef.current!.removeEventListener(name, containerSpy) // restore
    })
    test(`capture event: ${name}`, () => {
        const containerSpy = jasmine.createSpy()
        renderHook(() => useCapturedInput(() => {}, [], inputRef))

        containerRef.current!.addEventListener(name, containerSpy)
        inputRef.current!.dispatchEvent(new CustomEvent(name, { bubbles: true }))
        expect(containerSpy.calls.count()).toBe(0)

        containerRef.current!.removeEventListener(name, containerSpy) // restore
    })
    test(`remove listener: ${name}`, () => {
        const containerSpy = jasmine.createSpy()

        containerRef.current!.addEventListener(name, containerSpy)
        inputRef.current!.dispatchEvent(new CustomEvent(name, { bubbles: true }))
        expect(containerSpy.calls.count()).toBe(1)

        const hook = renderHook(() => useCapturedInput(() => {}, [], inputRef))
        inputRef.current!.dispatchEvent(new CustomEvent(name, { bubbles: true }))
        expect(containerSpy.calls.count()).toBe(1)

        hook.unmount()
        inputRef.current!.dispatchEvent(new CustomEvent(name, { bubbles: true }))
        expect(containerSpy.calls.count()).toBe(2)

        containerRef.current!.removeEventListener(name, containerSpy) // restore
    })
}

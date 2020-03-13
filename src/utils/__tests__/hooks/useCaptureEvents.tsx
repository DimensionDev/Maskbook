import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

import React, { createRef, RefObject } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { useCapturedInput, captureEvents } from '../../hooks/useCapturedEvents'

const containerRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>()
const inputRef: RefObject<HTMLInputElement> = createRef<HTMLInputElement>()

beforeEach(() => {
    mount(
        <div ref={containerRef}>
            <input ref={inputRef} />
        </div>,
    )
})

test('invoke callback with input value', () => {
    const inputSpy = jasmine.createSpy()
    const [_, updateInputNode] = renderHook(() => useCapturedInput(inputSpy, [])).result.current
    act(() => updateInputNode(inputRef.current))

    inputRef.current!.dispatchEvent(new CustomEvent('input', { bubbles: true }))
    expect(inputSpy.calls.argsFor(0)).toStrictEqual([''])

    inputRef.current!.value = 'test'
    inputRef.current!.dispatchEvent(new CustomEvent('input', { bubbles: true }))
    expect(inputSpy.calls.argsFor(1)).toStrictEqual(['test'])
})

for (const name of captureEvents) {
    test(`bypass event: ${name}`, () => {
        const containerSpy = jasmine.createSpy()

        containerRef.current!.addEventListener(name, containerSpy)
        inputRef.current!.dispatchEvent(new CustomEvent(name, { bubbles: true }))
        expect(containerSpy.calls.count()).toBe(1)

        containerRef.current!.removeEventListener(name, containerSpy) // restore
    })
    test(`capture event: ${name}`, () => {
        const containerSpy = jasmine.createSpy()
        const [_, updateInputNode] = renderHook(() => useCapturedInput(() => {}, [])).result.current
        act(() => updateInputNode(inputRef.current))

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

        const hook = renderHook(() => useCapturedInput(() => {}, []))
        const [_, updateInputNode] = hook.result.current
        act(() => updateInputNode(inputRef.current))

        inputRef.current!.dispatchEvent(new CustomEvent(name, { bubbles: true }))
        expect(containerSpy.calls.count()).toBe(1)

        hook.unmount()
        inputRef.current!.dispatchEvent(new CustomEvent(name, { bubbles: true }))
        expect(containerSpy.calls.count()).toBe(2)

        containerRef.current!.removeEventListener(name, containerSpy) // restore
    })
}

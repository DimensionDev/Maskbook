import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'

function createDragEvent(name?: string) {
    return ({
        preventDefault() {},
        dataTransfer: {
            files: {
                item() {
                    return {
                        name,
                    }
                },
            },
        },
    } as any) as React.DragEvent
}

test('drag enter', () => {
    const { result } = renderHook(() => useDragAndDrop())
    expect(result.current.dragStatus).toEqual(undefined)
    act(() => result.current.dragEvents.onDragEnterCapture(createDragEvent()))
    expect(result.current.dragStatus).toEqual('drag-enter')
})

test('drag over', () => {
    const { result } = renderHook(() => useDragAndDrop())
    expect(result.current.dragStatus).toEqual(undefined)
    act(() => result.current.dragEvents.onDragEnterCapture(createDragEvent()))
    expect(result.current.dragStatus).toEqual('drag-enter')
})

test('drag leave', () => {
    const { result } = renderHook(() => useDragAndDrop())
    expect(result.current.dragStatus).toEqual(undefined)
    act(() => result.current.dragEvents.onDragLeaveCapture(createDragEvent()))
    expect(result.current.dragStatus).toEqual(undefined)
})

test('drag drop', () => {
    const callbackSpy = jasmine.createSpy()
    const { result } = renderHook(() => useDragAndDrop(callbackSpy))
    expect(result.current.dragStatus).toEqual(undefined)
    act(() => result.current.dragEvents.onDropCapture(createDragEvent('test')))
    expect(result.current.dragStatus).toEqual('selected')
    expect(callbackSpy).toHaveBeenCalled()
    expect(callbackSpy.calls.argsFor(0)).toStrictEqual([{ name: 'test' }])
})

test('file receiver', () => {
    const callbackSpy = jasmine.createSpy()
    const { result } = renderHook(() => useDragAndDrop(callbackSpy))
    expect(result.current.dragStatus).toEqual(undefined)
    act(() => result.current.fileReceiver(createDragEvent('test')))
    expect(result.current.dragStatus).toEqual('selected')
    expect(callbackSpy).toHaveBeenCalled()
    expect(callbackSpy.calls.argsFor(0)).toStrictEqual([{ name: 'test' }])
})

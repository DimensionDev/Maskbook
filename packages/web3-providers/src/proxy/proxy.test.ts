import { describe, test, expect, beforeEach, afterEach, xtest, jest } from '@jest/globals'
import { ProviderProxy } from './index'
import * as mockWS from 'jest-websocket-mock'

const POINT = 'ws://localhost:1235'

describe('Proxy websocket', () => {
    let server: mockWS.WS
    let client: ProviderProxy
    let mockNotifyCallback: any

    // TODO: remove any
    const pushToClientMockData = (data: any) => server.send(data)

    beforeEach(async () => {
        mockNotifyCallback = jest.fn()
        server = new mockWS.WS(POINT, { jsonProtocol: true })
        client = new ProviderProxy(POINT, mockNotifyCallback)

        await server.connected
    })

    test('should cache data by request id', async () => {
        const id = 'fetchAsset'
        const mockData = { id, result: ['eth', 'bsc'] }
        const testMethod = { method: 'fetchAsset', params: [], id }
        client.send(testMethod)
        pushToClientMockData(mockData)

        // @ts-ignore
        await expect(server).toReceiveMessage(testMethod)

        const data = client.getResult<string>(id)
        expect(data).toEqual(['eth', 'bsc'])
        expect(mockNotifyCallback?.mock.calls.length).toBe(1)
        expect(mockNotifyCallback?.mock.calls[0]).toEqual([id])
    })

    test('should merge cache data when server push two times data', async () => {
        const id = 'fetchAsset2'
        const testMethod = { method: 'fetchAsset2', params: [], id }
        client.send(testMethod)
        const mockData1 = { id, result: ['eth', 'bsc'] }
        const mockData2 = { id, result: ['matic'] }
        pushToClientMockData(mockData1)
        pushToClientMockData(mockData2)

        // @ts-ignore
        await expect(server).toReceiveMessage(testMethod)

        const data = client.getResult<string>(id)
        expect(data).toEqual(['eth', 'bsc', 'matic'])
        expect(mockNotifyCallback?.mock.calls.length).toBe(2)
        expect(mockNotifyCallback?.mock.calls[0]).toEqual([id])
        expect(mockNotifyCallback?.mock.calls[1]).toEqual([id])
    })

    test('should cache divide data when server push different response', async () => {
        const requestID1 = 'fetchAsset1'
        const requestID2 = 'fetchAsset2'
        const testMethod1 = { method: requestID1, params: [], id: requestID1 }
        const testMethod2 = { method: requestID1, params: [], id: requestID2 }
        client.send(testMethod1)
        client.send(testMethod2)
        const mockData1 = { id: requestID1, result: ['eth', 'bsc'] }
        const mockData2 = { id: requestID2, result: [1] }
        const mockData3 = { id: requestID1, result: ['matic'] }
        pushToClientMockData(mockData1)
        pushToClientMockData(mockData2)
        pushToClientMockData(mockData3)

        // @ts-ignore
        await expect(server).toReceiveMessage(testMethod1)
        // @ts-ignore
        await expect(server).toReceiveMessage(testMethod2)

        const request1Data = client.getResult<string>(requestID1)
        expect(request1Data).toEqual(['eth', 'bsc', 'matic'])
        const request2Data = client.getResult<string>(requestID2)
        expect(request2Data).toEqual([1])
        expect(mockNotifyCallback?.mock.calls.length).toBe(3)
        expect(mockNotifyCallback?.mock.calls[0]).toEqual([requestID1])
        expect(mockNotifyCallback?.mock.calls[1]).toEqual([requestID2])
        expect(mockNotifyCallback?.mock.calls[2]).toEqual([requestID1])
    })

    xtest('should merge cache data when server push two times data and uniq', async () => {
        const id = 'fetchAsset3'
        const testMethod = { method: 'fetchAsset2', params: [], id }
        client.send(testMethod)
        const mockData1 = { id, result: ['eth', 'bsc'] }
        const mockData2 = { id, result: ['eth', 'matic'] }
        pushToClientMockData(mockData1)
        pushToClientMockData(mockData2)

        // @ts-ignore
        await expect(server).toReceiveMessage(testMethod)

        const data = client.getResult<string>(id)
        expect(data).toEqual(['eth', 'bsc', 'matic'])
    })

    afterEach(() => {
        server?.close()
        client?.socket?.close()
    })
})

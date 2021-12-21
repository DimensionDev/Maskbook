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

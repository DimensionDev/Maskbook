import { describe, test, expect, beforeEach, afterEach, jest, afterAll, beforeAll } from '@jest/globals'
import { SocketPoolItem, ProviderProxy } from '../src/proxy'
import * as mockWS from 'jest-websocket-mock'
import addSeconds from 'date-fns/addSeconds'

const TEST_WS_POINT = 'ws://localhost:1235'

describe('Proxy websocket', () => {
    let server: mockWS.WS
    let client: ProviderProxy
    let mockNotifyCallback: any

    const pushToClientMockData = (data: any, done?: boolean) => {
        server.send(data)
        if (done) {
            server.send({ id: data.id, results: [] })
        }
    }

    beforeEach(async () => {
        mockNotifyCallback = jest.fn()
        server = new mockWS.WS(TEST_WS_POINT, { jsonProtocol: true })
        client = new ProviderProxy(TEST_WS_POINT)
        await client.waitingOpen()
        client.registerMessage()

        await server.connected
    })

    test('should cache data by request id', async () => {
        const id = 'fetchAsset'
        const mockData = { id, results: ['eth', 'bsc'] }
        const testMethod = { id, method: 'fetchAsset', params: [] }
        client.send({ ...testMethod, notify: mockNotifyCallback })
        pushToClientMockData(mockData)

        const data = client.getResult<string>(id)
        expect(data).toEqual(['eth', 'bsc'])
        expect(mockNotifyCallback?.mock.calls.length).toBe(1)
        expect(mockNotifyCallback?.mock.calls[0]).toEqual([{ id, done: false, from: 'remote' }])
    })

    test('should get data from cache when send duplicate request', async () => {
        const id = 'fetchAsset'
        const mockNotifyCallback2 = jest.fn()
        const mockData = { id, results: ['eth', 'bsc'] }
        const testMethod = { id, method: 'fetchAsset', params: [] }

        client.send({ ...testMethod, notify: mockNotifyCallback })
        pushToClientMockData(mockData, true)

        const data = client.getResult<string>(id)
        expect(data).toEqual(['eth', 'bsc'])
        expect(mockNotifyCallback?.mock.calls.length).toBe(2)
        expect(mockNotifyCallback?.mock.calls[0]).toEqual([{ id, done: false, from: 'remote' }])

        client.send({ ...testMethod, notify: mockNotifyCallback2 })
        expect(mockNotifyCallback2?.mock.calls.length).toBe(1)
        expect(mockNotifyCallback2?.mock.calls[0]).toEqual([{ id, done: true, from: 'cache' }])
    })

    test('should merge cache data when server push two times data', async () => {
        const id = 'fetchAsset2'
        const testMethod = { method: 'fetchAsset2', params: [], id }
        client.send({ ...testMethod, notify: mockNotifyCallback })
        const mockData1 = { id, results: ['eth', 'bsc'] }
        const mockData2 = { id, results: ['matic'] }
        pushToClientMockData(mockData1)
        pushToClientMockData(mockData2, true)

        const data = client.getResult<string>(id)
        expect(data).toEqual(['eth', 'bsc', 'matic'])
        expect(mockNotifyCallback?.mock.calls.length).toBe(3)
        expect(mockNotifyCallback?.mock.calls[0]).toEqual([{ id, done: false, from: 'remote' }])
        expect(mockNotifyCallback?.mock.calls[1]).toEqual([{ id, done: false, from: 'remote' }])
        expect(mockNotifyCallback?.mock.calls[2]).toEqual([{ id, done: true, from: 'remote' }])
    })

    test('should cache divide data when server push different response', async () => {
        const requestID1 = 'fetchAsset1'
        const requestID2 = 'fetchAsset2'
        const testMethod1 = { method: requestID1, params: [], id: requestID1 }
        const testMethod2 = { method: requestID1, params: [], id: requestID2 }
        client.send({ ...testMethod1, notify: mockNotifyCallback })
        client.send({ ...testMethod2, notify: mockNotifyCallback })
        const mockData1 = { id: requestID1, results: ['eth', 'bsc'] }
        const mockData2 = { id: requestID2, results: [1] }
        const mockData3 = { id: requestID1, results: ['matic'] }
        pushToClientMockData(mockData1)
        pushToClientMockData(mockData2)
        pushToClientMockData(mockData3)

        const request1Data = client.getResult<string>(requestID1)
        expect(request1Data).toEqual(['eth', 'bsc', 'matic'])
        const request2Data = client.getResult<string>(requestID2)
        expect(request2Data).toEqual([1])
        expect(mockNotifyCallback?.mock.calls.length).toBe(3)
        expect(mockNotifyCallback?.mock.calls[0]).toEqual([{ id: requestID1, done: false, from: 'remote' }])
        expect(mockNotifyCallback?.mock.calls[1]).toEqual([{ id: requestID2, done: false, from: 'remote' }])
        expect(mockNotifyCallback?.mock.calls[2]).toEqual([{ id: requestID1, done: false, from: 'remote' }])
    })

    test('should clear cache ', async () => {
        Array.from({ length: 12 }, (v, i) => i).forEach((x) => {
            const id = `mask.fetchAsset_${x}`
            const mockData = { id, results: ['eth', 'bsc'] }
            const testMethod = { method: 'fetchAsset', params: [], id }
            client.send({ ...testMethod, notify: mockNotifyCallback })
            pushToClientMockData(mockData)

            // @ts-ignore
            const data = client.getResult<string>(id)
            expect(data).toEqual(['eth', 'bsc'])
        })

        const data = client.getResult<string>('mask.fetchAsset_0')
        expect(data).toEqual([])
    })

    afterEach((done) => {
        client?.socket?.close()
        server.server.close()
        mockWS.WS.clean()
        done()
    })
})

describe('Proxy websocket unit', () => {
    let client: ProviderProxy

    beforeAll(async () => {
        client = new ProviderProxy(TEST_WS_POINT)
    })

    test('should not expired when update before 30s', () => {
        const item = {
            updatedAt: addSeconds(new Date(), -20),
        }
        const isExpired = client.isExpired(item as SocketPoolItem)
        expect(isExpired).toBe(false)
    })

    test('should not expired when update within 30s', () => {
        const item = {
            updatedAt: addSeconds(new Date(), -20),
        }
        const isExpired = client.isExpired(item as SocketPoolItem)
        expect(isExpired).toBe(false)
    })
    afterAll((done) => {
        client?.socket?.close()
        done()
    })
})

/// <reference path="./matrix.type.d.ts" />
import sdk, { MatrixClient } from 'matrix-js-sdk'
import { Emitter } from '@servie/events'
import type { MatrixEvent } from 'matrix-js-sdk-type/dts/models/event'
import type Room from 'matrix-js-sdk-type/dts/models/room'
import type EventTimelineSet from 'matrix-js-sdk-type/dts/models/event-timeline-set'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { getLogger } from 'loglevel'
OnlyRunInContext('background', 'Matrix')
export const endpoint = 'https://matrix.vampire.rip'
type MatrixClient = typeof MatrixClient extends { new (...args: any[]): infer U } ? U : never
function any(x: any): any {
    return x
}
type MatrixLoginCred = Record<'user_id' | 'device_id' | 'access_token' | 'home_server', string>
/**
 * Login a Matrix Account
 * @param username
 * @param password
 */
export async function loginMatrixAccount(
    username: string,
    password: string,
    client = createMatrixClient(),
): Promise<[MatrixLoginCred, MatrixClient]> {
    const cred: MatrixLoginCred = await any(client).loginWithPassword(username, password)
    client.startClient({})
    return [cred, client]
}
/**
 * Register a Matrix Account
 */
export function registerMatrixAccount(
    username: string,
    password: string,
    client = createMatrixClient(),
): Promise<[MatrixLoginCred, MatrixClient]> {
    const u = undefined
    return new Promise<[MatrixLoginCred, MatrixClient]>(async (resolve, reject) => {
        try {
            any(client).register(username, password, u, u, u, u, false, (x: any) => {
                const session = x.data.session
                if (!session) return reject(x)
                any(client).register(username, password, session, { type: 'm.login.dummy' }, u, u, false, () =>
                    loginMatrixAccount(username, password, client).then(resolve, reject),
                )
            })
        } catch (e) {
            reject(e)
        }
    })
}
export function createMatrixRoom(client: MatrixClient, visibility: 'public' | 'private', room_alias_name: string) {
    return any(client).createRoom({ room_alias_name, visibility })
}
interface MatrixMessageTypes {
    'maskbook.hello.world': { message: string }
    'maskbook.hello.world2': number
}
interface MatrixMessageEvent<T extends keyof MatrixMessageTypes> {
    meta: {
        matrix: {
            sender: string
            origin_server_ts: number
            event_id: string
            room_id: string
            room_name?: string
        }
    }
    type: T
    payload: MatrixMessageTypes[T]
}
type MatrixMessageListener<T extends keyof MatrixMessageTypes> = (event: MatrixMessageEvent<T>) => void
interface PatchedEvent extends Omit<MatrixEvent, 'event'> {
    event: {
        type: string
        sender: string
        content: object
        origin_server_ts: number
        unsigned: unknown & {
            age: number
        }
        event_id: string
        room_id: string
    }
}
export class MatrixMessage {
    public userID: null | string = null
    constructor(public matrixClient: MatrixClient) {
        matrixClient
            .startClient({})
            .then(() => matrixClient.getUserId())
            .then((id) => (this.userID = id))

        matrixClient.on(
            'Room.timeline',
            <T extends keyof MatrixMessageTypes>(
                event: PatchedEvent,
                _room: Room,
                _eventTimelineSet: EventTimelineSet,
                _room2: Room,
            ) => {
                const e = event.event
                const data: MatrixMessageEvent<T> = {
                    type: e.type as T,
                    meta: {
                        matrix: {
                            room_id: e.room_id,
                            room_name: this.reverseCache.get(e.room_id),
                            event_id: e.event_id,
                            origin_server_ts: e.origin_server_ts,
                            sender: e.sender,
                        },
                    },
                    // TODO: validate it with JSON schema
                    payload: e.content as MatrixMessageTypes[T],
                }
                // @ts-ignore
                this.mitt.emit(e.type, data)
            },
        )
    }
    async emit<T extends keyof MatrixMessageTypes>(
        room: { type: 'alias'; alias: string } | { type: 'id'; id: string },
        eventName: T,
        data: MatrixMessageTypes[T],
    ) {
        let id = ''
        if (room.type === 'alias') id = await this.lookupRoomAlias(room.alias)
        else if (room.type === 'id') id = room.id
        await this.matrixClient.sendEvent(id, eventName, data, undefined!, undefined!)
    }
    on<T extends keyof MatrixMessageTypes>(
        event: keyof MatrixMessageTypes,
        f: MatrixMessageListener<T>,
        options?: { ignoreMyself?: boolean },
    ) {
        const _f: typeof f = (event) => {
            if (event.meta.matrix.sender === this.userID && options?.ignoreMyself) return
            f(event)
        }
        // @ts-ignore
        this.mitt.on(event, _f)
        // @ts-ignore
        return () => this.mitt.off(event, _f)
    }
    private mitt = new Emitter<MatrixMessageTypes>()
    private cache = new Map<string, string>()
    private reverseCache = new Map<string, string>()
    private async lookupRoomAlias(alias: string): Promise<string> {
        if (this.cache.has(alias)) return this.cache.get(alias)!
        // @ts-ignore
        const x: { room_id: string; servers: string[] } = await this.matrixClient.getRoomIdForAlias(alias)
        this.cache.set(alias, x.room_id)
        this.reverseCache.set(x.room_id, alias)
        return x.room_id
    }
}
export function createMatrixClient() {
    const log = getLogger('matrix')
    log.setLevel('silent')
    return sdk.createClient({ baseUrl: endpoint, logger: log })
}

/// <reference path="./matrix.type.d.ts" />
import sdk from 'matrix-js-sdk'
import { MatrixClient, MemoryStorageProvider } from 'matrix-bot-sdk'
import mitt from 'mitt'

const endpoint = 'https://matrix.vampire.rip'
const storage = new MemoryStorageProvider()
const client = sdk.createClient({ baseUrl: endpoint })
type MatrixLoginCred = Record<'user_id' | 'device_id' | 'access_token' | 'home_server', string>

/**
 * Login a Matrix Account
 * @param username
 * @param password
 */
export async function loginMatrixAccount(username: string, password: string): Promise<[MatrixLoginCred, MatrixClient]> {
    const cred: MatrixLoginCred = await (client as any).loginWithPassword(username, password)
    const bot = new MatrixClient(endpoint, cred.access_token, storage)

    bot.start()
    return [cred, bot]
}
/**
 * Register a Matrix Account
 */
export function registerMatrixAccount(username: string, password: string): Promise<[MatrixLoginCred, MatrixClient]> {
    const u = undefined
    return new Promise<[MatrixLoginCred, MatrixClient]>(async (resolve, reject) => {
        try {
            ;(client as any).register(username, password, u, u, u, u, false, (x: any) => {
                const session = x.data.session
                if (!session) return reject(x)
                ;(client as any).register(username, password, session, { type: 'm.login.dummy' }, u, u, false, () =>
                    loginMatrixAccount(username, password).then(resolve, reject),
                )
            })
        } catch (e) {
            reject(e)
        }
    })
}
/**
 *
 * @param bot
 * @param props See https://matrix.org/docs/spec/client_server/r0.6.0#post-matrix-client-r0-createroom
 */
function createMatrixRoom(
    bot: MatrixClient,
    props: {
        name: string
        visibility: 'public' | 'private'
        preset: 'public_chat' | 'private_chat' | 'trusted_private_chat'
        // initial_state: []
        room_alias_name: string
        topic: string
        creation_content: { 'm.federate': boolean }
    },
) {
    return bot.createRoom(props)
}
const username = ['maskbook-test222', 'passwordpasswordpassword'] as const

setInterval(() => {}, 2000)
interface MatrixMessageTypes {
    'maskbook.hello.world': { message: string }
    'maskbook.hello.world2': number
}
type MatrixMessageEvent<T extends keyof MatrixMessageTypes> = {
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
class MatrixMessage {
    public userID: null | string = null
    constructor(public matrixClient: MatrixClient) {
        matrixClient
            .start()
            .then(() => matrixClient.getUserId())
            .then(id => (this.userID = id))
        matrixClient.on(
            'room.event',
            <T extends keyof MatrixMessageTypes>(
                roomID: string,
                event: {
                    type: string
                    sender: string
                    content: object
                    origin_server_ts: number
                    unsigned: unknown & { age: number }
                    event_id: string
                },
            ) => {
                const data: MatrixMessageEvent<T> = {
                    type: event.type as T,
                    meta: {
                        matrix: {
                            room_id: roomID,
                            room_name: this.reverseCache.get(roomID),
                            event_id: event.event_id,
                            origin_server_ts: event.origin_server_ts,
                            sender: event.sender,
                        },
                    },
                    // TODO: validate it with JSON schema
                    payload: event.content as MatrixMessageTypes[T],
                }
                this.mitt.emit(event.type, data)
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
        await this.matrixClient.sendEvent(id, eventName, data)
    }
    on<T extends keyof MatrixMessageTypes>(
        event: keyof MatrixMessageTypes,
        f: MatrixMessageListener<T>,
        options: { ignoreMyself: boolean },
    ) {
        const _f: typeof f = event => {
            if (event.meta.matrix.sender === this.userID && options.ignoreMyself) return
            f(event)
        }
        this.mitt.on(event, _f)
        return () => this.mitt.off(event, _f)
    }
    private mitt = mitt()
    private cache = new Map<string, string>()
    private reverseCache = new Map<string, string>()
    private async lookupRoomAlias(alias: string): Promise<string> {
        if (this.cache.has(alias)) return this.cache.get(alias)!
        const x = await this.matrixClient.lookupRoomAlias(alias)
        this.cache.set(alias, x.roomId)
        this.reverseCache.set(x.roomId, alias)
        return x.roomId
    }
}

loginMatrixAccount(...username)
    .catch(() => registerMatrixAccount(...username))
    .then(([cred, client]) => {
        console.warn(cred)
        const m = new MatrixMessage(client)
        Object.assign(globalThis, { temp1: m })
        m.on('maskbook.hello.world', console.warn, { ignoreMyself: true })
        m.emit({ type: 'alias', alias: '#hchch:matrix.vampire.rip' }, 'maskbook.hello.world', {
            message: Math.random().toString(),
        })
    })

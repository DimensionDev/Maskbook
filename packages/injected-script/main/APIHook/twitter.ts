import { dispatchMockEvent } from '../EventListenerPatch/capture.js'
import { $, $Blessed, takeThis, Getter } from '../../shared/intrinsic.js'
import { cloneIntoContent, isTwitter, looksNative } from '../utils.js'
import { createRequest, sendEvent } from '../../shared/rpc.js'

const raw = $.XMLHttpRequestDesc
const send = takeThis(raw.send.value!)<XMLHttpRequest>
const response_getter = takeThis<Getter<XMLHttpRequest['response']>>(raw.response.get!)<XMLHttpRequest>
const responseText_getter = takeThis<Getter<XMLHttpRequest['responseText']>>(raw.responseText.get!)<XMLHttpRequest>
const readyState_getter = takeThis<Getter<XMLHttpRequest['readyState']>>(raw.readyState.get!)<XMLHttpRequest>
const onreadystatechange_getter = takeThis<Getter<XMLHttpRequest['onreadystatechange']>>(
    raw.onreadystatechange.get!,
)<XMLHttpRequest>

const cache = $Blessed.Map<string, string>()
const pending = $Blessed.Map<string, Promise<void>>()

const overwrite = cloneIntoContent<Partial<Record<keyof XMLHttpRequest, PropertyDescriptor>>>({
    send: {
        configurable: true,
        enumerable: true,
        value: looksNative(function (this: XMLHttpRequest, ...args: any[]) {
            send(this, ...args)

            const f = () => {
                if (readyState_getter(this) === raw.DONE.value!) {
                    const text = responseText_getter(this)
                    if (pending.has(text) || !canModify(text)) return
                    pending.set(
                        text,
                        $Blessed
                            .AsyncFunction(async () => {
                                const result = await createRequest<string>((id) =>
                                    sendEvent('requestDecrypt', text, id),
                                )
                                cache.set(text, result)
                                dispatchMockEvent(
                                    this,
                                    new Event('readystatechange', { bubbles: false, cancelable: false }),
                                    () => onreadystatechange_getter(this),
                                )
                            })()
                            .finally(() => pending.delete(text)),
                    )
                }
            }
            $.EventTargetAddEventListener(this, 'readystatechange', f)
        }, raw.send.value!),
    },
    readyState: {
        configurable: true,
        enumerable: true,
        get: looksNative(function (this: XMLHttpRequest) {
            const val = readyState_getter(this)
            if (val !== raw.DONE.value!) return val
            const text = responseText_getter(this)
            if (pending.has(text)) return raw.LOADING.value!
            return val
        }, raw.readyState.get!),
    },
    response: {
        configurable: true,
        enumerable: true,
        get: looksNative(function (this: XMLHttpRequest) {
            const text = responseText_getter(this)
            if (cache.has(text)) return cache.get(text)!
            return response_getter(this)
            // for (const key in jsonResponse.globalObjects.tweets) {
            //     const obj = jsonResponse.globalObjects.tweets[key]
            //     if (obj.full_text.length > 5) {
            //         obj.full_text = 'This Tweet is replaced by Mask'
            //         obj.display_text_range = [0, obj.full_text.length]
            //     }
            // }
            // return JSON.stringify(jsonResponse)
        }, raw.response.get!),
    },
    responseText: {
        configurable: true,
        enumerable: true,
        get: looksNative(function (this: XMLHttpRequest) {
            const text = responseText_getter(this)
            if (cache.has(text)) return cache.get(text)!
            return text
        }, raw.responseText.get!),
    },
})
interface Response {
    globalObjects: {
        tweets: Record<
            string,
            {
                full_text: string
                display_text_range: [number, number]
                entities: {
                    user_mentions: {
                        screen_name: string
                        name: string
                        id_str: string
                        indices: [number, number]
                    }[]
                    urls: {
                        url: string
                        expanded_url: string
                        display_url: string
                        indices: [number, number]
                    }[]
                    media: {
                        id_str: string
                        indices: [number, number]
                        media_url: string
                        media_url_https: string
                        url: string
                        display_url: string
                        expanded_url: string
                        type: 'photo'
                        original_info: {
                            width: number
                            height: number
                        }
                    }[]
                }
                extended_entities: {
                    media: {
                        id_str: string
                        indices: [number, number]
                        media_url: string
                        media_url_https: string
                        url: string
                        display_url: string
                        expanded_url: string
                        type: 'photo'
                        original_info: {
                            width: number
                            height: number
                        }
                    }[]
                }
            }
        >
    }
}
function isResponse(o: unknown): o is Response {
    if (typeof o !== 'object' || o === null) return false
    if (!$.HasOwn(o, 'globalObjects')) return false
    const { globalObjects } = o as any

    if (typeof globalObjects !== 'object' || o === null) return false
    if (!$.HasOwn(globalObjects, 'tweets')) return false

    // TODO: rest check
    return true
}

function canModify(text: string) {
    if (!$.StringInclude(text, 'globalObjects')) return false
    try {
        const obj = $.JSON.parse(text)
        return isResponse(obj)
    } catch {
        return false
    }
}

if (isTwitter()) Object.defineProperties(XMLHttpRequest.prototype, overwrite)

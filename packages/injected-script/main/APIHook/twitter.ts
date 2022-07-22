import { dispatchMockEvent } from '../EventListenerPatch/capture.js'
import { $, $Blessed, takeThis, Getter, $Content } from '../../shared/intrinsic.js'
import { cloneIntoContent, isTwitter, looksNative } from '../utils.js'
import { createRequest, sendEvent } from '../../shared/rpc.js'

const raw = $.XMLHttpRequestDesc
const open = takeThis(raw.open.value!)<XMLHttpRequest>
const responseType_getter = takeThis<Getter<XMLHttpRequest['responseType']>>(raw.responseType.get!)<XMLHttpRequest>
const response_getter = takeThis<Getter<XMLHttpRequest['response']>>(raw.response.get!)<XMLHttpRequest>
const responseText_getter = takeThis<Getter<XMLHttpRequest['responseText']>>(raw.responseText.get!)<XMLHttpRequest>
const readyState_getter = takeThis<Getter<XMLHttpRequest['readyState']>>(raw.readyState.get!)<XMLHttpRequest>
const onreadystatechange_getter = takeThis<Getter<XMLHttpRequest['onreadystatechange']>>(
    raw.onreadystatechange.get!,
)<XMLHttpRequest>

const cache = $Blessed.Map<string, string>()
const pending = $Blessed.Map<string, Promise<void>>()
const onreadystatechange = $Blessed.WeakMap<XMLHttpRequest, Function>()

const overwrite = cloneIntoContent<Partial<Record<keyof XMLHttpRequest, PropertyDescriptor>>>({
    onreadystatechange: {
        configurable: true,
        enumerable: true,
        get(this: XMLHttpRequest) {
            // brand check
            readyState_getter(this)
            return onreadystatechange.get(this)
        },
    },
    open: {
        configurable: true,
        enumerable: true,
        value: looksNative(function (
            this: XMLHttpRequest,
            ...args: [
                method: string,
                url: string | URL,
                async: boolean,
                username?: string | null | undefined,
                password?: string | null | undefined,
            ]
        ) {
            open(this, ...args)

            const f = () => {
                if (!isTextReply(this)) return
                const text = responseText_getter(this)
                if (pending.has(text) || !canModify(text)) return

                // we checked that in canModify
                const data: Response = $.JSON.parse(text)
                const extractedText = { __proto__: null } as any as Record<string, string>
                let hasItem = false
                for (const key in data.globalObjects.tweets) {
                    if (!$.HasOwn(data.globalObjects.tweets, key)) continue
                    const item = data.globalObjects.tweets[key]
                    extractedText[key] =
                        item.full_text +
                        $.ArrayJoin(
                            $.ArrayMap(
                                item.entities.urls,
                                (x: Response['globalObjects']['tweets'][number]['entities']['urls'][number]) =>
                                    x.expanded_url,
                            ),
                            ' ',
                        )
                    hasItem = true
                }
                if (!hasItem) return
                const promise = $Blessed.AsyncFunction(async () => {
                    $Content.setTimeout(() => {
                        pending.delete(text)
                        dispatchMockEvent(
                            this,
                            new Event('readystatechange', { bubbles: false, cancelable: false }),
                            () => onreadystatechange_getter(this),
                        )
                    }, 200)
                    const result = await createRequest<Record<string, string>>((id) =>
                        sendEvent('requestDecrypt', extractedText, id),
                    )
                    for (const key in result) {
                        if (!$.HasOwn(result, key)) continue
                        const text = result[key]
                        const tweet = data.globalObjects.tweets[key]
                        if (text === tweet.full_text) continue
                        const debugText = 'ここ見て！！！'
                        tweet.full_text = text + debugText
                        tweet.display_text_range = [0, text.length + debugText.length]
                        tweet.entities.user_mentions = []
                        tweet.entities.urls = []
                        // @ts-ignore
                        tweet.entities.hashtags = []
                    }
                    cache.set(text, JSON.stringify(data))
                    pending.delete(text)
                    dispatchMockEvent(this, new Event('readystatechange', { bubbles: false, cancelable: false }), () =>
                        onreadystatechange_getter(this),
                    )
                })()
                pending.set(text, promise)
            }
            $.EventTargetAddEventListener(this, 'readystatechange', f)
        },
        raw.send.value!),
    },
    readyState: {
        configurable: true,
        enumerable: true,
        get: looksNative(function (this: XMLHttpRequest) {
            const val = readyState_getter(this)
            if (!isTextReply(this)) return val
            const text = responseText_getter(this)
            if (pending.has(text)) return raw.LOADING.value!
            return val
        }, raw.readyState.get!),
    },
    response: {
        configurable: true,
        enumerable: true,
        get: looksNative(function (this: XMLHttpRequest) {
            if (!isTextReply(this)) return response_getter(this)
            const text = responseText_getter(this)
            if (cache.has(text)) return cache.get(text)!
            return response_getter(this)
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

function isTextReply(data: XMLHttpRequest) {
    if (readyState_getter(data) !== raw.DONE.value!) return false
    const type = responseType_getter(data)
    return type === 'text' || type === ''
}
function isResponse(o: unknown): o is Response {
    if (typeof o !== 'object' || o === null) return false
    if (!$.HasOwn(o, 'globalObjects')) return false
    const { globalObjects } = o as any

    if (typeof globalObjects !== 'object' || o === null) return false
    if (!$.HasOwn(globalObjects, 'tweets')) return false

    for (const key in globalObjects.tweets) {
        if (!$.HasOwn(globalObjects.tweets, key)) continue
        const item = globalObjects.tweets[key]
        if (typeof item !== 'object' || item === null) return false
        if (!$.HasOwn(item, 'full_text')) return false
        if (typeof item.full_text !== 'string') return false
        if (!$.HasOwn(item, 'display_text_range')) return false
        if (!$.isArray(item.display_text_range)) return false
        if (item.display_text_range.length !== 2) return false
    }
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

import { $, $Blessed, $Content, isDocument, isNode, isShadowRoot, isWindow } from '../intrinsic.js'
import { defineFunctionOnContentObject } from '../utils.js'
import { RemoveListener, type EventListenerDescriptor, CapturedListeners, CapturingEvents } from './EventTarget.js'

const EVENT_PHASE_NONE = 0
const EVENT_PHASE_CAPTURING_PHASE = 1
const EVENT_PHASE_AT_TARGET = 2
const EVENT_PHASE_BUBBLING_PHASE = 3

// https://dom.spec.whatwg.org/#retarget
function ReTarget(A: EventTarget | null, B: unknown): EventTarget | null {
    return A
    // while (true) {
    //     if (!isNode(A)) return A
    //     const A_root = $.Node_getRootNode(A)
    //     if (A_root && !isShadowRoot(A_root)) return A
    //     // TODO: B is a node and A's root is a shadow-including inclusive ancestor of B
    //     A = $.ShadowRoot_host(A_root)
    // }
}
function GetWrappedJSObject<T extends object>(obj: T): T {
    if ($.isFirefox) return (obj as any).wrappedJSObject || obj
    return obj
}
function UnsafeMainWorldObject() {
    return GetWrappedJSObject(new $Content.Object())
}
export type ActivationBehavior = Map<EventTarget, (event: __Event) => void>

export class __Event extends (UnsafeMainWorldObject as any) implements Event {
    // https://dom.spec.whatwg.org/#dom-eventtarget-dispatchevent
    static EventTarget_DispatchEvent(
        dispatchEvent: typeof EventTarget.prototype.dispatchEvent,
        eventTarget: EventTarget,
        args: Parameters<EventTarget['dispatchEvent']>,
    ) {
        const event = args[0]
        if (!(#dispatch in event)) return $.apply(dispatchEvent, eventTarget, args)

        // (Skip: we don't override document.createEvent) or if its initialized flag is not set
        if (event.#dispatch) {
            // TODO: stack
            throw new $Content.DOMException(
                $.isFirefox
                    ? 'An attempt was made to use an object that is not, or is no longer, usable'
                    : "Failed to execute 'dispatchEvent' on 'EventTarget': The event is already being dispatched.",
                'InvalidStateError',
            )
        }
        event.#isTrusted = false
        return DispatchEvent(eventTarget, event)
    }
    // https://dom.spec.whatwg.org/#concept-event-dispatch
    static DispatchEvent(
        target: EventTarget | null,
        event: __Event,
        activationBehavior?: ActivationBehavior,
        legacyTargetOverride?: boolean,
        legacyOutputDidListenersThrowFlag?: BooleanFlag,
    ) {
        if (!target) return
        // Note: in firefox, "event" is "Opaque". Displayed as an empty object.
        const type = event.#type
        if (!CapturingEvents.has(type)) {
            $.ConsoleError("[@masknet/injected-script] Trying to send event didn't captured.")
            return true
        }

        let clearTargets = false

        event.#dispatch = true
        // legacy target override flag is only used by HTML and only when target is a Window object.
        const targetOverride = !legacyTargetOverride ? target : $.Window_document(target as typeof window)
        let activationTarget = null
        let relatedTarget: EventTarget | null = ReTarget(event.#relatedTarget, target)
        if (target !== relatedTarget || target === event.#relatedTarget) {
            const touchTargets: PotentialEventTarget[] = $Blessed.Array_from()
            for (const touchTarget of event.#touchTargetList) {
                touchTargets.push(ReTarget(touchTarget, target))
            }
            AppendEventPath(event, target, targetOverride, relatedTarget, touchTargets, false)
            // TODO(MouseEvent): Let isActivationEvent be true, if event is a MouseEvent object and event's type attribute is "click"; otherwise false.
            const isActivationEvent = false
            if (isActivationEvent) {
                // TODO(MouseEvent): target has activation behavior, then set activationTarget to target.
            }
            // TODO: Let slottable be target, if target is a slottable and is assigned, and null otherwise.
            let slotInClosedTree = false
            let parent = EventTarget_GetParent(target, event)
            while (parent !== null) {
                // TODO: If slottable is non-null: ...
                // TODO: If parent is a slottable and is assigned, then set slottable to parent.
                relatedTarget = ReTarget(event.#relatedTarget, parent)
                const touchTargets: PotentialEventTarget[] = $Blessed.Array_from()
                for (const touchTarget of event.#touchTargetList) {
                    touchTargets.push(ReTarget(touchTarget, parent))
                }
                // If parent is a Window object, or parent is a node
                // TODO: and target's root is a shadow-including inclusive ancestor of parent, then:
                if (isNode(parent) || isWindow(parent)) {
                    if (
                        isActivationEvent &&
                        event.#bubbles &&
                        activationTarget === null &&
                        activationBehavior?.has(parent)
                    ) {
                        activationTarget = parent
                    }
                    AppendEventPath(event, parent, null, relatedTarget, touchTargets, slotInClosedTree)
                } else if (parent === relatedTarget) {
                    parent = null
                } else {
                    target = parent
                    if (isActivationEvent && activationTarget === null && activationBehavior?.has(target)) {
                        activationTarget = target
                    }
                    AppendEventPath(event, parent, target, relatedTarget, touchTargets, slotInClosedTree)
                }
                if (parent !== null) parent = EventTarget_GetParent(parent, event)
                slotInClosedTree = false
            }
            let clearTargetsStruct
            for (const item of event.#path) {
                if (item.shadowAdjustedTarget !== null) clearTargetsStruct = item
            }
            if (clearTargetsStruct) {
                const { shadowAdjustedTarget, relatedTarget, touchTargetList } = clearTargetsStruct
                if (isNode(shadowAdjustedTarget) && isShadowRoot($.Node_getRootNode(shadowAdjustedTarget))) {
                    clearTargets = true
                } else if (isNode(relatedTarget) && isShadowRoot($.Node_getRootNode(relatedTarget))) {
                    clearTargets = true
                } else if (touchTargetList.some((t) => isNode(t) && isShadowRoot($.Node_getRootNode(t)))) {
                    clearTargets = true
                }
            }
            // Legacy TODO: If activationTarget is non-null ...
            for (let i = event.#path.length - 1; i >= 0; i -= 1) {
                const struct = event.#path[i]
                if (struct.shadowAdjustedTarget !== null) event.#eventPhase = EVENT_PHASE_AT_TARGET
                else event.#eventPhase = EVENT_PHASE_CAPTURING_PHASE
                Invoke(struct, event, 'capturing', legacyOutputDidListenersThrowFlag)
            }
            for (const struct of event.#path) {
                if (struct.shadowAdjustedTarget !== null) event.#eventPhase = EVENT_PHASE_AT_TARGET
                else {
                    if (!event.#bubbles) continue
                    event.#eventPhase = EVENT_PHASE_BUBBLING_PHASE
                }
                Invoke(struct, event, 'bubbling', legacyOutputDidListenersThrowFlag)
            }
        }

        event.#eventPhase = EVENT_PHASE_NONE
        event.#currentTarget = null
        event.#path = $Blessed.Array_from()
        event.#dispatch = false
        event.#stopPropagation = false
        event.#stopImmediatePropagation = false
        if (clearTargets) {
            event.#target = event.#relatedTarget = null
            event.#touchTargetList = $Blessed.Array_from()
        }
        if (activationTarget !== null) {
            if (!event.#canceled) {
                activationBehavior?.get(activationTarget)?.(event)
            } else {
                // Legacy TODO: if activationTarget has legacy-canceled-activation behavior, ...
            }
        }
        return !event.#canceled
    }
    // https://dom.spec.whatwg.org/#concept-event-listener-invoke
    static Invoke(
        struct: PathRecord,
        event: __Event,
        phase: 'capturing' | 'bubbling',
        legacyOutputDidListenersThrowFlag: BooleanFlag | undefined,
    ) {
        // Set event's target to the shadow-adjusted target of the last struct in event's path, that is either struct or preceding struct, whose shadow-adjusted target is non-null.
        SetTarget: {
            const structIndex = event.#path.indexOf(struct)
            if (structIndex === -1) {
                $.ConsoleError('[@masknet/injected-script] Assert failed: struct must appears in the event.#path.')
                event.#target = struct.invocationTarget
                break SetTarget
            }
            for (let i = structIndex; i >= 0; i -= 1) {
                const target = event.#path[i].shadowAdjustedTarget
                if (target !== null) {
                    event.#target = target
                    break SetTarget
                }
            }
            event.#target = null
        }
        event.#relatedTarget = struct.relatedTarget
        event.#touchTargetList = struct.touchTargetList
        if (event.#stopPropagation) return
        event.#currentTarget = struct.invocationTarget
        const listeners = $Blessed.Set(CapturedListeners.get(struct.invocationTarget))
        const invocationTargetInShadowTree = struct.invocationTargetInShadowTree
        const found = InnerInvoke(
            event,
            listeners,
            phase,
            invocationTargetInShadowTree,
            legacyOutputDidListenersThrowFlag,
        )
        if (!found && event.#isTrusted) {
            const originalEventType = event.#type
            if (originalEventType in LegacyEventRemappingTable) {
                event.#type = LegacyEventRemappingTable[originalEventType as keyof typeof LegacyEventRemappingTable]!
            } else return

            InnerInvoke(event, listeners, phase, invocationTargetInShadowTree, legacyOutputDidListenersThrowFlag)
            event.#type = originalEventType
        }
    }
    // https://dom.spec.whatwg.org/#concept-event-listener-inner-invoke
    static InnerInvoke(
        event: __Event,
        listeners: Set<EventListenerDescriptor>,
        phase: 'capturing' | 'bubbling',
        invocationTargetInShadowTree: boolean,
        legacyOutputDidListenersThrowFlag: BooleanFlag | undefined,
    ): boolean {
        let found = false
        for (const listener of listeners) {
            if (listener.removed) continue
            if (listener.type !== event.#type) continue
            found = true
            if (phase === 'capturing' && listener.capture === false) continue
            if (phase === 'bubbling' && listener.capture === true) continue
            if (listener.once === true) {
                $Content.removeListener(event.#currentTarget!, listener.type, listener.callback!, listener.capture)
                const list = CapturedListeners.get(event.#currentTarget!)
                list && RemoveListener(listener, list)
            }
            // Legacy TODO: Let global be ...
            // Legacy TODO: Let currentEvent be ...
            // Legacy TODO: If global is a Window object, then: ...
            if (listener.passive === true) event.#inPassiveListener = true
            let exception: unknown
            let hasException: unknown
            // https://webidl.spec.whatwg.org/#call-a-user-objects-operation
            Call_A_User_Objects_Operation: {
                let __content__X: EventListener
                let __content__thisArg: object = event.#currentTarget!
                if (typeof listener.callback === 'function') __content__X = GetWrappedJSObject(listener.callback)
                else {
                    try {
                        const __content__callbackObject = GetWrappedJSObject(listener.callback!)
                        __content__X = __content__callbackObject?.handleEvent!
                        // TODO: message, stack
                        if (typeof __content__X !== 'function')
                            throw new $Content.TypeError('handleEvent is not a function')
                        __content__thisArg = __content__callbackObject
                    } catch (error) {
                        exception = error
                        hasException = true
                        break Call_A_User_Objects_Operation
                    }
                }
                try {
                    $.apply(__content__X, __content__thisArg, [event])
                } catch (error) {
                    exception = error
                    hasException = true
                }
            }
            if (hasException) {
                $Content.reportError($Content.window, exception)
                if (legacyOutputDidListenersThrowFlag) legacyOutputDidListenersThrowFlag.value = true
            }
            event.#inPassiveListener = false
            // Legacy TODO: If global is a Window object, ...
            if (event.#stopImmediatePropagation) return found
        }

        return found
    }
    // https://dom.spec.whatwg.org/#concept-event-path-append
    static AppendEventPath(
        event: __Event,
        invocationTarget: EventTarget,
        shadowAdjustedTarget: EventTarget | null,
        relatedTarget: PotentialEventTarget,
        touchTargets: PotentialEventTarget[],
        slotInClosedTree: boolean,
    ) {
        let invocationTargetInShadowTree = false
        if (isNode(invocationTarget) && isShadowRoot($.Node_getRootNode(invocationTarget)))
            invocationTargetInShadowTree = true
        let rootOfClosedTree = false
        if (isShadowRoot(invocationTarget) && $.ShadowRoot_mode(invocationTarget) === 'closed') rootOfClosedTree = true
        event.#path.push({
            __proto__: null,
            invocationTarget,
            invocationTargetInShadowTree,
            shadowAdjustedTarget,
            relatedTarget,
            touchTargetList: touchTargets,
            rootOfClosedTree,
            slotInClosedTree,
        })
    }
    static EventTarget_GetParent(target: EventTarget, event: __Event) {
        // Document:
        // A document's get the parent algorithm, given an event, returns null if event's type attribute value is "load" or document does not have a browsing context; otherwise the document's relevant global object.
        if (isDocument(target)) {
            if (event.#type === 'load') return null
            return $.Document_defaultView(target)
        }

        // ShadowRoot:
        // A shadow root's get the parent algorithm, given an event, returns null if event's composed flag is unset and shadow root is the root of event's path's first struct's invocation target; otherwise shadow root's host.
        if (isShadowRoot(target)) {
            if (!event.#composed && target === event.#path[0].invocationTarget) return null
            return $.ShadowRoot_host(target)
        }

        // Node:
        // A node's get the parent algorithm, given an event, returns the node's assigned slot, if node is assigned; otherwise node's parent.
        if (isNode(target)) return $.Node_parentNode(target) // is that correct?

        return null
    }
    declare isTrusted: boolean
    constructor(type: string, eventInitDict?: EventInit | undefined) {
        super()
        this.#type = type
        this.#bubbles = eventInitDict?.bubbles || false
        this.#cancelable = eventInitDict?.cancelable || false
        $.setPrototypeOf(this, $.unwrapXRayVision($Content.EventPrototype))
        $.defineProperties(this, {
            isTrusted: {
                enumerable: true,
                configurable: false,
                get: $.cloneIntoContent(function isTrusted(this: __Event) {
                    return GetWrappedJSObject(this).#isTrusted
                }),
                set: undefined,
            },
            NONE: { value: 0, writable: false, enumerable: true, configurable: false },
            CAPTURING_PHASE: { value: 1, writable: false, enumerable: true, configurable: false },
            AT_TARGET: { value: 2, writable: false, enumerable: true, configurable: false },
            BUBBLING_PHASE: { value: 3, writable: false, enumerable: true, configurable: false },
        })
    }
    declare NONE: 0
    declare CAPTURING_PHASE: 1
    declare AT_TARGET: 2
    declare BUBBLING_PHASE: 3
    #isTrusted = true
    #type: string
    get type(): string {
        const event = GetWrappedJSObject(this)
        if (!(#type in event)) return $.apply($Content.EventPrototypeDesc.type.get!, this, [])
        return event.#type
    }
    #bubbles: boolean
    get bubbles(): boolean {
        const event = GetWrappedJSObject(this)
        if (!(#bubbles in event)) return $.apply($Content.EventPrototypeDesc.bubbles.get!, this, [])
        return event.#bubbles
    }
    #target: EventTarget | null = null
    get target(): EventTarget | null {
        const event = GetWrappedJSObject(this)
        if (!(#target in event)) return $.apply($Content.EventPrototypeDesc.target.get!, this, [])
        if (event.#target === null) return null
        return $.unwrapXRayVision(event.#target)
    }
    get srcElement() {
        const event = GetWrappedJSObject(this)
        if (!(#target in event)) return $.apply($Content.EventPrototypeDesc.srcElement.get!, this, [])
        if (event.#target === null) return null
        return $.unwrapXRayVision(event.#target)
    }
    #currentTarget: EventTarget | null = null
    get currentTarget() {
        const event = GetWrappedJSObject(this)
        if (!(#currentTarget in event)) return $.apply($Content.EventPrototypeDesc.currentTarget.get!, this, [])
        if (event.#currentTarget === null) return null
        return $.unwrapXRayVision(event.#currentTarget)
    }
    #timeStamp = $.Performance_now()
    get timeStamp(): number {
        const event = GetWrappedJSObject(this)
        if (!(#timeStamp in event)) return $.apply($Content.EventPrototypeDesc.timeStamp.get!, this, [])
        return event.#timeStamp
    }
    #relatedTarget: EventTarget | null = null
    #touchTargetList: PotentialEventTarget[] = $Blessed.Array_from()
    #path: PathRecord[] = $Blessed.Array_from()
    #eventPhase = EVENT_PHASE_NONE
    get eventPhase(): number {
        const event = GetWrappedJSObject(this)
        if (!(#eventPhase in event)) return $.apply($Content.EventPrototypeDesc.eventPhase.get!, this, [])
        return event.#eventPhase
    }
    #stopPropagation = false
    #stopImmediatePropagation = false
    #canceled = false
    #cancelable = false
    #inPassiveListener = false
    #composed = false
    #dispatch = false
    // https://dom.spec.whatwg.org/#dom-event-composedpath
    composedPath(): EventTarget[] {
        const event = GetWrappedJSObject(this)
        if (!(#path in event)) return $.apply($Content.EventPrototypeDesc.composedPath.value!, this, arguments)

        const path = event.#path
        const currentTarget = event.#currentTarget
        const __content__composedPath__: EventTarget[] = $Content.Array()
        if (path.length === 0) return __content__composedPath__
        $.ArrayPush(__content__composedPath__, currentTarget ? $.unwrapXRayVision(currentTarget) : null)
        let currentTargetIndex = 0
        let currentTargetHiddenSubtreeLevel = 0
        let index = path.length - 1
        while (index >= 0) {
            if (path[index].rootOfClosedTree) currentTargetHiddenSubtreeLevel += 1
            if (path[index].invocationTarget === currentTarget) {
                currentTargetIndex = index
                break
            }
            if (path[index].slotInClosedTree) currentTargetHiddenSubtreeLevel -= 1
            index -= 1
        }
        let currentHiddenLevel = currentTargetHiddenSubtreeLevel
        let maxHiddenLevel = currentTargetHiddenSubtreeLevel
        index = currentTargetIndex - 1
        while (index >= 0) {
            if (path[index].rootOfClosedTree) currentHiddenLevel += 1
            if (currentHiddenLevel <= maxHiddenLevel)
                $.ArrayUnshift(__content__composedPath__, $.unwrapXRayVision(path[index].invocationTarget))
            if (path[index].slotInClosedTree) {
                currentHiddenLevel -= 1
                if (currentHiddenLevel < maxHiddenLevel) maxHiddenLevel = currentHiddenLevel
            }
            index -= 1
        }
        currentHiddenLevel = currentTargetHiddenSubtreeLevel
        maxHiddenLevel = currentTargetHiddenSubtreeLevel
        index = currentTargetIndex + 1
        while (index < path.length) {
            if (path[index].slotInClosedTree) currentHiddenLevel += 1
            if (currentHiddenLevel <= maxHiddenLevel)
                $.ArrayPush(__content__composedPath__, $.unwrapXRayVision(path[index].invocationTarget))
            if (path[index].rootOfClosedTree) {
                currentHiddenLevel -= 1
                if (currentHiddenLevel < maxHiddenLevel) maxHiddenLevel = currentHiddenLevel
            }
            index += 1
        }
        return __content__composedPath__
    }
    stopPropagation() {
        const event = GetWrappedJSObject(this)
        if (!(#stopPropagation in event))
            return $.apply($Content.EventPrototypeDesc.stopPropagation.value!, this, arguments)
        event.#stopPropagation = true
    }
    get cancelBubble(): boolean {
        const event = GetWrappedJSObject(this)
        if (#stopPropagation in event) return event.#stopPropagation
        return $.apply($Content.EventPrototypeDesc.cancelBubble.get!, this, [])
    }
    set cancelBubble(value) {
        if (value !== true) return
        const event = GetWrappedJSObject(this)
        if (#stopPropagation in event) event.#stopPropagation = value
        else $.apply($Content.EventPrototypeDesc.cancelBubble.set!, this, [value])
    }
    stopImmediatePropagation() {
        const event = GetWrappedJSObject(this)
        if (!(#stopImmediatePropagation in event))
            return $.apply($Content.EventPrototypeDesc.stopImmediatePropagation.value!, this, arguments)
        event.#stopPropagation = true
        event.#stopImmediatePropagation = true
    }
    #SetCancelFlag() {
        if (this.#cancelable && !this.#inPassiveListener) this.#canceled = true
    }
    get cancelable(): boolean {
        const event = GetWrappedJSObject(this)
        if (#stopPropagation in event) return event.#stopPropagation
        return $.apply($Content.EventPrototypeDesc.cancelable.get!, this, [])
    }
    get returnValue(): boolean {
        const event = GetWrappedJSObject(this)
        if (#canceled in event) return !event.#canceled
        return $.apply($Content.EventPrototypeDesc.returnValue.get!, this, [])
    }
    set returnValue(value) {
        if (value !== false) return
        const event = GetWrappedJSObject(this)
        if (#canceled in event) event.#canceled = !value
        else $.apply($Content.EventPrototypeDesc.returnValue.set!, this, [value])
    }
    preventDefault() {
        const event = GetWrappedJSObject(this)
        if (!(#canceled in event)) return $.apply($Content.EventPrototypeDesc.preventDefault.value!, this, arguments)
        event.#SetCancelFlag()
    }
    get defaultPrevented(): boolean {
        const event = GetWrappedJSObject(this)
        if (#canceled in event) return event.#canceled
        return $.apply($Content.EventPrototypeDesc.defaultPrevented.get!, this, [])
    }
    get composed(): boolean {
        const event = GetWrappedJSObject(this)
        if (#composed in event) return event.#stopPropagation
        return $.apply($Content.EventPrototypeDesc.composed.get!, this, [])
    }

    initEvent(type: string, bubbles: boolean, cancelable: boolean) {
        const event = GetWrappedJSObject(this)
        if (!(#dispatch in event)) return $.apply($Content.EventPrototypeDesc.initEvent.value!, this, arguments)
        if (event.#dispatch) return
        event.#stopPropagation = false
        event.#stopImmediatePropagation = false
        event.#canceled = false
        event.#isTrusted = false
        event.#target = null
        event.#type = type
        event.#bubbles = bubbles
        event.#cancelable = cancelable
    }
    static UIEvent = class UIEvent extends __Event {
        constructor(type: string, eventInitDict?: UIEventInit | undefined) {
            super(type, eventInitDict)
            $.setPrototypeOf(this, $.unwrapXRayVision($Content.UIEventPrototype))
            this.#detail = eventInitDict?.detail || 0
            this.#view = eventInitDict?.view || null
        }
        #view?: Window | null | undefined
        get view() {
            const event = GetWrappedJSObject(this)
            if (!(#view in event)) return $.apply($Content.UIEventPrototypeDesc.view.get!, this, [])
            return event.#view
        }
        #detail: number
        get detail() {
            const event = GetWrappedJSObject(this)
            if (!(#detail in event)) return $.apply($Content.UIEventPrototypeDesc.detail.get!, this, [])
            return event.#detail
        }
        initUIEvent(
            type: string,
            canBubble: boolean,
            cancelable: boolean,
            view: Window | null | undefined,
            detail: number,
        ) {
            const event = GetWrappedJSObject(this)
            if (!(#detail in event))
                // TODO: use arguments after https://github.com/swc-project/swc/issues/7428
                return $.apply($Content.UIEventPrototypeDesc.initUIEvent.value!, this, [
                    type,
                    canBubble,
                    cancelable,
                    view,
                    detail,
                ])
            if (event.#dispatch) return
            $.apply(__Event.prototype.initEvent, this, [type, canBubble, cancelable])
            event.#view = view
            event.#detail = detail
        }
        get sourceCapabilities() {
            const event = GetWrappedJSObject(this)
            if (!(#detail in event))
                return void $.apply($Content.UIEventPrototypeDesc.sourceCapabilities.get!, this, [])
            // TODO: for touch events
            return null
        }
        get which() {
            const event = GetWrappedJSObject(this)
            if (!(#detail in event)) return void $.apply($Content.UIEventPrototypeDesc.which.get!, this, [])
            // TODO: for MouseEvent and KeyboardEvent
            return null
        }
    }
    static ClipboardEvent = class ClipboardEvent extends __Event implements ClipboardEvent {
        #clipboardData: DataTransfer | null
        constructor(type: string, eventInitDict?: (ClipboardEventInit & { __proto__: null }) | undefined) {
            super(type, eventInitDict)
            this.#clipboardData = eventInitDict?.clipboardData || new $Content.DataTransfer()
            $.setPrototypeOf(this, $.unwrapXRayVision($Content.ClipboardEventPrototype))
        }
        get clipboardData() {
            const event = GetWrappedJSObject(this)
            if (!(#clipboardData in event))
                return $.apply($Content.ClipboardEventPrototypeDesc.clipboardData.get!, this, [])
            return event.#clipboardData
        }
    }
    static InputEvent = class InputEvent extends __Event.UIEvent {
        constructor(type: string, eventInitDict?: (InputEventInit & { __proto__: null }) | undefined) {
            super(type, eventInitDict)
            $.setPrototypeOf(this, $.unwrapXRayVision($Content.InputEventPrototype))
            this.#data = eventInitDict?.data || null
            this.#isComposing = eventInitDict?.isComposing || false
            this.#inputType = eventInitDict?.inputType || ''
            this.#dataTransfer = eventInitDict?.dataTransfer || null
        }
        #data: string | null
        get data() {
            const event = GetWrappedJSObject(this)
            if (!(#data in event)) return $.apply($Content.InputEventPrototypeDesc.data.get!, this, [])
            return event.#data
        }
        #isComposing: boolean
        get isComposing() {
            const event = GetWrappedJSObject(this)
            if (!(#isComposing in event)) return $.apply($Content.InputEventPrototypeDesc.isComposing.get!, this, [])
            return event.#isComposing
        }
        #inputType: string
        get inputType(): string {
            const event = GetWrappedJSObject(this)
            if (!(#inputType in event)) return $.apply($Content.InputEventPrototypeDesc.inputType.get!, this, [])
            return event.#inputType
        }
        #dataTransfer: DataTransfer | null
        get dataTransfer(): DataTransfer | null {
            const event = GetWrappedJSObject(this)
            if (!(#dataTransfer in event)) return $.apply($Content.InputEventPrototypeDesc.dataTransfer.get!, this, [])
            if (event.#dataTransfer === null) return null
            return $.unwrapXRayVision(event.#dataTransfer)
        }
        // TODO
        getTargetRanges(): StaticRange[] {
            return $Content.Array()
        }
    }
}
const { DispatchEvent, AppendEventPath, EventTarget_GetParent, Invoke, InnerInvoke } = __Event
defineFunctionOnContentObject($Content.EventTargetPrototype, 'dispatchEvent', __Event.EventTarget_DispatchEvent)
export { DispatchEvent }

// Legacy TODO: https://dom.spec.whatwg.org/#interface-window-extensions
{
    function PatchEventPrototype(props: PropertyDescriptorMap, targetDesc: PropertyDescriptorMap, targetProto: object) {
        // const props = $.getOwnPropertyDescriptors(_Event.prototype)
        for (const key in props) {
            if (key === 'constructor') continue
            const desc = props[key]
            const oldDesc = { ...targetDesc[key] }
            if (!oldDesc.configurable) continue
            desc.configurable = true
            desc.enumerable = oldDesc.enumerable
            if ('writable' in oldDesc) desc.writable = oldDesc.writable
            if (desc.value) desc.value = $.cloneIntoContent(desc.value)
            if (desc.get) desc.get = $.cloneIntoContent(desc.get)
            if (desc.set) desc.set = $.cloneIntoContent(desc.set)
            try {
                $.defineProperty($.unwrapXRayVision(targetProto), key, desc)
            } catch {}
        }
    }
    PatchEventPrototype(
        $.getOwnPropertyDescriptors(__Event.prototype),
        $Content.EventPrototypeDesc,
        $Content.EventPrototype,
    )
    PatchEventPrototype(
        $.getOwnPropertyDescriptors(__Event.ClipboardEvent.prototype),
        $Content.ClipboardEventPrototypeDesc,
        $Content.ClipboardEventPrototype,
    )
    PatchEventPrototype(
        $.getOwnPropertyDescriptors(__Event.UIEvent.prototype),
        $Content.UIEventPrototypeDesc,
        $Content.UIEventPrototype,
    )
    PatchEventPrototype(
        $.getOwnPropertyDescriptors(__Event.InputEvent.prototype),
        $Content.InputEventPrototypeDesc,
        $Content.InputEventPrototype,
    )
}

interface PathRecord {
    __proto__: null
    invocationTarget: EventTarget
    invocationTargetInShadowTree: boolean
    shadowAdjustedTarget: PotentialEventTarget
    relatedTarget: PotentialEventTarget
    touchTargetList: PotentialEventTarget[]
    rootOfClosedTree: boolean
    slotInClosedTree: boolean
}
interface BooleanFlag {
    value: boolean
}
type PotentialEventTarget = EventTarget | null
// https://dom.spec.whatwg.org/#concept-event-listener-invoke
const LegacyEventRemappingTable = {
    animationend: 'webkitAnimationEnd',
    animationiteration: 'webkitAnimationIteration',
    animationstart: 'webkitAnimationStart',
    transitionend: 'webkitTransitionEnd',
    __proto__: null,
} as const

import { $, $safe, $unsafe, isDocument, isNode, isShadowRoot, isWindow } from '../intrinsic.js'
import { PatchDescriptor, PatchDescriptor_NonNull } from '../utils.js'
import { __DataTransfer, __DataTransferItemList } from './DataTransfer.js'
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

type ActivationBehavior = Map<EventTarget, (event: __Event) => void>

export class __Event extends $unsafe.NewObject implements Event {
    // https://dom.spec.whatwg.org/#dom-eventtarget-dispatchevent
    static dispatchEvent(this: EventTarget, event: Event) {
        if (!(#dispatch in event)) return $.dispatchEvent(this, event)

        // (Skip: we don't override document.createEvent) or if its initialized flag is not set
        if (event.#dispatch) {
            // TODO: stack
            throw $unsafe.structuredCloneFromSafe(
                new $.DOMException(
                    $.isFirefox ?
                        'An attempt was made to use an object that is not, or is no longer, usable'
                    :   "Failed to execute 'dispatchEvent' on 'EventTarget': The event is already being dispatched.",
                    'InvalidStateError',
                ),
            )
        }
        event.#isTrusted = false
        return DispatchEvent(this, event)
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
            $.console_error("[@masknet/injected-script] Trying to send event didn't captured.")
            return true
        }

        let clearTargets = false

        event.#dispatch = true
        // legacy target override flag is only used by HTML and only when target is a Window object.
        const targetOverride = !legacyTargetOverride ? target : $.Window_document(target as typeof window)
        let activationTarget = null
        let relatedTarget: EventTarget | null = ReTarget(event.#relatedTarget, target)
        if (target !== relatedTarget || target === event.#relatedTarget) {
            const touchTargets: PotentialEventTarget[] = $safe.Array_of()
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
                const touchTargets: PotentialEventTarget[] = $safe.Array_of()
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
        event.#path = $safe.Array_of()
        event.#dispatch = false
        event.#stopPropagation = false
        event.#stopImmediatePropagation = false
        if (clearTargets) {
            event.#target = event.#relatedTarget = null
            event.#touchTargetList = $safe.Array_of()
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
                $.console_error('[@masknet/injected-script] Assert failed: struct must appears in the event.#path.')
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
        const listeners = $safe.Set(CapturedListeners.get(struct.invocationTarget))
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
                $.removeEventListener(event.#currentTarget!, listener.type, listener.callback!, listener.capture)
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
                let __unsafe__X: EventListener
                let __unsafe__thisArg: object = event.#currentTarget!
                if (typeof listener.callback === 'function') __unsafe__X = listener.callback
                else {
                    try {
                        const __unsafe__callbackObject = $unsafe.unwrapXRayVision(listener.callback!)
                        __unsafe__X = __unsafe__callbackObject.handleEvent!
                        // TODO: message, stack
                        if (typeof __unsafe__X !== 'function')
                            throw new $unsafe.TypeError('handleEvent is not a function')
                        __unsafe__thisArg = __unsafe__callbackObject
                    } catch (error) {
                        exception = error
                        hasException = true
                        break Call_A_User_Objects_Operation
                    }
                }
                try {
                    $.apply(__unsafe__X, __unsafe__thisArg, [event])
                } catch (error) {
                    exception = error
                    hasException = true
                }
            }
            if (hasException) {
                $unsafe.reportError($unsafe.window, exception)
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
        $.setPrototypeOf(this, $.EventPrototype)
        $.defineProperties(this, {
            isTrusted: {
                enumerable: true,
                configurable: false,
                get: $unsafe.expose(function isTrusted(this: __Event) {
                    return $unsafe.unwrapXRayVision(this).#isTrusted
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
        const event = $unsafe.unwrapXRayVision(this)
        if (!(#type in event)) return $.apply($.EventPrototypeDesc.type.get!, this, [])
        return event.#type
    }
    #bubbles: boolean
    get bubbles(): boolean {
        const event = $unsafe.unwrapXRayVision(this)
        if (!(#bubbles in event)) return $.apply($.EventPrototypeDesc.bubbles.get!, this, [])
        return event.#bubbles
    }
    #target: EventTarget | null = null
    get target(): EventTarget | null {
        const event = $unsafe.unwrapXRayVision(this)
        if (!(#target in event)) return $.apply($.EventPrototypeDesc.target.get!, this, [])
        if (event.#target === null) return null
        return event.#target
    }
    get srcElement() {
        const event = $unsafe.unwrapXRayVision(this)
        if (!(#target in event)) return $.apply($.EventPrototypeDesc.srcElement.get!, this, [])
        if (event.#target === null) return null
        return event.#target
    }
    #currentTarget: EventTarget | null = null
    get currentTarget() {
        const event = $unsafe.unwrapXRayVision(this)
        if (!(#currentTarget in event)) return $.apply($.EventPrototypeDesc.currentTarget.get!, this, [])
        if (event.#currentTarget === null) return null
        return event.#currentTarget
    }
    #timeStamp = $.Performance_now()
    get timeStamp(): number {
        const event = $unsafe.unwrapXRayVision(this)
        if (!(#timeStamp in event)) return $.apply($.EventPrototypeDesc.timeStamp.get!, this, [])
        return event.#timeStamp
    }
    #relatedTarget: EventTarget | null = null
    #touchTargetList: PotentialEventTarget[] = $safe.Array_of()
    #path: PathRecord[] = $safe.Array_of()
    #eventPhase = EVENT_PHASE_NONE
    get eventPhase(): number {
        const event = $unsafe.unwrapXRayVision(this)
        if (!(#eventPhase in event)) return $.apply($.EventPrototypeDesc.eventPhase.get!, this, [])
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
        const event = $unsafe.unwrapXRayVision(this)
        if (!(#path in event)) return $.apply($.EventPrototypeDesc.composedPath.value!, this, arguments)

        const path = event.#path
        const currentTarget = event.#currentTarget
        const __unsafe__composedPath__: EventTarget[] = $unsafe.structuredCloneFromSafe([])
        if (path.length === 0) return __unsafe__composedPath__
        $.ArrayPush(__unsafe__composedPath__, currentTarget ? currentTarget : null)
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
                $.ArrayUnshift(__unsafe__composedPath__, path[index].invocationTarget)
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
                $.ArrayPush(__unsafe__composedPath__, path[index].invocationTarget)
            if (path[index].rootOfClosedTree) {
                currentHiddenLevel -= 1
                if (currentHiddenLevel < maxHiddenLevel) maxHiddenLevel = currentHiddenLevel
            }
            index += 1
        }
        return __unsafe__composedPath__
    }
    stopPropagation() {
        const event = $unsafe.unwrapXRayVision(this)
        if (!(#stopPropagation in event)) return $.apply($.EventPrototypeDesc.stopPropagation.value!, this, arguments)
        event.#stopPropagation = true
    }
    get cancelBubble(): boolean {
        const event = $unsafe.unwrapXRayVision(this)
        if (#stopPropagation in event) return event.#stopPropagation
        return $.apply($.EventPrototypeDesc.cancelBubble.get!, this, [])
    }
    set cancelBubble(value) {
        if (value !== true) return
        const event = $unsafe.unwrapXRayVision(this)
        if (#stopPropagation in event) event.#stopPropagation = value
        else $.apply($.EventPrototypeDesc.cancelBubble.set!, this, [value])
    }
    stopImmediatePropagation() {
        const event = $unsafe.unwrapXRayVision(this)
        if (!(#stopImmediatePropagation in event))
            return $.apply($.EventPrototypeDesc.stopImmediatePropagation.value!, this, arguments)
        event.#stopPropagation = true
        event.#stopImmediatePropagation = true
    }
    #SetCancelFlag() {
        if (this.#cancelable && !this.#inPassiveListener) this.#canceled = true
    }
    get cancelable(): boolean {
        const event = $unsafe.unwrapXRayVision(this)
        if (#stopPropagation in event) return event.#stopPropagation
        return $.apply($.EventPrototypeDesc.cancelable.get!, this, [])
    }
    get returnValue(): boolean {
        const event = $unsafe.unwrapXRayVision(this)
        if (#canceled in event) return !event.#canceled
        return $.apply($.EventPrototypeDesc.returnValue.get!, this, [])
    }
    set returnValue(value) {
        if (value !== false) return
        const event = $unsafe.unwrapXRayVision(this)
        if (#canceled in event) event.#canceled = !value
        else $.apply($.EventPrototypeDesc.returnValue.set!, this, [value])
    }
    preventDefault() {
        const event = $unsafe.unwrapXRayVision(this)
        if (!(#canceled in event)) return $.apply($.EventPrototypeDesc.preventDefault.value!, this, arguments)
        event.#SetCancelFlag()
    }
    get defaultPrevented(): boolean {
        const event = $unsafe.unwrapXRayVision(this)
        if (#canceled in event) return event.#canceled
        return $.apply($.EventPrototypeDesc.defaultPrevented.get!, this, [])
    }
    get composed(): boolean {
        const event = $unsafe.unwrapXRayVision(this)
        if (#composed in event) return event.#stopPropagation
        return $.apply($.EventPrototypeDesc.composed.get!, this, [])
    }

    initEvent(type: string, bubbles: boolean, cancelable: boolean) {
        const event = $unsafe.unwrapXRayVision(this)
        if (!(#dispatch in event)) return $.apply($.EventPrototypeDesc.initEvent.value!, this, arguments)
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
            $.setPrototypeOf(this, $.UIEventPrototype)
            this.#detail = eventInitDict?.detail || 0
            this.#view = eventInitDict?.view || null
        }
        #view?: Window | null | undefined
        get view() {
            const event = $unsafe.unwrapXRayVision(this)
            if (!(#view in event)) return $.apply($.UIEventPrototypeDesc.view.get!, this, [])
            return event.#view
        }
        #detail: number
        get detail() {
            const event = $unsafe.unwrapXRayVision(this)
            if (!(#detail in event)) return $.apply($.UIEventPrototypeDesc.detail.get!, this, [])
            return event.#detail
        }
        initUIEvent(
            type: string,
            canBubble: boolean,
            cancelable: boolean,
            view: Window | null | undefined,
            detail: number,
        ) {
            const event = $unsafe.unwrapXRayVision(this)
            if (!(#detail in event))
                // TODO: use arguments after https://github.com/swc-project/swc/issues/7428
                return $.apply($.UIEventPrototypeDesc.initUIEvent.value!, this, [
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
            const event = $unsafe.unwrapXRayVision(this)
            if (!(#detail in event)) return void $.apply($.UIEventPrototypeDesc.sourceCapabilities.get!, this, [])
            // TODO: for touch events
            return null
        }
        get which() {
            const event = $unsafe.unwrapXRayVision(this)
            if (!(#detail in event)) return void $.apply($.UIEventPrototypeDesc.which.get!, this, [])
            // TODO: for MouseEvent and KeyboardEvent
            return null
        }
    }
    static ClipboardEvent = class ClipboardEvent extends __Event implements ClipboardEvent {
        #clipboardData: DataTransfer | null
        constructor(type: string, eventInitDict?: (ClipboardEventInit & { __proto__: null }) | undefined) {
            super(type, eventInitDict)
            this.#clipboardData = eventInitDict?.clipboardData || new __DataTransfer(__DataTransferItemList.from())
            $.setPrototypeOf(this, $.ClipboardEventPrototype)
        }
        get clipboardData() {
            const event = $unsafe.unwrapXRayVision(this)
            if (!(#clipboardData in event)) return $.apply($.ClipboardEventPrototypeDesc.clipboardData.get!, this, [])
            return event.#clipboardData
        }
    }
    static InputEvent = class InputEvent extends __Event.UIEvent {
        constructor(type: string, eventInitDict?: (InputEventInit & { __proto__: null }) | undefined) {
            super(type, eventInitDict)
            $.setPrototypeOf(this, $.InputEventPrototype)
            this.#data = eventInitDict?.data || null
            this.#isComposing = eventInitDict?.isComposing || false
            this.#inputType = eventInitDict?.inputType || ''
            this.#dataTransfer = eventInitDict?.dataTransfer || null
        }
        #data: string | null
        get data() {
            const event = $unsafe.unwrapXRayVision(this)
            if (!(#data in event)) return $.apply($.InputEventPrototypeDesc.data.get!, this, [])
            return event.#data
        }
        #isComposing: boolean
        get isComposing() {
            const event = $unsafe.unwrapXRayVision(this)
            if (!(#isComposing in event)) return $.apply($.InputEventPrototypeDesc.isComposing.get!, this, [])
            return event.#isComposing
        }
        #inputType: string
        get inputType(): string {
            const event = $unsafe.unwrapXRayVision(this)
            if (!(#inputType in event)) return $.apply($.InputEventPrototypeDesc.inputType.get!, this, [])
            return event.#inputType
        }
        #dataTransfer: DataTransfer | null
        get dataTransfer(): DataTransfer | null {
            const event = $unsafe.unwrapXRayVision(this)
            if (!(#dataTransfer in event)) return $.apply($.InputEventPrototypeDesc.dataTransfer.get!, this, [])
            if (event.#dataTransfer === null) return null
            return event.#dataTransfer
        }
        // TODO
        getTargetRanges(): StaticRange[] {
            return $unsafe.structuredCloneFromSafe([])
        }
    }
}
const { DispatchEvent, AppendEventPath, EventTarget_GetParent, Invoke, InnerInvoke } = __Event
export { DispatchEvent }

// Legacy TODO: https://dom.spec.whatwg.org/#interface-window-extensions
PatchDescriptor_NonNull($.getOwnPropertyDescriptors(__Event.prototype), $.EventPrototype)
PatchDescriptor_NonNull($.getOwnPropertyDescriptors(__Event.UIEvent.prototype), $.UIEventPrototype)
PatchDescriptor_NonNull($.getOwnPropertyDescriptors(__Event.InputEvent.prototype), $.InputEventPrototype)
PatchDescriptor_NonNull($.getOwnPropertyDescriptors(__Event.ClipboardEvent.prototype), $.ClipboardEventPrototype)
PatchDescriptor({ __proto__: null!, dispatchEvent: { value: __Event.dispatchEvent } }, $.EventTargetPrototype)

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

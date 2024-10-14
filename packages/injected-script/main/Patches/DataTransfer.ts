import { $, $safe, $unsafe } from '../intrinsic.js'
import { PatchDescriptor_NonNull } from '../utils.js'

export class __DataTransfer extends $unsafe.NewObject implements DataTransfer {
    constructor(items: __DataTransferItemList) {
        super()
        this.#items = items
        const types: string[] = $safe.Array_of()
        const files: File[] = $safe.Array_of()
        for (const item of __DataTransferItemList.items(items)) {
            if (item.kind === 'string') {
                types.push(__DataTransferItem.type(item))
            } else if (item.kind === 'file') {
                types.push('Files')
                files.push(__DataTransferItem.data(item) as File)
            }
        }
        this.#types = $.freeze($unsafe.unwrapXRayVision($unsafe.structuredCloneFromSafe(types)))
        this.#files = new __FileList(files)
        $.setPrototypeOf(this, $.DataTransferPrototype)
    }
    // #region getter setters
    #dropEffect: DataTransfer['dropEffect'] = 'none'
    get dropEffect(): DataTransfer['dropEffect'] {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#dropEffect in object)) return $.apply($.DataTransferPrototypeDesc.dropEffect.get!, this, [])
        return object.#dropEffect
    }
    set dropEffect(value: DataTransfer['dropEffect']) {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#dropEffect in object)) {
            $.apply($.DataTransferPrototypeDesc.dropEffect.set!, this, arguments)
            return
        }
        if (value !== 'none' && value !== 'copy' && value !== 'link' && value !== 'move') return
        object.#dropEffect = value
    }
    #effectAllowed: DataTransfer['effectAllowed'] = 'none'
    get effectAllowed(): DataTransfer['effectAllowed'] {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#effectAllowed in object)) return $.apply($.DataTransferPrototypeDesc.effectAllowed.get!, this, [])
        return object.#effectAllowed
    }
    set effectAllowed(value: DataTransfer['effectAllowed']) {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#effectAllowed in object)) {
            $.apply($.DataTransferPrototypeDesc.effectAllowed.set!, this, arguments)
            return
        }
        if (
            value !== 'none' &&
            value !== 'copy' &&
            value !== 'copyLink' &&
            value !== 'copyMove' &&
            value !== 'link' &&
            value !== 'linkMove' &&
            value !== 'move' &&
            value !== 'all' &&
            value !== 'uninitialized'
        )
            return
        object.#effectAllowed = value
    }
    #files: DataTransfer['files'] = new __FileList([])
    get files(): DataTransfer['files'] {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#files in object)) return $.apply($.DataTransferPrototypeDesc.files.get!, this, [])
        return object.#files
    }
    #items: __DataTransferItemList
    get items(): DataTransfer['items'] {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#items in object)) return $.apply($.DataTransferPrototypeDesc.items.get!, this, [])
        return object.#items
    }
    #types: DataTransfer['types'] = []
    get types(): DataTransfer['types'] {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#types in object)) return $.apply($.DataTransferPrototypeDesc.types.get!, this, [])
        return object.#types
    }
    // #endregion
    clearData(format?: string | undefined): void {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#items in object)) return $.apply($.DataTransferPrototypeDesc.clearData.value!, this, arguments)
        return
    }
    getData(format: string): string {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#items in object)) return $.apply($.DataTransferPrototypeDesc.getData.value!, this, arguments)
        format = $.StringToLowerCase(format)
        let convertToURL = false
        if (format === 'text') format = 'text/plain'
        else if (format === 'url') {
            format = 'text/uri-list'
            convertToURL = true
        }
        const data = __DataTransferItemList.items(object.#items)
        let result = ''
        for (const item of data) {
            if (__DataTransferItem.kind(item) !== 'string') continue
            if (__DataTransferItem.type(item) !== format) continue
            result = __DataTransferItem.data(item) as string
        }
        if (convertToURL) {
            // TODO: If convert-to-URL is true, then parse result as appropriate for text/uri-list data, and then set result to the first URL from the list, if any, or the empty string otherwise. [RFC2483]
        }
        return result
    }
    setData(format: string, data: string): void {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#items in object)) return $.apply($.DataTransferPrototypeDesc.setData.value!, this, arguments)
        return
    }
    setDragImage(image: Element, x: number, y: number): void {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#items in object)) return $.apply($.DataTransferPrototypeDesc.setDragImage.value!, this, arguments)
        return
    }
}
export class __FileList extends $unsafe.NewObject implements FileList {
    constructor(files: readonly File[]) {
        super()
        this.#files = $safe.Array_of(...files)
        const desc = $.getOwnPropertyDescriptors(files)
        delete (desc as any).length
        $.defineProperties(this, desc as any)
        $.setPrototypeOf(this, $.FileListPrototype)
    }
    #files: readonly File[];
    [index: number]: File
    get length(): number {
        const list = $unsafe.unwrapXRayVision(this)
        if (!(#files in list)) return $.apply($.FileListPrototypeDesc.length.get!, this, [])
        return list.#files.length
    }
    item(index: number): File | null {
        const list = $unsafe.unwrapXRayVision(this)
        if (!(#files in list)) return $.apply($.FileListPrototypeDesc.item.value!, this, arguments)
        return list.#files[index] ?? null
    }
    [Symbol.iterator](): ArrayIterator<File> {
        const list = $unsafe.unwrapXRayVision(this)
        if (!(#files in list)) return $.apply($.FileListPrototypeDesc[Symbol.iterator].value!, this, arguments)
        return $unsafe.Array_values(list.#files)
    }
}
export class __DataTransferItem extends $unsafe.NewObject implements DataTransferItem {
    static is(obj: any): obj is DataTransferItem {
        return #type in obj
    }
    static type(item: __DataTransferItem) {
        return item.#type
    }
    static kind(item: __DataTransferItem) {
        return item.#kind
    }
    static data(item: __DataTransferItem) {
        return item.#data
    }
    constructor(item: string | File, type: string) {
        super()
        this.#type = $.StringToLowerCase(type)
        if (typeof item === 'string') {
            this.#kind = 'string'
            this.#data = item
        } else {
            this.#kind = 'file'
            this.#data = item
        }
        $.setPrototypeOf(this, $.DataTransferItemPrototype)
    }
    #data: string | File
    #kind: 'string' | 'file'
    get kind() {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#kind in object)) return $.apply($.DataTransferItemPrototypeDesc.kind.get!, this, [])
        return object.#kind
    }
    #type: string
    get type() {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#type in object)) return $.apply($.DataTransferItemPrototypeDesc.type.get!, this, [])
        return object.#type
    }
    getAsFile(): File | null {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#type in object)) return $.apply($.DataTransferItemPrototypeDesc.getAsFile.value!, this, arguments)
        if (object.#kind !== 'file') return null
        return $unsafe.structuredCloneFromSafeReal(object.#data as File)
    }
    getAsString(callback: FunctionStringCallback | null): void {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#type in object)) return $.apply($.DataTransferItemPrototypeDesc.getAsString.value!, this, arguments)
        if (callback === null) return
        if (object.#kind !== 'string') return
        $.setTimeout(() => {
            callback(object.#data as string)
        }, 0)
    }
    webkitGetAsEntry(): FileSystemEntry | null {
        const object = $unsafe.unwrapXRayVision(this)
        if (!(#type in object)) return $.apply($.DataTransferItemPrototypeDesc.webkitGetAsEntry.value!, this, arguments)
        // TODO:
        return null
    }
}
export class __DataTransferItemList extends $unsafe.NewObject implements DataTransferItemList {
    static from(...args: ReadonlyArray<string | File | __DataTransferItem>) {
        $.setPrototypeOf(args, $safe.ArrayPrototype)
        return new __DataTransferItemList(
            args.map((item) => {
                if (typeof item === 'string') return new __DataTransferItem(item, 'text/plain')
                if (__DataTransferItem.is(item)) return item
                return new __DataTransferItem(item, $.Blob_type(item))
            }),
        )
    }
    static items(list: __DataTransferItemList) {
        return list.#items
    }
    constructor(items: readonly __DataTransferItem[]) {
        super()
        this.#items = $safe.Array_of(...items)
        const desc = $.getOwnPropertyDescriptors(items)
        delete (desc as any).length
        $.defineProperties(this, desc as any)
        $.setPrototypeOf(this, $.DataTransferItemListPrototype)
    }
    #items: readonly __DataTransferItem[];
    [index: number]: DataTransferItem
    get length(): number {
        const list = $unsafe.unwrapXRayVision(this)
        if (!(#items in list)) return $.apply($.DataTransferItemListPrototypeDesc.length.get!, this, [])
        return list.#items.length
    }
    add(data: string, type: string): DataTransferItem | null
    add(data: File): DataTransferItem | null
    add(data: unknown, type?: unknown): DataTransferItem | null {
        const list = $unsafe.unwrapXRayVision(this)
        if (!(#items in list)) return $.apply($.DataTransferItemListPrototypeDesc.add.value!, this, arguments)
        return null
    }
    clear(): void {
        const list = $unsafe.unwrapXRayVision(this)
        if (!(#items in list)) return $.apply($.DataTransferItemListPrototypeDesc.clear.value!, this, arguments)
        return
    }
    remove(index: number): void {
        const list = $unsafe.unwrapXRayVision(this)
        if (!(#items in list)) return $.apply($.DataTransferItemListPrototypeDesc.remove.value!, this, arguments)
        throw $unsafe.structuredCloneFromSafe(
            // TODO: message
            new $.DOMException('The object is in an invalid state.', 'InvalidStateError'),
        )
    }
    [Symbol.iterator](): ArrayIterator<DataTransferItem> {
        const list = $unsafe.unwrapXRayVision(this)
        if (!(#items in list))
            return $.apply($.DataTransferItemListPrototypeDesc[Symbol.iterator].value!, this, arguments)
        return $unsafe.Array_values(list.#items)
    }
}
PatchDescriptor_NonNull($.getOwnPropertyDescriptors(__DataTransfer.prototype), $.DataTransferPrototype)
PatchDescriptor_NonNull($.getOwnPropertyDescriptors(__FileList.prototype), $.FileListPrototype)
PatchDescriptor_NonNull($.getOwnPropertyDescriptors(__DataTransferItem.prototype), $.DataTransferItemPrototype)
PatchDescriptor_NonNull($.getOwnPropertyDescriptors(__DataTransferItemList.prototype), $.DataTransferItemListPrototype)

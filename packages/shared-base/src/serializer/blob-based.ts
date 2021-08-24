import Typeson from 'typeson'
const obj: any = {}

obj.Blob = create((x): x is Blob => x instanceof Blob, toBlobURL, fromBlobURL)

obj.ArrayBuffer = createBlob(
    (x): x is ArrayBuffer => x instanceof ArrayBuffer,
    async (data) => new Blob([data]),
    async (blob) => blob.arrayBuffer(),
)

obj.File = create(
    (x): x is File => x instanceof File,
    async (file) => ({
        content: await toBlobURL(new Blob([await file.arrayBuffer()], { type: file.type })),
        name: file.name,
        last: file.lastModified,
        type: file.type,
    }),
    async (file) =>
        new File([await fromBlobURL(file.content)], file.name, { lastModified: file.last, type: file.type }),
)
// TODO: FileList

// TODO: ImageBitMap (safari not support)
obj.ImageData = create(
    (x): x is ImageData => x instanceof ImageData,
    async (img) => ({ width: img.width, height: img.height, data: await toBlobURL(new Blob([img.data])) }),
    async (img) => {
        const image: Uint8ClampedArray = await fromBlobURL(img.data)
            .then((x) => x.arrayBuffer())
            .then((x) => new Uint8ClampedArray(x))
        return new ImageData(image, img.width, img.height)
    },
)

export default obj

function create<Type, Serialized, State = {}>(
    test: ((x: unknown) => x is Type) | ((x: unknown) => boolean),
    serialize: (data: Type, state: State) => Promise<Serialized>,
    deserialize: (data: Serialized, state: State) => Promise<Type>,
) {
    return {
        test,
        reviveAsync: (a: any, b: any) => toAsync(deserialize(a, b)),
        replaceAsync: (a: any, b: any) => toAsync(serialize(a, b)),
    }
}
function createBlob<Type, State = {}>(
    test: ((x: unknown) => x is Type) | ((x: unknown) => boolean),
    serialize: (data: Type, state: State) => Promise<Blob>,
    deserialize: (data: Blob, state: State) => Promise<Type>,
) {
    return {
        test,
        replaceAsync: async (a: any, b: any) => toAsync(toBlobURL(await serialize(a, b))),
        reviveAsync: async (a: any, b: any) => toAsync(deserialize(await fromBlobURL(a), b)),
    }
}
function toAsync(x: Promise<any>) {
    return new Typeson.Promise((resolve, reject) => x.then(resolve, reject))
}

async function toBlobURL(x: Blob) {
    const url = URL.createObjectURL(x)
    setTimeout(() => URL.revokeObjectURL(url), 10 * 1000)
    return url
}
function fromBlobURL(url: string) {
    return fetch(url).then((x) => x.blob())
}

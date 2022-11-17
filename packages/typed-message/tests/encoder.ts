import { test, expect } from 'vitest'
import {
    makeTypedMessageText,
    encodeTypedMessageToDocument,
    makeTypedMessageSerializableTupleFromList,
    decodeTypedMessageFromDocument,
} from '../base/src/index.js'
import { testSerializer } from '../../test-serializer/index.js'

expect.addSnapshotSerializer(testSerializer)
const meta = new Map<string, any>([
    ['com.example.test', 'hi'],
    ['com.example.test2', { a: 1, b: [2], c: new Uint8Array([1, 2, 3, 4]) }],
])

test('Serialize Text', () => {
    const result = encodeTypedMessageToDocument(makeTypedMessageText('Hello world', meta))
    expect(result).toMatchSnapshot()
    expect(decodeTypedMessageFromDocument(result)).toMatchSnapshot()
})

test('Serialize Tuple', () => {
    const msg = makeTypedMessageSerializableTupleFromList(
        makeTypedMessageText('Hello world', meta),
        makeTypedMessageText('another'),
    )
    const result = encodeTypedMessageToDocument(msg)
    expect(result).toMatchSnapshot()
    expect(decodeTypedMessageFromDocument(result)).toMatchSnapshot()
})

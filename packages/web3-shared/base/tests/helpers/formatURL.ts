import { describe, test, expect } from 'vitest'
import { formatURL } from '../../src/helpers/formatURL.js'

describe('URL format util test', () => {
    test.each([
        {
            input: 'https://example.com/path/index.html?z=1&a=2&&b=3#section',
            expected: 'https://example.com/path/index.html?a=2&b=3&z=1',
        },
        {
            input: 'https://example.com/path/index.html?b=3&a=2&z=1#section',
            expected: 'https://example.com/path/index.html?a=2&b=3&z=1',
        },
        {
            input: 'https://example.com/path/index.html?param=value&other=123#section',
            expected: 'https://example.com/path/index.html?other=123&param=value',
        },
        {
            input: 'https://example.com/path/index.html?param=hello&param=world#section',
            expected: 'https://example.com/path/index.html?param=hello',
        },
        {
            input: 'https://example.com/path/index.html?empty=&missing#section',
            expected: 'https://example.com/path/index.html?empty=&missing=',
        },
        {
            input: 'https://example.com/path/index.html#section',
            expected: 'https://example.com/path/index.html',
        },
        {
            input: 'https://example.com//path//index.html?z=1&a=2&&b=3#section',
            expected: 'https://example.com/path/index.html?a=2&b=3&z=1',
        },
    ])('.formatURL($input)', ({ input, expected }) => {
        expect(formatURL(input)).toBe(expected)
    })
})

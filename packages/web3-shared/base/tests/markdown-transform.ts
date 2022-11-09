import { describe, it, expect } from 'vitest'

import { markdownTransformIpfsURL } from '../src/utils/markdown.js'

describe('markdown ipfs url transformer', () => {
    it('should transform ipfs into http url', () => {
        // cspell:disable
        const mockup = `
    ![image](ipfs://bafkreicvor6bkexdcdc66urd2msxsbwlugrc7yogejfg2y7afy4voqr22y)

![image](ipfs://bafkreib4otdfokwxny3ohjgurultfbxjryybh7o2rjbjr56fbr2vsv7jgq)
    `
        const result = markdownTransformIpfsURL(mockup)
        expect(result).not.contains('ipfs://')
        expect(result.match(/https:/g)?.length).toEqual(2)
    })
})

import { restoreNewIdentityWithMnemonicWord } from '../../WelcomeService'
import { ProfileIdentifier } from '../../../../database/type'
import { encryptTo } from '../encryptTo'
import { makeTypedMessage } from '../utils'

const a = new ProfileIdentifier('test', 'a')
const b = new ProfileIdentifier('test', 'b')
test('Encrypt to', async () => {
    /**
     * JavaScript heap out of memory
     */
    // await restoreNewIdentityWithMnemonicWord('aaaa', 'bbbb', { whoAmI: a })
    // await restoreNewIdentityWithMnemonicWord('bbbbb', 'aaa', { whoAmI: b })
    // const [text, token] = await encryptTo(makeTypedMessage('Test message'), [b], a, false)
    // console.log(text)
})

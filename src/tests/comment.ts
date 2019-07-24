import { encryptComment, decryptComment } from '../crypto/crypto-alpha-40'

async function testComment(comment = 'my content', postContent = 'my post content', salt = 'YT5RHjrEKnQQvV1pZa/U+g==') {
    const result = await encryptComment(salt, postContent, comment)
    const decrypted = await decryptComment(salt, postContent, result)
    if (decrypted !== comment) throw new Error()
}

testComment()
Object.assign(window, { testComment })

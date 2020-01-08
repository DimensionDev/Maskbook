import { encryptComment, decryptComment } from '../crypto-alpha-40'

async function testComment(comment = 'my content', postContent = 'my post content', salt = 'YT5RHjrEKnQQvV1pZa/U+g==') {
    const result = await encryptComment(salt, postContent, comment)
    expect(result).toMatchInlineSnapshot(`"🎶2/4|eKrB+ZPFmSoH0iZE/PERk/c6aZ5LY8dvLIU=:||"`)
    const decrypted = await decryptComment(salt, postContent, result)
    if (decrypted !== comment) throw new Error()
}

test('Comment encryption test', () => testComment())

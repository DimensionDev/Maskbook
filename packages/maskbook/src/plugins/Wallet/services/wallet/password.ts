let password = ''

export function INTERNAL_getPassword() {
    return password
}

export function INTERNAL_getPasswordRequired() {
    if (!password) throw new Error('No password set yet or expired.')
    return password
}

export function setPassword(newPassword: string) {
    if (!validatePassword(newPassword)) throw new Error('An invalid password.')
    password = newPassword
}

export function hasPassword() {
    return true
}

export function verifyPassword() {
    // DB unlock
}

export function changePassword(newPassword: string) {
    if (password === newPassword) throw new Error('The same password with the old one.')
    // use old password to unlock db
    // use new password to lock db
}

export function validatePassword(newPassword: string) {
    if (!newPassword) return false
    if (newPassword.length < 8) return false
    if (newPassword.length > 20) return false
    return [/\d/, /[a-z]/i, /[^a-z\d]/i].filter((x) => x.test(newPassword)).length > 2
}

export function clearPassword() {
    if (!password) throw new Error('No password set yet.')
    password = ''
}

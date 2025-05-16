export const passwordRegexp = /^(?=.{8,20}$)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\dA-Za-z]).*/u

/**
 * @deprecated use z.string().email() instead
 */
export const emailRegexp = /^([\w!#$%&*+./=?^`{|}~’-]{1,64}@([\dA-Za-z-]{1,255}.[\dA-Za-z-]{2,}))$/u

export const phoneRegexp = /^(\+?([ .-])?\d{1,2}([ .-])?)?(\(?\d{3}\)?|\d{3})([ .-])?(\d{3}([ .-])?\d{4})/u

export function isVerifiedUser(ele: HTMLElement) {
    return !!ele.closest('[data-testid="tweet"]')?.querySelector('[data-testid="icon-verified"]')
}

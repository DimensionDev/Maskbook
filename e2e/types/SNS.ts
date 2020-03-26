import { Page, Browser } from 'puppeteer'

export interface SNS {
    name: string
    id: string
    username: string
    password: string

    // selectors
    bioTextareaSelector: string
    immersiveDialogSelector: string

    getActivePage(browser: Browser): Promise<Page | undefined>

    // open specific page
    openHome(page: Page): Promise<void>
    openProfile(page: Page): Promise<void>

    // account
    login(browser: Browser): Promise<void>
    logout(browser: Browser): Promise<void>

    // bio
    getBio(page: Page): Promise<string>
    setBio(page: Page, bio: string): Promise<void>
    unsetBio(page: Page): Promise<void>

    // post
    deletePost(page: Page, postId: string): Promise<void>
}

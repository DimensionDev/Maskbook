import { Page, Browser } from 'puppeteer'

export interface SNS {
    /**
     * the sns name
     * e.g.
     * - facebook.com
     * - twitter.com
     */
    name: string

    /**
     * the unique id in sns network
     */
    id: string

    username: string
    password: string

    /**
     * the compose button which will trigger native composing view
     */
    composeButtonSelector: string

    /**
     * the image attachment node in native composing view
     */
    composeImageSelector: string

    /**
     * the editor node in native composing view
     */
    composeEditorSelector: string

    /**
     * a node indicate current page is a profile page
     */
    profileSelector: string

    /**
     * the editor node for user's bio
     */
    bioTextareaSelector: string

    /**
     * the editor node for comment
     */
    commentInputSelector: string

    /**
     * the mount node for immersive dialog
     */
    immersiveDialogSelector: string

    /**
     * the mount node for post dialog hint
     */
    postDialogHintSelector: string

    /**
     * the mount node for post dialog modal
     */
    postDialogModalSelector: string

    /**
     * the mount node for the post-affixing canvas
     */
    postAffixingCanvasSelector: string

    /**
     * the mount node for the comment
     */
    commentSelector: string

    /**
     * the mount node for the comment box
     */
    commentBoxSelector: string

    getActivePage(browser: Browser): Promise<Page | undefined>

    // open specific page
    openNewsFeed(page: Page): Promise<void>

    // account
    login(page: Page): Promise<void>
    logout(page: Page): Promise<void>

    // bio
    getBio(page: Page): Promise<string>
    setBio(page: Page, bio: string): Promise<void>
    unsetBio(page: Page): Promise<void>

    // post
    deletePost(page: Page, postId: string): Promise<void>
}

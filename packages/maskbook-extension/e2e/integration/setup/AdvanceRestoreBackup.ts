import * as dashboard from '../../commands/dashboard'
import * as restore from '../../commands/restore'
import * as helpers from '../../support/helpers'
import { SETUP_STORY_URL } from '../../support/constants'

beforeEach(async () => {
    // setup page
    await helpers.setupPage(page)

    // open restore page
    await dashboard.openSetupRestoreDatabaseAdvance(page)
})

afterEach(async () => {
    // reset dashboard
    await dashboard.reset(page)
})

describe(`${SETUP_STORY_URL}-Workflow1B:CoreInit/RestoreBackup`, () => {
    for (const record of [
        {
            title: 'advance mode - import success',
            name: 'test',
            words: 'tongue gallery cinnamon glove chapter garage very hybrid answer olympic duty sound',
            password: '12345678',
        },
        {
            title: 'advance mode - import fail',
            name: 'test',
            words: 'test',
            password: 'test',
        },
    ]) {
        it(record.title, async () => {
            await restore.fromPersona(page, record)
            if (record.title === 'advance mode - import success') {
                expect((await page.evaluate(() => location.hash)).includes('#/setup/connect-network')).toBeTruthy()
            }
        })
    }
})

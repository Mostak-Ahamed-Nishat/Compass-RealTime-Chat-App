const { chromium } = require('playwright')

const BASE = 'http://localhost:3001'
const shots = 'C:\\Users\\MOSTAK~1.NIS\\AppData\\Local\\Temp\\claude\\e--My-ChatApp\\f2f58928-9e18-452f-b87d-4e1c99855b72\\scratchpad'

function log(...args) {
  console.log(...args)
}

;(async () => {
  const browser = await chromium.launch()
  const consoleErrors = []
  const pageErrors = []

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => pageErrors.push(err.message))

  // 1. Landing page at /
  await page.goto(`${BASE}/`, { waitUntil: 'load' })
  await page.waitForTimeout(500)
  const heroHeading = await page.textContent('h1')
  log('Hero heading:', heroHeading)
  const ctaLabel = await page.locator('header button', { hasText: /Get Started|Open Dashboard/ }).first().textContent()
  log('Header CTA label (logged out):', ctaLabel?.trim())
  await page.screenshot({ path: `${shots}/01-landing-desktop.png`, fullPage: true })

  // scroll to check other sections rendered
  const sections = ['#features', '#how-it-works']
  for (const sel of sections) {
    const exists = await page.locator(sel).count()
    log(`Section ${sel} present:`, exists > 0)
  }

  // 2. Live chat demo autoplay - wait for at least one scripted message bubble
  await page.waitForTimeout(3500)
  const bubbleCountAfterAutoplay = await page.locator('#demo .rounded-2xl.px-4.py-2').count()
  log('Autoplay bubble count after ~3.5s:', bubbleCountAfterAutoplay)
  await page.screenshot({ path: `${shots}/02-live-demo-autoplay.png` })

  // Interact: type into the mini composer and send
  const demoInput = page.locator('#demo input[placeholder="Say hi — this actually works"]')
  await demoInput.fill('Hello from Playwright!')
  await demoInput.press('Enter')
  await page.waitForTimeout(300)
  const ownBubbleVisible = await page.getByText('Hello from Playwright!').count()
  log('Own message appended after send:', ownBubbleVisible > 0)
  await page.waitForTimeout(1300)
  const bubbleCountAfterReply = await page.locator('#demo .rounded-2xl.px-4.py-2').count()
  log('Bubble count after canned reply wait:', bubbleCountAfterReply)
  await page.screenshot({ path: `${shots}/03-live-demo-interactive.png` })

  // 3. Click header CTA -> should go to /login
  await page.locator('header button', { hasText: /Get Started/ }).first().click()
  await page.waitForURL('**/login', { timeout: 5000 })
  log('Navigated to:', page.url())
  await page.screenshot({ path: `${shots}/04-login-page.png` })

  // 4. Fill login form and submit
  const phone = '4155550100' + Math.floor(Math.random() * 900 + 100)
  await page.fill('input[type="tel"]', phone)
  await page.fill('input[type="text"]', 'Playwright Tester')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/chat', { timeout: 15000 })
  log('After login, navigated to:', page.url())
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${shots}/05-chat-dashboard.png` })

  // 5. Navigate back to / while logged in -> CTA should say Open Dashboard
  await page.goto(`${BASE}/`, { waitUntil: 'load' })
  await page.waitForTimeout(800)
  const ctaLabelLoggedIn = await page.locator('header button', { hasText: /Get Started|Open Dashboard/ }).first().textContent()
  log('Header CTA label (logged in):', ctaLabelLoggedIn?.trim())
  await page.screenshot({ path: `${shots}/06-landing-logged-in.png` })

  await page.locator('header button', { hasText: /Open Dashboard/ }).first().click()
  await page.waitForURL('**/chat', { timeout: 5000 })
  log('CTA (logged in) navigated to:', page.url())

  // 6. Logout -> should redirect to /
  const logoutBtn = page.locator('button[aria-label*="ogout" i], button[aria-label*="witch" i]')
  const logoutCount = await logoutBtn.count()
  log('Logout-ish buttons found:', logoutCount)
  if (logoutCount > 0) {
    await logoutBtn.first().click()
    await page.waitForTimeout(500)
    // there may be a dropdown/confirmation
    const confirmLogout = page.locator('text=/log ?out/i')
    if (await confirmLogout.count() > 0) {
      await confirmLogout.first().click()
    }
    await page.waitForURL(BASE + '/', { timeout: 5000 }).catch(() => {})
    log('After logout, URL:', page.url())
  }

  // 7. Mobile responsiveness check
  await context.close()
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mobilePage = await mobileContext.newPage()
  mobilePage.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push('[mobile] ' + msg.text()) })
  mobilePage.on('pageerror', (err) => pageErrors.push('[mobile] ' + err.message))
  await mobilePage.goto(`${BASE}/`, { waitUntil: 'load' })
  await mobilePage.waitForTimeout(1000)
  await mobilePage.screenshot({ path: `${shots}/07-landing-mobile-hero.png` })
  await mobilePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.35))
  await mobilePage.waitForTimeout(600)
  await mobilePage.screenshot({ path: `${shots}/08-landing-mobile-features.png` })
  await mobilePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await mobilePage.waitForTimeout(600)
  await mobilePage.screenshot({ path: `${shots}/09-landing-mobile-footer.png` })

  await mobileContext.close()
  await browser.close()

  log('\n=== Console errors ===')
  log(consoleErrors.length ? consoleErrors.join('\n') : '(none)')
  log('\n=== Page errors ===')
  log(pageErrors.length ? pageErrors.join('\n') : '(none)')
})().catch((err) => {
  console.error('SCRIPT FAILED:', err)
  process.exit(1)
})

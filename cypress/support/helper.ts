export function isMobile() {
  // eslint-disable-next-line no-magic-numbers
  return Cypress.config('viewportWidth') < 600
}

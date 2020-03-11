/* eslint-disable @cypress/dev/skip-comment,mocha/no-exclusive-tests */
/// <reference path="../../../../../../cli/types/index.d.ts" />
// @ts-check

const testState = {
  ranFirefox: false,
  ranChrome: false,
  ranChromium: false,
}

describe('per-test config', () => {
  after(function () {
    if (hasOnly(this.currentTest)) return

    if (Cypress.browser.family === 'firefox') {
      return expect(testState).deep.eq({
        ranChrome: false,
        ranChromium: false,
        ranFirefox: true,
      })
    }

    if (Cypress.browser.name === 'chrome') {
      return expect(testState).deep.eq({
        ranChrome: true,
        ranChromium: false,
        ranFirefox: false,
      })
    }

    if (Cypress.browser.name === 'chromium') {
      return expect(testState).deep.eq({
        ranChrome: false,
        ranChromium: true,
        ranFirefox: false,
      })
    }

    throw new Error('should have made assertion')
  })

  it('set various config values', {
    defaultCommandTimeout: 200,
    env: {
      FOO_VALUE: 'foo',
    },
  }, () => {
    expect(Cypress.config().defaultCommandTimeout).eq(200)
    expect(Cypress.config('defaultCommandTimeout')).eq(200)
    expect(Cypress.env('FOO_VALUE')).eq('foo')
  })

  it('does not leak various config values', {
  }, () => {
    expect(Cypress.config().defaultCommandTimeout).not.eq(200)
    expect(Cypress.config('defaultCommandTimeout')).not.eq(200)
    expect(Cypress.env('FOO_VALUE')).not.eq('foo')
  })

  it('can set viewport', {
    viewportWidth: 400,
    viewportHeight: 200,
  }, () => {
    expect(Cypress.config().viewportHeight).eq(200)
    expect(Cypress.config().viewportWidth).eq(400)
  })

  it('can specify only run in chrome', {
    browser: 'chrome',
  }, () => {
    testState.ranChrome = true
    expect(Cypress.browser.name).eq('chrome')
  })

  it('can specify only run in chromium', {
    browser: 'chromium',
  }, () => {
    testState.ranChromium = true
    expect(Cypress.browser.family).eq('chromium')
  })

  it('can specify only run in firefox', {
    browser: 'firefox',
  }, () => {
    testState.ranFirefox = true
    expect(Cypress.browser.name).eq('firefox')
  })

  describe('in beforeEach', () => {
    it('set various config values', {
      defaultCommandTimeout: 200,
      env: {
        FOO_VALUE: 'foo',
      },
    }, () => {
      expect(Cypress.config().defaultCommandTimeout).eq(200)
      expect(Cypress.config('defaultCommandTimeout')).eq(200)
      expect(Cypress.env('FOO_VALUE')).eq('foo')
    })

    beforeEach(() => {
      expect(Cypress.config().defaultCommandTimeout).eq(200)
      expect(Cypress.config('defaultCommandTimeout')).eq(200)
      expect(Cypress.env('FOO_VALUE')).eq('foo')
    })
  })

  describe('in afterEach', () => {
    it('set various config values', {
      defaultCommandTimeout: 200,
      env: {
        FOO_VALUE: 'foo',
      },
    }, () => {
      expect(Cypress.config().defaultCommandTimeout).eq(200)
      expect(Cypress.config('defaultCommandTimeout')).eq(200)
      expect(Cypress.env('FOO_VALUE')).eq('foo')
    })

    afterEach(() => {
      expect(Cypress.config().defaultCommandTimeout).eq(200)
      expect(Cypress.config('defaultCommandTimeout')).eq(200)
      expect(Cypress.env('FOO_VALUE')).eq('foo')
    })
  })

  describe('in suite', () => {
    describe('config in suite', {
      defaultCommandTimeout: 200,
    }, () => {
      it('test', () => {
        expect(Cypress.config().defaultCommandTimeout).eq(200)
      })

      it('test', () => {
        expect(Cypress.config().defaultCommandTimeout).eq(200)
      })

      it('test', () => {
        expect(Cypress.config().defaultCommandTimeout).eq(200)
      })
    })
  })

  describe('in nested suite', () => {
    describe('config in suite', {
      foo: true,
      defaultCommandTimeout: 200,
    }, () => {
      it('has config.foo', () => {
        expect(Cypress.config().foo).ok
        expect(Cypress.config().defaultCommandTimeout).eq(200)
      })

      describe('inner suite', {
        bar: true,
      }, () => {
        it('has config.bar', () => {
          expect(Cypress.config().bar).ok
        })

        it('has config.bar and config.foo', () => {
          expect(Cypress.config().bar).ok
          expect(Cypress.config().foo).ok
          expect(Cypress.config().defaultCommandTimeout).eq(200)
        })
      })
    })
  })

  describe('in double nested suite', () => {
    describe('config in suite', {
      foo: true,
    }, () => {
      describe('inner suite', { bar: true }, () => {
        it('has config.bar', () => {
          expect(Cypress.config().bar).ok
          expect(Cypress.config().foo).ok
        })
      })
    })
  })

  describe('in mulitple nested suites', {
    foo: false,
  }, () => {
    describe('config in suite', {
      foo: true,
    }, () => {
      describe('inner suite 1', { bar: true }, () => {
        it('has config.bar', () => {
          expect(Cypress.config().bar).ok
          expect(Cypress.config().foo).ok
        })
      })

      describe('inner suite 2', { baz: true }, () => {
        it('has config.baz', () => {
          expect(Cypress.config().bar).not.ok
          expect(Cypress.config().baz).ok
          expect(Cypress.config().foo).ok
        })
      })

      describe('inner suite 3', () => {
        it('has only config.foo', () => {
          expect(Cypress.config().bar).not.ok
          expect(Cypress.config().baz).not.ok
          expect(Cypress.config().foo).ok
        })
      })
    })
  })

  describe('in mulitple nested suites', () => {
    describe('config in suite', {
      foo: true,
    }, () => {
      describe('inner suite 1', { bar: true }, () => {
        it('has config.bar', () => {
          expect(Cypress.config().bar).ok
          expect(Cypress.config().foo).ok
        })
      })

      describe('inner suite 2', { baz: true }, () => {
        it('has config.bar', () => {
          expect(Cypress.config().bar).not.ok
          expect(Cypress.config().baz).ok
          expect(Cypress.config().foo).ok
        })
      })
    })
  })
})

function hasOnly (test) {
  let curSuite = test.parent
  let hasOnly = false

  while (curSuite) {
    if (curSuite._onlySuites.length || curSuite._onlyTests.length) {
      hasOnly = true
    }

    curSuite = curSuite.parent
  }

  return hasOnly
}
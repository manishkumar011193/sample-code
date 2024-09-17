/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
jest.mock('newrelic', () => ({}))

jest.mock('@inventory-service/server-logger-library', () => {
  const originalModule = jest.requireActual(
    '@inventory-service/server-logger-library'
  )
  const mockedLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
  }

  return {
    ...originalModule,
    serverLogger: {
      initialize: () => mockedLogger,
      configure: () => mockedLogger,
      getInstance: () => mockedLogger,
      traceContext: {
        traceparent: '00-93298328989238932893289-di8f89d8989sd98sd-01',
        tracestate: 'websocket-gateway=dsds9ds88ds8we88sd',
        correlationId: 'jediuew898w8dcu98w8u9',
        traceBreadcrumbs: 'websocket-gateway',
      },
    },
  }
})

import { serverLogger } from '@inventory-service/server-logger-library'

import pjson from '../../package.json'

import type { Logger, LoggerOptions } from '@inventory-service/server-logger-library'

const getOptions = (): LoggerOptions | undefined => {
  if (process.env.NODE_ENV !== 'production') {
    return {
      enabled: process.env.NOLOG !== 'true',
      level: 'debug',
    }
  } else {
    return {
      enabled: process.env.NOLOG !== 'true',
      level: 'info',
    }
  }
}

export const configureLambdaLogger = function (
  event: unknown,
  functionName: string
): Logger {
  const options = getOptions()

  serverLogger.initialize(
    {
      appType: 'AwsLambda',
      appName: `inventory-update-service/${functionName}`,
      appGroup: 'core',
      environment: process.env.ENVIRONMENT ?? 'local',
      region: process.env.AWS_REGION ?? 'eu-west-2',
      version: pjson.version,
    },
    options
  )

  return serverLogger.configure(event)
}

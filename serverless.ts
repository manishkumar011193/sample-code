import type { AWS } from '@serverless/typescript'

const serverlessConfiguration: AWS = {
  service: 'inventory-update-service',
  frameworkVersion: '3',
  useDotenv: true,
  custom: {
    stage: "${opt:stage, 'test'}",
    awsOrganizationId: 'test',
    awsRegion: 'eu-west-2',
    serviceAlias: 'inventory-update',
    resourcePrefix: '${self:custom.serviceAlias}',
    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: false,
      keepNames: true,
      packager: 'pnpm',
      watch: {
        pattern: ['src/**/*'],
      },
      exclude: ['newrelic'],
    },
    offline: {
      useChildProcesses: true,
    },
    lambdaLayer: {
      'eu-west-2':
        'arn:aws:lambda:eu-west-2:9023903299320:layer:AWS-Parameters-and-Secrets-Lambda-Extension:4',
      'us-east-1':
        'arn:aws:lambda:us-east-1:0939090233293:layer:AWS-Parameters-and-Secrets-Lambda-Extension:4',
      'us-east-2':
        'arn:aws:lambda:us-east-2:0939023909233:layer:AWS-Parameters-and-Secrets-Lambda-Extension:4',
      'us-west-2':
        'arn:aws:lambda:us-west-2:9320932923091:layer:AWS-Parameters-and-Secrets-Lambda-Extension:4',
    },
    lambdaInsights: {
      defaultLambdaInsights: true,
    },
    newRelic: {
      accountId: '${env:NEW_RELIC_ACCOUNT_ID}',
      apiKey: '${env:NEW_RELIC_API_KEY}',
      nrRegion: 'eu',
      logLevel: 'debug',
      enableFunctionLogs: true,
      disableLicenseKeySecret: true,
    },
  },
  plugins: [
    'serverless-esbuild',
    'serverless-offline',
    'serverless-plugin-lambda-insights',
    'serverless-newrelic-lambda-layers',
  ],
  provider: {
    name: 'aws',
    stage: '${self:custom.stage}',
    runtime: 'nodejs20.x',
    region: '${self:custom.awsRegion}' as
      | 'eu-west-2'
      | 'us-east-1'
      | 'us-east-2'
      | 'us-west-2',
    endpointType: 'regional',
    logRetentionInDays: 14,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
      ...(process.env.AWS_SECRET_ACCESS_KEY && {
        description:
          'Deployment for id: ${ssm:/${self:custom.resourcePrefix}-rest-api-deployment-id--${self:custom.stage}}',
      }),
      ...(process.env.AWS_SECRET_ACCESS_KEY && {
        restApiId:
          '${ssm:/${self:custom.resourcePrefix}-rest-api-id--${self:custom.stage}}',
      }),
      ...(process.env.AWS_SECRET_ACCESS_KEY && {
        restApiRootResourceId:
          '${ssm:/${self:custom.resourcePrefix}-rest-api-root-resource-id--${self:custom.stage}}',
      }),
    },
    stackTags: {
      Environment: '${self:custom.stage}',
      Repo: 'https://github.com/inventory-service/inventory-update-service',
      Project: '${self:service}',
      CreatedBy: 'serverless',
    },
    environment: {
      STAGE: '${self:custom.stage}',
      INV_CREDENITALS_SECRET_ARN: '${env:INV_CREDENITALS_SECRET_ARN}',
    },
    iam: {
    },
  },
  package: {
    individually: true,
  },
  functions: {
    inventoryUpdate: {
      handler: 'src/inventory-update-lambda.handler',
      timeout: 900,
      events: [
        {
          http: {
            method: 'post',
            path: 'inventory-update',
            cors: true,
          },
        },
      ],
    },
  },
}

module.exports = serverlessConfiguration

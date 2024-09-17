import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'

import { AvAdaptorUnAuthorizedError } from './inv-adaptor-exceptions'

import type { INVCredentialsSecret } from '../types/inventory-credentials-secret'

const parseSecretValue = (str = '') => {
  try {
    return JSON.parse(str) as INVCredentialsSecret
  } catch (e) {
    throw new AvAdaptorUnAuthorizedError(
      'Authentication failed : invalid credentials'
    )
  }
}

export async function getSecretValue(secretArn: string) {
  secretArn
  const client = new SecretsManagerClient({})

  const command = new GetSecretValueCommand({ SecretId: secretArn })

  const response = await client.send(command)

  const secretValue = response.SecretString

  return parseSecretValue(secretValue)
}

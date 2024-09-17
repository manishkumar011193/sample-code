import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'

import { getSecretValue } from './secret-provider'
import { AvAdaptorUnAuthorizedError } from './inv-adaptor-exceptions'

jest.mock('@aws-sdk/client-secrets-manager')

describe('getSecretValue', () => {
  const secretArn = 'testSecretArn'
  const secretValue = JSON.stringify({
    INV_API_KEY: 'testApiKey',
    INV_BASE_URL: 'https://example.com',
    INV_USER: 'testUser',
    INV_PASSWORD: 'testPassword',
    INV_ROLE: 'testRole',
  })

  beforeEach(() => {
    ;(SecretsManagerClient as jest.Mock).mockClear()
    ;(GetSecretValueCommand as unknown as jest.Mock).mockClear()
  })

  it('should return parsed secret value on successful fetch', async () => {
    const sendMock = jest.fn().mockResolvedValue({
      SecretString: secretValue,
    })

    ;(SecretsManagerClient as jest.Mock).mockImplementation(() => ({
      send: sendMock,
    }))

    const result = await getSecretValue(secretArn)

    expect(result).toStrictEqual({
      INV_API_KEY: 'testApiKey',
      INV_BASE_URL: 'https://example.com',
      INV_USER: 'testUser',
      INV_PASSWORD: 'testPassword',
      INV_ROLE: 'testRole',
    })
    expect(sendMock).toHaveBeenCalledWith(expect.any(GetSecretValueCommand))
  })

  it('should throw AvAdaptorUnAuthorizedError on invalid JSON', async () => {
    const sendMock = jest.fn().mockResolvedValue({
      SecretString: 'invalid json',
    })

    ;(SecretsManagerClient as jest.Mock).mockImplementation(() => ({
      send: sendMock,
    }))

    await expect(getSecretValue(secretArn)).rejects.toThrow(
      AvAdaptorUnAuthorizedError
    )
    expect(sendMock).toHaveBeenCalledWith(expect.any(GetSecretValueCommand))
  })

  it('should handle AWS SDK errors', async () => {
    const sendMock = jest.fn().mockRejectedValue(new Error('AWS SDK Error'))

    ;(SecretsManagerClient as jest.Mock).mockImplementation(() => ({
      send: sendMock,
    }))

    await expect(getSecretValue(secretArn)).rejects.toThrow('AWS SDK Error')
    expect(sendMock).toHaveBeenCalledWith(expect.any(GetSecretValueCommand))
  })
})

import type {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2WithRequestContext,
} from 'aws-lambda'

/**
 * API Gateway Event Fixture
 */
export class AwsApiGatewayEventFixture {
  /**
   * Generate an API Gateway proxy event V1 request
   */
  public static generateProxyEventV1Request(
    override?: Partial<APIGatewayProxyEvent>
  ): APIGatewayProxyEvent {
    return {
      resource: '/resource',
      path: '/resource',
      httpMethod: 'POST',
      body: JSON.stringify({ foo: 'bar' }),
      isBase64Encoded: false,
      ...override,
      headers: {
        ...(override?.headers
          ? override?.headers
          : {
              'content-type': 'application/json',
              'content-language': 'en-US',
            }),
      },
      multiValueHeaders: {
        ...(override?.multiValueHeaders
          ? override?.multiValueHeaders
          : {
              'content-type': ['application/json'],
              'content-language': ['en-US'],
            }),
      },
      pathParameters: {
        ...(override?.pathParameters
          ? override?.pathParameters
          : { 'path-parameter-key': 'path-parameter-value' }),
      },
      queryStringParameters: {
        ...(override?.queryStringParameters
          ? override?.queryStringParameters
          : { 'query-string-key': 'query-string-value' }),
      },
      multiValueQueryStringParameters: {
        ...(override?.multiValueQueryStringParameters
          ? override?.multiValueQueryStringParameters
          : { 'multi-value-query-string-key': ['bar'] }),
      },
      stageVariables: {
        ...(override?.stageVariables
          ? override?.stageVariables
          : { 'stage-variable-key': 'stage-variable-value' }),
      },
      requestContext: {
        accountId: 'accountId',
        apiId: 'apiId',
        path: '/resource',
        authorizer: {
          claims: {
            sub: 'sub',
          },
          scopes: ['scope'],
          ...override?.requestContext?.authorizer,
        },
        identity: {
          accessKey: 'accessKey',
          accountId: 'accountId',
          apiKey: 'apiKey',
          apiKeyId: 'apiKeyId',
          caller: 'caller',
          clientCert: {
            clientCertPem: 'clientCertPem',
            serialNumber: 'serialNumber',
            subjectDN: 'subjectDN',
            issuerDN: 'issuerDN',
            validity: {
              notAfter: 'notAfter',
              notBefore: 'notBefore',
            },
            ...override?.requestContext?.identity?.clientCert,
          },
          cognitoAuthenticationProvider: 'cognitoAuthenticationProvider',
          cognitoAuthenticationType: 'cognitoAuthenticationType',
          cognitoIdentityId: 'cognitoIdentityId',
          cognitoIdentityPoolId: 'cognitoIdentityPoolId',
          principalOrgId: 'principalOrgId',
          sourceIp: 'sourceIp',
          user: 'user',
          userAgent: 'userAgent',
          userArn: 'userArn',
          ...override?.requestContext?.identity,
        },
        domainName: 'domainName',
        domainPrefix: 'domainPrefix',
        extendedRequestId: 'extendedRequestId',
        httpMethod: 'GET',
        protocol: 'protocol',
        requestId: 'requestId',
        requestTime: 'requestTime',
        requestTimeEpoch: 0,
        resourceId: 'resourceId',
        resourcePath: 'resourcePath',
        stage: 'stage',
        ...override?.requestContext,
      },
    }
  }

  /**
   * Generate an API Gateway proxy event V2 request
   */
  public static generateProxyEventV2Request(
    override?: Partial<
      APIGatewayProxyEventV2WithRequestContext<
        Partial<APIGatewayEventRequestContextV2>
      >
    >
  ): APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2> {
    const now = Math.floor(Date.now() / 1000)

    return {
      version: '2.0',
      routeKey: '$default',
      rawPath: '/path',
      rawQueryString: 'queryString',
      cookies: ['cookie'],
      body: 'body',
      isBase64Encoded: false,
      ...override,
      headers: {
        ...(override?.headers
          ? override?.headers
          : {
              'Content-Type': 'application/json',
              'Content-Language': 'en-US',
            }),
      },
      queryStringParameters: {
        'query-string-key': 'query-string-value',
        ...override?.queryStringParameters,
      },
      requestContext: {
        accountId: 'accountId',
        apiId: 'apiId',
        domainName: 'domainName',
        domainPrefix: 'domainPrefix',
        http: {
          method: 'GET',
          path: '/path',
          protocol: 'HTTP/1.1',
          sourceIp: 'sourceIp',
          userAgent: 'userAgent',
          ...override?.requestContext?.http,
        },
        requestId: 'requestId',
        routeKey: '$default',
        stage: '$default',
        time: 'time',
        timeEpoch: now,
        ...override?.requestContext,
      },
      pathParameters: {
        ...(override?.pathParameters
          ? override?.pathParameters
          : { 'path-parameter-key': 'path-parameter-value' }),
      },
      stageVariables: {
        ...(override?.stageVariables
          ? override?.stageVariables
          : { 'stage-variable-key': 'stage-variable-value' }),
      },
    }
  }
}

import { createServiceBusClient } from '../../../app/fcp-messaging/service-bus-client';
import { ServiceBusClient } from '@azure/service-bus';
import WebSocket from 'ws';
import { HttpsProxyAgent } from 'https-proxy-agent';

jest.mock('@azure/service-bus');
jest.mock('ws');
jest.mock('https-proxy-agent');

describe('createServiceBusClient', () => {
  let mockSender, mockClient;

  beforeEach(() => {
    mockSender = {
      sendMessages: jest.fn().mockResolvedValue(),
      close: jest.fn().mockResolvedValue(),
    };

    mockClient = {
      createSender: jest.fn().mockReturnValue(mockSender),
      close: jest.fn().mockResolvedValue(),
    };

    ServiceBusClient.mockImplementation(() => mockClient);
    HttpsProxyAgent.mockImplementation(() => ({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a ServiceBusClient with correct connection string', () => {
    createServiceBusClient({
      host: 'test-host.servicebus.windows.net',
      username: 'user',
      password: 'pass',
      proxyUrl: 'http://proxy.example.com',
    });

    expect(ServiceBusClient).toHaveBeenCalledWith(
      'Endpoint=sb://test-host.servicebus.windows.net/;SharedAccessKeyName=user;SharedAccessKey=pass',
      {
        webSocketOptions: {
          webSocket: WebSocket,
          webSocketConstructorOptions: {
            agent: new HttpsProxyAgent('http://proxy.example.com') ,
          },
        },
      }
    );
  });

  it('should send a message using a created sender', async () => {
    const client = createServiceBusClient({
      host: 'host',
      username: 'user',
      password: 'pass',
      proxyUrl: 'http://proxy.example.com',
    });

    await client.sendMessage({ body: { field1: 'value1' } }, 'queue1');

    expect(mockClient.createSender).toHaveBeenCalledWith('queue1');
    expect(mockSender.sendMessages).toHaveBeenCalledWith({ body: { field1: 'value1' } });
  });

  it('should reuse an existing sender for the same address', async () => {
    const client = createServiceBusClient({
      host: 'host',
      username: 'user',
      password: 'pass',
      proxyUrl: 'http://proxy.example.com',
    });

    await client.sendMessage({ body: 'msg1' }, 'queue1');
    await client.sendMessage({ body: 'msg2' }, 'queue1');

    expect(mockClient.createSender).toHaveBeenCalledTimes(1);
    expect(mockSender.sendMessages).toHaveBeenCalledTimes(2);
  });

  it('should close all senders and the client', async () => {
    const client = createServiceBusClient({
      host: 'host',
      username: 'user',
      password: 'pass',
      proxyUrl: 'http://proxy.example.com',
    });

    await client.sendMessage({ body: 'close-test' }, 'queue1');
    await client.close();

    expect(mockSender.close).toHaveBeenCalled();
    expect(mockClient.close).toHaveBeenCalled();
  });
});

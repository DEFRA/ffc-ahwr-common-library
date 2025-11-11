import { ServiceBusClient } from '@azure/service-bus'
import WebSocket from 'ws'
import { HttpsProxyAgent } from 'https-proxy-agent'

export const createServiceBusClient = (options) => {
    const client = new ServiceBusClient(
        `Endpoint=sb://${options.host}/;SharedAccessKeyName=${options.username};SharedAccessKey=${options.password}`,
        {
            webSocketOptions: {
                webSocket: WebSocket,
                webSocketConstructorOptions: { agent: new HttpsProxyAgent(options.proxyUrl) }
            }
        }
    )

    const sendMessage = async (message, address) => {
        let sender

        try {
            sender = client.createSender(address)
            await sender.sendMessages(message)
        } finally {
            await sender.close()
        }
    }

    const sendMessages = async (messages, address) => sendMessage(messages, address)
    
    const close = async () => {
        await client.close()
    }

    return {
        sendMessage,
        sendMessages,
        close
    }
}

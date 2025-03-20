# ffc-ahwr-common-library

NPM module for providing common functionality to the AHWR applications

## Usage

### Installation

```
npm install --save ffc-ahwr-common-library

```

### Configuration

`name` - name of connection, if not supplied the address name will be used. This value is also used in App Insights tracing

`host` - Azure Service Bus namespace, for example, `myservicebus.servicebus.windows.net`

`useCredentialChain` - Boolean value for whether to authenticate connection with using Azure's credential chain. For example, set this to true if you wish to use [AAD Pod Identity](https://github.com/Azure/aad-pod-identity). If `false`, then `username` and `password` are required.

`username` - Azure Service Bus Shared Access Key name for authentication. Not required if `useCredentialChain` is `true`.

`password` - Azure Service Bus Shared Access Key value for authentication. Not required if `useCredentialChain` is `true`.

`type` - Azure Service Bus entity to connect to, allows `queue`, `sessionQueue`, `topic` or `subscription`.

`address` - Name of the Azure Service Bus queue, topic or subscription to connect to.

`topic` - Required for subscription connections only. The name of the topic the subscription belongs to.

`appInsights` - Application Insights module if logging is required

#### Example

```
const config = {
  host: 'myservicebus.servicebus.windows.net',
  useCredentialChain: false,
  username: 'mySharedAccessKeyName',
  password: 'mySharedAccessKey,
  address: 'mySubscription,
  type: 'subscription',
  topic: 'myTopic',
  appInsights: require('applicationinsights'),
  retries: 5
}
```

### Send event

Message objects must follow the below structure.

`name` - the name of the event

`properties`:

`id` - unique id to trace the events through the payments process

`sbi` - single business identifier

`checkpoint` - name of the service the event is raised from

`status` - the status of the payment eg. “in progress”, “completed”, “error”

`message` - description of the raised event

`data` - an object of the data associated to the raised event

#### Example usage

```
const { PublishEvent } = require('ffc-ahwr-common-library')

const eventPublisher = new PublishEvent(config)

await eventPublisher.sendEvent({
    name: 'Test event',
    properties: {
      id: '1234567890',
      sbi: '123456789',
      cph: '123/456/789`
      checkpoint: 'tests-service',
      status : 'success',
      action: {
        type: 'processing',
        message: 'Processing ahwr request',
        data: {
          test: 'test data'
        },
        raisedBy: 'test user`
      }
    }
  })

```

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

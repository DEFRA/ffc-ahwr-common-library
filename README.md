# ffc-ahwr-common-library

NPM module for providing common functionality to the AHWR applications

## Usage

### Installation

```
npm install --save ffc-ahwr-common-library

```

### Development setup

This project uses Husky to manage Git hooks for local development.

After cloning the repository, install dependencies:

```bash
npm install
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
import { PublishEvent } from 'ffc-ahwr-common-library'

const eventPublisher = new PublishEvent(config)

await eventPublisher.sendEvent({
    name: 'Test event',
    properties: {
      id: '1234567890',
      sbi: '123456789',
      cph: '123/456/789`,
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

### Service Bus

`createServiceBusClient` wraps `@azure/service-bus` for sending messages to a topic/queue, subscribing to a topic, and receiving session messages.

```js
import { createServiceBusClient } from "ffc-ahwr-common-library";

const serviceBusClient = createServiceBusClient({
  host, // e.g. 'my-namespace.servicebus.windows.net'
  username,
  password,
  proxyUrl, // optional, routes the AMQP connection over a WebSocket proxy
});

await serviceBusClient.sendMessage({ body: payload }, "my-topic");

serviceBusClient.subscribeTopic({
  topicName: "my-topic",
  subscriptionName: "my-subscription",
  processMessage: (message, receiver) => {
    /* ... */
  },
  processError: (args) => {
    /* ... */
  },
});

await serviceBusClient.close();
```

#### Local development (Service Bus Emulator)

To develop against a local [Azure Service Bus Emulator](https://learn.microsoft.com/en-us/azure/service-bus-messaging/overview-emulator) instead of a real namespace, pass `useDevelopmentEmulator: true`. This appends `;UseDevelopmentEmulator=true;` to the connection string, which the SDK uses to connect over plain AMQP on port `5672` rather than AMQPS - matching the ports the emulator listens on.

```js
const serviceBusClient = createServiceBusClient({
  host: "localhost", // or 'servicebus-emulator' etc. when running in Docker Compose
  username: "RootManageSharedAccessKey",
  password: "SAS_KEY_VALUE",
  useDevelopmentEmulator: true,
});
```

The topics/queues/subscriptions you send to or subscribe from must be pre-provisioned in the emulator's own config file (mounted into the container) - the emulator doesn't create entities on demand. See `ahwr-payment-proxy`'s `compose.yml` and `compose/servicebus-emulator-config.json` for a working example, including the SQL Edge container the emulator needs for its own metadata.

## Dependabot

Currently setup to work into four groups, so we don't have PRs per package. The updates run once a week, on a Monday. Except for the security group, which is advisory-triggered and ignores the schedule.

## SonarCloud

This project is set up to integrate with sonarcloud, and scans will be performed on all pull requests, and on
publish to main branch. We follow the quality gates as per DEFRA standards, and if coverage falls below the
acceptable level, or new issues are introduced the build will fail.

## Making changes

Refer to the [contributing documentation](CONTRIBUTING.md).

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

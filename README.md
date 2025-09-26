# ffc-ahwr-common-library

NPM module for providing common functionality to the AHWR applications

## Usage

### Installation

```
npm install --save ffc-ahwr-common-library

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

## Making changes

To make changes to this library, please follow the steps below:
1. Make the changes as usual to the codebase.
2. Run `npm run version:create` OR `npx @changesets/cli` to create a changeset file. This will guide you through the process of documenting your changes.`
3. Ensure the changeset .md file is added to the commit (should be done automatically now).
4. Push to branch, and create a pull request.
5. Github actions will verify the build
6. After review, merge the pull request.
7. Github action will automatically increment the version and publish to NPM.



## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

import { createMessage } from "../../../app/fcp-messaging/create-message";

describe('createMessage', () => {
  it('should create a message object with body, type, source and options', () => {
    const message = createMessage({ field1: 'value1', field2: 'value2' }, 'type-value', 'source-system', { option1: 'option1-value'});

    expect(message).toEqual({
      body: { field1: 'value1', field2: 'value2' },
      type: 'type-value',
      source: 'source-system',
      option1: 'option1-value'
    });
  });
});

---
"ffc-ahwr-common-library": minor
---

Add dead-letter queue action helpers to the `sqsClient`: `getDeadLetterSourceQueues` and
`isDeadLetterQueue` (both resolved authoritatively via `ListDeadLetterSourceQueues`, no naming
convention), and `applyDlqActions` to delete or reapply (redrive to the resolved source queue)
individual DLQ messages matched by MessageId.

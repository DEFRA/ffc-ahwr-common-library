---
"ffc-ahwr-common-library": minor
---

Add `useDevelopmentEmulator` option to `createServiceBusClient`, so consuming services can connect to a local Azure Service Bus Emulator for development instead of a real namespace. When `true`, `;UseDevelopmentEmulator=true;` is appended to the connection string; existing callers are unaffected.

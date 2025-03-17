module.exports = (appInsights, eventMessages) => {
  if (appInsights?.defaultClient) {
    eventMessages.forEach((eventMessage) => {
      appInsights.defaultClient.trackEvent(eventMessage);
    });
  }
};

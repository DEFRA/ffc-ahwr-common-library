module.exports = (appInsights, eventMessage) => {
  if (appInsights !== undefined && appInsights.defaultClient !== undefined) {
    appInsights.defaultClient.trackEvent(eventMessage)
  }
}

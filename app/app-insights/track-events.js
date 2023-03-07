module.exports = (appInsights, eventMessages) => {
    if (appInsights !== undefined && appInsights.defaultClient !== undefined) {
        eventMessages.forEach(eventMessage => {            
            appInsights.defaultClient.trackEvent(eventMessage)
        });
    }
  }
  
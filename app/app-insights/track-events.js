module.exports = (appInsights, eventMessage) => {
    if (appInsights !== undefined && appInsights.defaultClient !== undefined) {
        eventMessage.forEach(event => {            
            appInsights.defaultClient.trackEvent(event)
        });
    }
  }
  
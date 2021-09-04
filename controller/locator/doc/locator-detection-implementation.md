# Correlate identified locator to click
## Intent
After correlated existing locator with UI elemnt, get this information back to the system in order to see if next event match any existing locator or not. 

Also, based on the locator correlation inforamtion, decide what are the avilable customized function that is applicable in current screen

## Approach
* After find the matched locator through browser javascript, add attribute (bluestone-locator=). The value is equal to array of arry. Example [[aspen plus,btn],[hysys,btn]]. In this case, we know list of available item.
* Before the in-browser agent is called, puppeteer will find all elements with attribute (bluestone-locator) and get its value. Based on that, it will generate function that is related to current page.
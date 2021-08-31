# Locator Correlation Strategy
## Goal
Correlate existing locator with what is visible on screen.

## Correlation Strategies
| Stragy               | Detail                                                                                                                                          | Pros                                                  | Cons                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------- |
| Search All Locator   | store locator as an array, search locator one by one until finds correlation or no correlation being found                                      | Reliable, can help self-healing feature in the future | Time-consuming         |
| Create page snapshot | store locators in an array, create a snapshot of all locators in the page. compare snapshot against existing locators to find right correlation | Time-consumption is managable                         | difficult to implement |


## Initial Decision - Create Page Snapshot
Based on the correlation, seems like page-snapshot is a way to go. We will need to understnad how to create a snapshot of visible element

## Final Decision - Search All Locators with Browser Engine
I decide to go for 1st approach. Couple reasons
* Implementation - I have no clue how to why tag name stop working after searlize document into a xml and then parse it back
* Performance - It seems like in-browser xpath evaluation is extremely efficient. We are able to complete 50000 evaluation within 55s. This is 1000 locator/s In the real-world I doubt if I will evaluate this many locators. Even though we save 5 xpath per locator, that is 10K elements. By no mean we are going to have so many element. We don't want to use puppeteer.$x() function here because this is extremely slow. the speed is 306 locator/s. This is slow.
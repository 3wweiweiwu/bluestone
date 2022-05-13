# Intent
Test application at a engine level to make sure the main workflow works as expected

# What is the lifecycle of mocha
before->beforeEAch->test itself->afterEach->after

# BeforeEach
* Launch the test website
* Launch bluestone backend

# AfterEach
* Stop Bluestone backend
  * Stop bluestone recording
  * Close Bluestone ap
* Stop the testing site

# What is the test site we setup
## Intent of Test Site
Test Bluestone's main business logic in a robust and controllable fashion
## Technology Stack
* NodeJS
* Express
* HTML
* SocketIO

## The path to the test site
test\site

## Main Folder
* public/site 
  * Place to store test web page
* public/javascript 
  * 

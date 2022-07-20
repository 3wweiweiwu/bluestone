# Intent
Can we use Bluestone to test Bluestone?

# Current Test Architect
1. Environment Preparation
   1. Set up Bluestone Backend
   2. Setup test website
   3. Send request to test website to simualte opeartion
   4. Call Bleustone Agent

2. Use Puppeteer to test Bluestone Agent's UI operation
   1. Use Puppeteer to interact with Bluestone
   2. Send API Request to Bluestone backend and check if desired change has been made

# How can we make this happen?
1. Environment Preparation (Bluestone from local source)
   1. Give test a long timeout (999999s)
   2. Set up Bluestone Backend
   3. Setup test website
   4. Send request to test website to simualte opeartion
   5. Call Bleustone Agent
   6. Wait here for a long timeout
2. Launch bluestone and record the workflow (Bluestone from global scope)
   1. How to avoid 2 bluestone fight with each other?
      1. ensure two bluestone are listening to different ports than 3600/3607
   2. Procedure
      1. Install bluestone globally in the local machine
      2. Launch Bluestone using any existing bluestone automation project
      3. bluestone start ./project --port 3605
3. Take the script from Bluestoen back to the integration test
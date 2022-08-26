# Env Variable List
## BLUESTONE_RUN_ID
### Usage
It's used to specify the run id for bluestone. It will trigger auto-healing when it is specified
### Expected Data Type: String
### Input Sample
* '12345'
* 'asbds'

## BLUESTONE_EXECUTION_OPERATION_TIMEOUT_MS
### Usage
    wait for a global timeout before we proceed. In some app, it will render ui at first, after ui is renderded, it will start to load context. The challenge is that it takes 2-3s to load context after ui is rendered. if we extract value at that time, it will give us wrong value   as a workaround, we will wait for a timeout before we interact with it so that the information could be loaded
### Expected Data Type: Integer
### Input Sample
* '1000'
* '5000'

## BLUESTONE_URL
### Usage
Redirect url to value specified instead of using stock url. It is useful when we record test in one environment and execute that in other eneivonrment
### Expected Data Type: string
### Input Sample
* 'https://localhost:3601'
* 'http://www.google.com'

# LogEvent Function
## Common Logic
    * Parse potential locator match from string to json
    * Parse Auto-healing infroamtion from string to json
    * Parse potential frame match from string to json
    * Populate html snapshot
    * Populate current pciture
    
## Whenever user press ctrl+q/alt+q, it will call bluestone console
* Pause Auto Html Capture
* Pause Browser Recording
* Pause Picture capture
* Record the picture of element we hover mouse over
* Refresh active function in the operation view so that we can only show relevant function
* Provide recommended locator to curent element we select
* 
## Record current step
  * Save parsed information into a RecordingStep Object
  * Push the step into locator library
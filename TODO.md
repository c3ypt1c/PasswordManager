## ToDo:

 - Testing
 - Convert JSON to Base64 to save space. Currently representing 1 byte can take up to 4bytes.
 - Password Generator
 - Container / Slot Settings
 - Make dangerous buttons have feedback
 
### Bugs:

 - Current implementation of PBKDF2 is blocking. Implement async PBKDF2 instead
 - Current container implementation does not implement a HMAC. Instead it tries to decode JSON. If successful, the program carries on as usual. Implement HMAC to stop data corruption.

# PasswordManager

This is my final year university project.

The *Internet Nomad* password manager is built upon research into encryption types. It also focuses on the fact that a person maybe have one or more identities online, thus allowing TOR users in particular to benefit from many identities which can't (if the user is careful) be linked together. It also offers unconventional recovery methods to allow users to recover from catastrophe. 

There is a [TODO](TODO.md) here. 

### Current Features
 - You can choose your own encryption: AES or Blowfish ciphers with PBKDF2 or Argon2 key derivation functions
 - Strongest security that adapts to your hardware and patience:
   - The program adapts the number of rounds to the time needed to unlock based on a benchmark
   - The program can adapt to the amount of RAM available (Argon2 specific)
 - Separate identities are available
 - Shared recovery method
 - Paper recovery method

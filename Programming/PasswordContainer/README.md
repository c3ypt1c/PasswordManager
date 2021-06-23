# InternetNomad Password Manager
The InternetNomad password manager is built upon research into encryption types. It also focuses on the fact that a person maybe have one or more identities online, thus allowing TOR users in particular to benefit from many identities which can't (if the user is careful) cannot be linked together.

### Features
 - You can choose your own encryption
 - Strongest security that adapts to your hardware and patience
 - Separate identities are available
 - Shared recovery method
 - Paper recovery method

### mcrypt deprecated library
There is a deprecated library in use: mcrypt. The authors are aware of this, however this is the only Serpent implementation for NodeJS. The successor to mcrypt, cryptian, does not support Serpent and so it's impossible to be used. In future version of this password manager, Serpant will either be replaced by another library or implemented from scratch.

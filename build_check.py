#!/usr/bin/python3
"""
This file generates index_template.js into index.js.
It basically modifies the template file into becoming different things depending on the usage.

Current argvs setup the template file with: 
 1 - Debug Mode - When this argv is true, the console shows at launch
 2 - Do tests - When this argv is true, the program runs tests instead of the main program

"""

from sys import argv


buildString = argv[1]
testString = argv[2]

print("Debug:", buildString)
print("Test: ", testString)

with open("index_template.js") as f:
    fd = f.read()

fd = fd.replace("${debug}", buildString)

if testString != "true":
    testString = "Pages/PasswordManager.html"
else:
    testString = "Pages/Tests.html"

fd = fd.replace("${page}", testString)

with open("index.js", "w") as f:
    f.write(fd)


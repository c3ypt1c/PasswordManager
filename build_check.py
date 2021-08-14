from sys import argv
buildString = argv[1]
testString = argv[2]
print("Debug:", buildString)

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


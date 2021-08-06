from sys import argv
buildString = argv[1]
print("Debug:", buildString)

with open("index_template.js") as f:
    fd = f.read()

fd = fd.replace("${debug}", buildString)

with open("index.js", "w") as f:
    f.write(fd)


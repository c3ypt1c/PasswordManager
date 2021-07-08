with open("wordlist.txt") as f:
    fd = f.read().split("\n")


with open("src/Recovery/WordLists.ts", "w") as f:
    f.write("export class Words1 {words = [" + "".join(['"' + word + '",' for word in fd]) + "]; }")


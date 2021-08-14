"""
This file generates the wordlist class /src/Recovery/WordList.ts. It is needed because
the Recovery works by using the wordlist to assign 16 bits to each word. This program simply 
makes a valid ts string array containing every word in the wordlist, even if then rejected 
at runtime.  
"""

with open("wordlist.txt") as f:
    fd = f.read().split("\n")


with open("src/Recovery/WordLists.ts", "w") as f:
    f.write("export class Words1 {words = [" + "".join(['"' + word + '",' for word in fd]) + "]; }")


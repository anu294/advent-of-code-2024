import re
import numpy

f = open("inputs/input2.txt", "r")

data = f.readlines()

total = 0
total2 = 0

# Open a file to log the arrays
with open("output.txt", "w") as log_file:

    def checkone(a):
        b = sorted(a)
        c = sorted(a, reverse=True)
        if a == b:
            this = a[0]
            for j in a[1:]:
                if j == this or j > this + 3:
                    return False
                this = j
        elif a == c:
            this = a[0]
            for j in a[1:]:
                if j == this or j < this - 3:
                    return False
                this = j
        else:
            return False
        return True

    def checkrem(a):
        safe = False
        for i in range(len(a)):
            if checkone(a[:i] + a[i + 1 :]):
                safe = True
                break
        return safe

    for i in data:
        a = [int(n) for n in i.split(" ")]
        if checkone(a):
            total += 1
            log_file.write(" ".join(map(str, a)) + "\n")  # Log arrays contributing to total
        elif checkrem(a):
            total2 += 1
            log_file.write(" ".join(map(str, a)) + "\n")  # Log arrays contributing to total2

print("safe:", total, "\nsafe with removal:", total2, "\ntotal:", total + total2)

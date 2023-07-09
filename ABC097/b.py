X = int(input())

m = 1

for i in range(2,X+1):
    x = i * i
    while x <= X:
        m = max(x, m)
        x = x * i

print(m)
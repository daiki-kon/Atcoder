x = int(input())

sum = 100
c = 0
while sum < x:
  sum = int(sum * 1.01)
  c = c + 1

print(c)
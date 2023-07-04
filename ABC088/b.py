n = input()
a = list(map(int, input().split()))

alice = 0
bob = 0

a.sort(reverse=True)
for i in range(0,len(a),2):
    alice += a[i]

    if i + 1 >= len(a):
        break
    bob += a[i + 1]

print(alice - bob)
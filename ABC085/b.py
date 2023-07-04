n = int(input())
num_list = [int(input()) for _ in range(n)]

num_list = sorted(num_list)

c = 0
pre = 0
for i in num_list:
    if pre >= i:
        continue
    
    c += 1
    pre = i

print(c)
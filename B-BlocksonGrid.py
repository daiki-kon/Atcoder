from collections import Counter
H,W = map(int,input().split())

num_list = []
for i in range(H):
    num_list.append(list(map(int,input().split())))

c = []
for i in num_list:
  c.append(min(i))

t = min(c)


k = 0
for i in range(H):
  for j in range(W):
    if t != num_list[i][j]:
      if t > num_list[i][j]:
        k = k + t - num_list[i][j]
      else:
        k = k + num_list[i][j] - t
print(k) 


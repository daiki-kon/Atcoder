import numpy as np
A = []
for i in range(3):
  A.append(list(map(int,input().split())))
n = int(input())  
b = [int(input()) for _ in range(n)]


flag = False
At = np.array(A).T.tolist()

for i in b: 
  for a in A:
    if i in a:
      a[a.index(i)] = -1

c = 0 
sum = 0

for a in A:
  if all( i == -1 for i in a):
    flag = True
  if a[c] == -1:
    sum = sum + 1
  c = c + 1

if sum == 3: 
  flag = True


At = np.array(A).T.tolist()
c = 2
sum = 0
for a in At:
  if all( i == -1 for i in a):
    flag = True
  if a[c] == -1:
    sum = sum + 1
  c = c - 1


if sum == 3: 
  flag = True

if flag == True:
  print('Yes')
else:
  print('No')

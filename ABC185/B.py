N , M ,T  = map(int, input().split())
AB = []
for i in range(M):
    AB.append(list(map(int,input().split())))

c = 0
t = 0
mN = N

for ab in AB:
  if t != 0:
    N = N - (ab[0] - t)
  else:
    N = N - ab[0]
  if( N <= 0):
    print('No')
    exit()
  N = N + ab[1] - ab[0]
  t = ab[1]
  if N >= mN:
      N = mN

N = N - (T - t)
if( N <= 0):
  print('No')
else:
  print('Yes')
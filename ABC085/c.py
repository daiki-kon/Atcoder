N, Y = map(int, input().split())

ares, bres, cres = -1, -1, -1

for a in range(N+1):
    for b in range(N+1):
        c = N - a - b

        if c < 0 or c > N:
            continue

        if a*10000 + b*5000 + c*1000 == Y:
            ares, bres, cres = a, b, c

        
print(ares, bres, cres)
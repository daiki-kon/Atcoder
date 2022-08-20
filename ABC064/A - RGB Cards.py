r,g, b = map(str, input().split())

n = int(r + g + b)


print("YES" if  n % 4 == 0 else "NO")
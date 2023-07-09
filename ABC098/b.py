N = int(input())
S = input()


max_count = 0
for i in range(1, N):
    X = S[:i]
    Y = S[i:]
    
    c = 0
    checked = []
    for j in X:
        if j in Y and j not in checked:
            checked.append(j) 
            c += 1
    max_count = max(max_count, c)

print(max_count)

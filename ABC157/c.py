N, M = map(int, input().split())
num_list = []
for i in range(M):
    num_list.append(list(map(int,input().split())))


ans = -1 
for i in range(1000):
    
    c = str(i)
    print
    if  len(c) == N  and  all([ str(num_list[j][1]) == c[num_list[j][0] -1]  for j in range(M)]):
        ans = c
        break
    
print(ans)

    





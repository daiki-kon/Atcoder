S = input()
T = input()

sum = 0 
for i in range(len(S)):
  if S[i] != T[i]:
    sum = sum + 1
print(sum)
n, a,b = map(int, input().split())


total = 0
for i in range(1, n  + 1): 
  keta = [ int(i) for i in str(i)]

  s = sum(keta)
  

  if a <= s <= b:
    total = total + i
  
print(total)
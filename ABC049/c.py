"""
ABC 049 C - 白昼夢
"""

S = input()

l  = ["dream", "dreamer", "erase", "eraser"]

while len(S) > 0:
    
    if S[-len(l[0]):] == l[0]:
        S = S[:-len(l[0])]
    elif S[-len(l[1]):] == l[1]:
        S = S[:-len(l[1])]
    elif S[-len(l[2]):] == l[2]:
        S = S[:-len(l[2])]
    elif S[-len(l[3]):] == l[3]:
        S = S[:-len(l[3])]
    else:
        print("NO")
        exit()

print("YES")

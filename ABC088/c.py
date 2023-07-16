"""
ABC088 C - Takahashi's Information
"""

C = []
for i in range(3):
    C.append(list(map(int,input().split())))

for a1 in range(0,101):
    for a2 in range(0,101):
        for a3 in range(0,101):
            b1 = C[0][0] - a1
            b2 = C[0][1] - a1
            b3 = C[0][2] - a1

            if C[0][0] == a1 + b1 and C[0][1] == a1 + b2 and C[0][2] == a1 + b3 and \
              C[1][0] == a2 + b1 and C[1][1] == a2 + b2 and C[1][2] == a2 + b3 and \
              C[2][0] == a3 + b1 and C[2][1] == a3 + b2 and C[2][2] == a3 + b3:
                print("Yes")
                exit()

print("No")


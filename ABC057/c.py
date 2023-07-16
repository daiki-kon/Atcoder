"""
ABC057 C - Digits in Multiplication

整数 N が与えられます。ここで、2 つの正の整数 A,B に対して、F(A,B) を「10 進表記における、A の桁数と 
B の桁数のうち大きい方」と定義します。
例えば、F(3,11) の値は、3 は 1 桁、11 は 2 桁であるため、F(3,11)=2 となります。2 つの正の整数の組 
(A,B) が N=A×B を満たすように動くとき、F(A,B) の最小値を求めてください。
"""

import math

N = int(input())

divisors = []
for i in range(1, int(math.sqrt(N))+1):  
    if N % i == 0:
        divisors.append(i)
        if i != N // i:  # iが平方根でない場合は、もう一方の約数も追加する
            divisors.append(N // i)

ketasuu = []
for A in divisors:
    B = N // A
    
    keta_A = len(str(A))
    keta_B = len(str(B))

    if keta_A > keta_B:
        ketasuu.append(keta_A)
    else:
        ketasuu.append(keta_B)

print(min(ketasuu))


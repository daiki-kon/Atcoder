"""
ABC 096 C - Half and Half

ファーストフードチェーン「ピザアット」のメニューは「A ピザ」「B ピザ」「AB ピザ」の 
3 種類です。A ピザと B ピザは全く異なるピザで、これらをそれぞれ半分に切って組み合わせたものが AB ピザです。A ピザ、B ピザ、AB ピザ 
1 枚あたりの値段はそれぞれ 
A 円、
B 円、
C 円です。

中橋くんは、今夜のパーティーのために A ピザ 
X 枚と B ピザ 
Y 枚を用意する必要があります。これらのピザを入手する方法は、
A ピザや 
B ピザを直接買うか、AB ピザ 
2 枚を買って A ピザ 
1 枚と B ピザ 
1 枚に組み替える以外にはありません。このためには最小で何円が必要でしょうか？なお、ピザの組み替えにより、必要な量を超えたピザが発生しても構いません。


"""

A, B, C, X, Y = map(int, input().split())
      

def min_cost(A, B, C, X, Y):
    # ABピザを2枚買うのがAピザやBピザを個別に買うより安い場合
    if A + B > 2 * C:
        # AピザとBピザの必要枚数が等しい場合
        if X == Y:
            return 2 * C * X
        # Aピザの方が必要枚数が多い場合
        elif X > Y:
            # Bピザの数だけABピザを2枚買う
            # そして残りのAピザは個別に買うか、またはABピザを2枚買う
            return 2 * C * Y + min(A, 2 * C) * (X - Y)
        # Bピザの方が必要枚数が多い場合
        else:
            # Aピザの数だけABピザを2枚買う
            # そして残りのBピザは個別に買うか、またはABピザを2枚買う
            return 2 * C * X + min(B, 2 * C) * (Y - X)
    # ABピザを2枚買うのがAピザやBピザを個別に買うより高い、または等しい場合
    else:
        return A * X + B * Y

# 最小の金額を計算して出力
minimum_cost = min_cost(A, B, C, X, Y)
print(minimum_cost)
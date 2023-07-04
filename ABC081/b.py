def all_even(_list):
    for i in _list:
        if i % 2 != 0:
            return False
        
    return True


n = input ()
a = list(map(int,input().split()))

c = 0
while all_even(a) is True:
    a = [i // 2 for i in a]
    c += 1


print(c)


from email.mime import base
from os import device_encoding


def input_int():
    return int(input())


def input_map_int():
    return map(int, input().split())


def input_list_int():
    return list(int, input().split())


def to_base10(oct):
    return int(str(oct), 8)


def to_base9(dec):
    r = []

    while dec >= 9:
        r.append(dec % 9)
        dec = dec // 9

    r.append(dec)
    r.reverse()

    t = 0

    for i in r:
      t = t * 10 + i

    return t


def main():
    n, k = input_map_int()

    for i in range(k):
        base10 = to_base10(n)
        # print(base10)

        base9 = to_base9(base10)
        # print(base9)

        # replace

        n = int(str(base9).replace("8", "5"))

    print(n)


if __name__ == "__main__":
    main()

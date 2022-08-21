def input_int():
    return int(input())


def input_map_int():
    return map(int, input().split())


def input_list_int():
    return list(int, input().split())


def main():
    a, b, k = input_map_int()
    r = []

    if b - a + 1 < k:
        for i in range(a, b + 1):
            print(i)
        return

    for i in range(a, a + k):
        r.append(i)

    for j in range(b - k + 1, b + 1):
        r.append(j)

    for i in sorted(list(set(r))):
        print(i)


if __name__ == "__main__":
    main()

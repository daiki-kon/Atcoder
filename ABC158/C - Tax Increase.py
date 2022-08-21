def input_int():
    return int(input())
  
def input_map_int():
    return map(int, input().split())

def input_list_int():
    return list(int, input().split())

def main():
    a, b = input_map_int()

    for i in range(10001):
      if i * 8 // 100 == a and i * 10 // 100 == b:
        print(i)
        return

    print(-1)

if __name__ == "__main__":
    main()

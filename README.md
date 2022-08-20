# For Atcoder
Atcoderので使える入力とかPythonの機能のメモとか

## 入力

```py
# 基本
val = input()

# 入力値をintとして扱うとき
val = int(input())

# 1行に複数の値がある時(スペース区切り)
val1, val2 = input().split(' ')

# 1行に複数の値があり、intとして扱いたいとき(スペース区切り)
val1, val2 = list(map(int,input().split(' ')))
```

[参考](https://qiita.com/all/items/1f519aff0cdc3cf16284)


## 組み込み関数

```py
# 配列の要素すべてが条件を満たすか？ JavaScriptにおけるeveryみたいな
lst = [1, 2, 3]

print(all(elem % 2 == 0 for elem in lst)) # => False

print(all(elem <= 3 for elem in lst)) # => True



```
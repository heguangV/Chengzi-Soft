
def happy(x: int) -> int:
    """
    计算一个整数各位数字的平方和。
    如果结果为1，返回1，否则返回平方和。
    """
    total = 0
    for digit in str(x):
        total += int(digit) ** 2
    if total == 1:
        return 1
    else:
        return total

def main():
    x = int(input("请输入一个整数："))
    t = 1  # 计数器，防止死循环
    while happy(x) != 1:
        x = happy(x)
        t += 1
        if t > 50:
            print("False")
            return
    print("True")

if __name__ == "__main__":
    main()
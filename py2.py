def judge(x):
    if x == 1:
        return False
    else:
        for i in range(2, int(x ** 0.5) + 1):
            if x % i == 0:
                return False
        return True

def main():
    x = int(input())
    a = 0
    b = 1
    while a < x:
        if judge(b):
            b1 = int(str(b)[::-1])
            if b1 != b and judge(b1):
                print(b, end=" ")
                a += 1
        b += 1

if __name__ == "__main__":
    main()

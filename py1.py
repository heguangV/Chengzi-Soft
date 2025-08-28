def step(x):
    if x == 2:
        return 2
    elif x == 1:
        return 1
    else:
        return step(x - 1) + step(x - 2)

def main():
    x = int(input())
    print(step(x))

if __name__ == "__main__":
    main()

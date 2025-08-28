if __name__ == '__main__':
    x=int(input())
    a=[]
    a.append(abs(x))
    if x>=0:
        a.append(abs(x + 10))
        a.append(abs(x - 10))
        a.append(abs(x * 10))
    else:
        a.append(-abs(x - 10))
        a.append(-abs(x + 10))
        a.append(-abs(x * 10))
    print(*a,sep=" ")
    

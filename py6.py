def change(x):
    if x>=65 and x<=90:
        if x+3>90:
            return chr(x-26+3)
        else:
            return chr(x+3)
    elif x>=97 and x<=122:
        if x+3>122:
            return chr(x-26+3) 
        else:
            return chr(x+3)
    else:
        return chr(x)
if __name__ == '__main__':
    x=input()
    message=""
    for i in x:
        message=message+change(ord(i))
    print(message)
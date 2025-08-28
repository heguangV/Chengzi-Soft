def cal(x):
    n= 1/(16**x)*(4/(8*x+1)-2/(8*x+4)-1/(8*x+5)-1/(8*x+6))
    return n

x=int(input())
s=0
for i in range(0,x+1):
    s+=cal(i)
print(f"{s:.8f}")
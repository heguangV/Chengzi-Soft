import turtle as t

def tree(branch_len):
    if branch_len > 5:
        t.forward(branch_len)
        t.right(20)
        tree(branch_len - 15)
        t.left(40)
        tree(branch_len - 15)
        t.right(20)
        t.backward(branch_len)

# 设置
t.left(90)
t.penup()
t.backward(100)
t.pendown()
t.color("green")
t.pensize(2)

# 绘制
tree(150)
t.done()
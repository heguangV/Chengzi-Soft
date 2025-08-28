def morse_code_encryption(text):
    """接收明文字符串为参数，返回用摩斯密码加密后的字符串。"""
    
    ls = (".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---", "-.-", ".-..", "--", "-.", "---",
          ".--.", "--.-", ".-.", "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--..")
    #=======================================================
    # 补充你的代码
    #=======================================================
    text=text.lower()
    message=""
    for i in text:
        if i.isalpha():
            message=message+ls[ord(i)-97]
        else:
            message=message+i
    return message

if __name__ == '__main__':
    plaintext = input()  # 输入一个字符串
    print(morse_code_encryption(plaintext))  # 调用函数，并输出返回值

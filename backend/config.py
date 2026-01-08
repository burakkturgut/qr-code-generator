import datetime

JWT_SECRET_KEY = "dev-secret-key"  
JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(hours=1)  # 1 Saatlik bir token süresi olunca otomatik olarak geçersiz kılıyor bunu güvenlik için yaptım.

# Python 3.11 imajını kullan
FROM python:3.11-slim

# Çalışma dizini
WORKDIR /app

# Sistem bağımlılıklarını yükle
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Python bağımlılıklarını kopyala ve yükle
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Port
EXPOSE 8000

# Gunicorn ile başlat
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "app:app"]
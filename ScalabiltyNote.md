# Scalability Note

## Current Architecture
This project follows a modular monolith pattern — users and tasks are separate Django apps within one codebase, making it easy to split into microservices later.

---

## Scaling Strategy

### 1. Microservices
The `users` and `tasks` apps are already decoupled. Each can be extracted into an independent Django service with its own database, communicating via REST or a message broker like RabbitMQ.

### 2. Caching with Redis
Task list endpoints (`GET /api/v1/tasks/`) can be cached using Django's Redis cache backend. This reduces database load significantly under high traffic.

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    }
}
```

### 3. Load Balancing with Nginx
Nginx can be placed in front of multiple Django instances (via Gunicorn) to distribute traffic evenly across workers.

```
Client → Nginx → Gunicorn Worker 1
                → Gunicorn Worker 2
                → Gunicorn Worker 3
```

### 4. Docker & Docker Compose
The entire stack (Django, PostgreSQL, Redis, Nginx) can be containerized using Docker Compose, enabling consistent deployments across environments.

```yaml
services:
  web:    # Django + Gunicorn
  db:     # PostgreSQL
  redis:  # Redis cache
  nginx:  # Reverse proxy
```

### 5. Database Connection Pooling
Under high load, pgBouncer can be used to pool PostgreSQL connections, preventing connection exhaustion and reducing latency.

---

## Summary

| Concern | Solution |
|---|---|
| Horizontal scaling | Docker + Load balancer |
| Read performance | Redis caching |
| Service isolation | Microservices per domain |
| DB performance | pgBouncer connection pooling |
| Deployment | Docker Compose / Kubernetes |
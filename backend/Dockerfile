FROM python:3.11-slim AS builder
WORKDIR /app

RUN pip install uv

COPY pyproject.toml ./
RUN uv sync --no-dev

FROM python:3.11-slim
WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY . .

ENV PATH="/app/.venv/bin:$PATH"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

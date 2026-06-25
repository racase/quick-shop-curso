## ADDED Requirements

### Requirement: Admin generates product fields via LLM
The system SHALL expose a backend endpoint `POST /api/v1/products/ai-generate` that accepts a natural-language `prompt` from an authenticated admin user and returns a structured JSON object with AI-generated product fields (`name`, `description`, `price`, `stock`, `image_url`). Only users with the `admin` role SHALL be authorized to call this endpoint. The backend SHALL forward the prompt to OpenRouter using the configured API key and model, parse the LLM response, and return validated field values to the client. The OpenRouter API key SHALL never be exposed to the frontend.

#### Scenario: Admin generates product fields successfully
- **WHEN** an admin sends `POST /api/v1/products/ai-generate` with body `{"prompt": "Auriculares inalámbricos gaming con cancelación de ruido"}` and a valid admin token
- **THEN** the system returns HTTP 200 with a JSON object containing `name`, `description`, `price`, `stock`, and `image_url` fields populated by the LLM

#### Scenario: Non-admin user is rejected
- **WHEN** a client user sends `POST /api/v1/products/ai-generate` with a valid client token
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Unauthenticated request is rejected
- **WHEN** `POST /api/v1/products/ai-generate` is called without an Authorization header
- **THEN** the system returns HTTP 401 Unauthorized

#### Scenario: LLM returns invalid JSON
- **WHEN** the LLM response cannot be parsed as a valid product fields object
- **THEN** the system returns HTTP 502 Bad Gateway with an error message indicating the LLM response was malformed

#### Scenario: Empty prompt is rejected
- **WHEN** an admin sends `POST /api/v1/products/ai-generate` with an empty or missing `prompt` field
- **THEN** the system returns HTTP 422 Unprocessable Entity

#### Scenario: OpenRouter API key not configured
- **WHEN** the `OPENROUTER_API_KEY` environment variable is not set at startup
- **THEN** the application SHALL fail to start (or log a critical error and disable the endpoint) rather than silently failing at request time

### Requirement: OpenRouter integration is backend-only
The system SHALL make all HTTP requests to OpenRouter exclusively from the backend service. The `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` values SHALL be loaded from environment variables and SHALL NOT be included in any API response or frontend bundle.

#### Scenario: API key not present in frontend bundle
- **WHEN** the frontend application is built and served
- **THEN** no OpenRouter API key or model configuration is accessible via browser dev tools, network requests, or the JS bundle

#### Scenario: Model is configurable without code change
- **WHEN** the `OPENROUTER_MODEL` environment variable is updated and the backend is restarted
- **THEN** subsequent calls to `POST /api/v1/products/ai-generate` use the new model without requiring a code deployment

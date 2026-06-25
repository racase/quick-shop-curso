# quick-shop-curso
Repositorio para el curso Desarrollo con IA: De escribir prompts al desarrollo con agentes

El repositorio no tiene codigo, el codigo se irá generando durante el curso con agentes de codigo, en especial Claude Code y OpenCode. 

La rama main solo tiene las carpetas iniciales necesarias a modo de scaffolding para poder clonar el proyecto y empezar a trabajar en el con los principales agentes de codigo.



## AI Product Generation (OpenRouter Integration)

QuickShop includes AI-powered product generation for admin users. Admins can describe products in natural language and the system will auto-fill product fields using OpenRouter LLM.

### Configuration

To enable AI product generation, set these environment variables in `backend/.env`:

```
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

### How to Use

1. Navigate to `/admin/products` in the admin panel
2. Click "+ New product"
3. Click the "✨ AI Generate" button
4. Enter a natural language description of the product (e.g., "Wireless noise-cancelling headphones with 30-hour battery life")
5. The system will fetch product data from OpenRouter and auto-fill the form
6. Review and edit the fields as needed, then save

### Security Notes

- The OpenRouter API key is stored **only** on the backend server
- The API key is **never** exposed to the frontend or browser
- Only admin users can access the AI generation endpoint
- The endpoint rate-limiting is recommended for production deployments

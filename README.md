# StudyFlow — OpenAI-only, clean UI study helper

## Run
```bash
npm i
cp .env.example .env      # add OPENAI_API_KEY if you have one
npm run dev
```
- Study Plan: /study → POST /api/plan
- Resources: /resources → POST /api/resources
- Notes: /notes → POST /api/summarize

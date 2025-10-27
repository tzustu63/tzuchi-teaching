# Project Context

## Purpose

開發一個 AI 驅動的課程計劃生成器，協助教師快速建立完整的課程計劃，包含教學理念、學習目標、教學策略、教學流程，並自動生成 PPT 和學習單。

## Tech Stack

- Frontend: HTML, CSS, JavaScript (Vanilla)
- Backend: Python (FastAPI)
- AI Integration: OpenAI API
- Database: SQLite (dev) → PostgreSQL (DigitalOcean Managed Database)
- File Storage: Local (dev) → DigitalOcean Spaces
- Deployment: DigitalOcean App Platform
  - Backend: Web Service with Gunicorn/uWSGI
  - Frontend: Static Site
  - Database: Managed PostgreSQL
  - Storage: Spaces (S3-compatible)

## Project Conventions

### Code Style

- Python: PEP 8
- JavaScript: ES6+
- HTML/CSS: 語義化標籤，響應式設計

### Architecture Patterns

- 前後端分離架構
- RESTful API 設計
- 基於步驟的工作流程（Step-by-step wizard）

### Testing Strategy

- Unit tests for prompt generation
- Integration tests for OpenAI API calls
- E2E tests for user workflow

### Git Workflow

- Main branch for production
- Feature branches for development
- Conventional commits

## Domain Context

本專案專注於教育領域，需要理解教學設計的基本要素：

- 教學理念（Rationale）
- 學習目標（Objectives - Cognitive, Psychomotor, Affective）
- 教學策略（Teaching Strategies）
- 教學流程（Teaching Flow）
- 教學資源（PPT, Learning Sheets）

## Important Constraints

- 每個步驟需要與 OpenAI API 整合
- 需要可配置的 prompt templates
- 前端需要可修改 prompt 的功能
- 需要安全儲存 OpenAI API key

## External Dependencies

- OpenAI API (GPT-3.5/4) - 用於生成課程計劃內容
- Python libraries:
  - openai - OpenAI API 整合
  - fastapi - Web framework
  - sqlalchemy - ORM
  - python-pptx - PPT 生成
  - boto3 - DigitalOcean Spaces 整合
  - pydantic - 資料驗證
- DigitalOcean Services:
  - App Platform - 應用部署
  - Managed PostgreSQL - 資料庫
  - Spaces - 對象存儲

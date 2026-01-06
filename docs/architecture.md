# GJHealth AI Orchestrator – Architecture

## Purpose
This service provides AI reasoning and orchestration for GJHealth without
owning patient data or infrastructure.

## Design Principles
- Cloud-agnostic
- Stateless
- No direct database access
- AI via injected adapters (Vertex, OpenAI, etc.)

## High-Level Flow
1. External system sends triage input
2. Handler validates and forwards request
3. Pipeline selects prompt and reasoning path
4. AI generates SOAN output
5. Result returned to caller

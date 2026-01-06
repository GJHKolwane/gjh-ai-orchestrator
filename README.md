# GJH AI Orchestrator

## Overview
This repository contains the cloud-agnostic AI orchestration layer for **GJHealth**.  
It is responsible for clinical reasoning workflows, including AI-assisted triage and SOAN
(Subjective, Objective, Assessment, Next steps) generation.

The orchestrator is designed to remain portable across cloud providers while integrating
with regulated health data platforms (e.g. FHIR/DICOM) through secure APIs.

## Scope
- AI prompt and reasoning pipelines
- SOAN generation logic
- Triage decision orchestration
- Cloud-agnostic design (GCP, Azure, AWS compatible)

## Out of Scope
- Patient data storage
- Authentication and user management
- Direct infrastructure provisioning

## Status
Early architecture and design phase.

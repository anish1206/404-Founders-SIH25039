# INCOIS Ocean Hazard Reporting Platform

## Project Overview

The INCOIS Ocean Hazard Reporting Platform is a specialized solution developed for SIH 2025 (Problem Statement: SIH25039) to facilitate the monitoring and reporting of ocean-related hazards. The platform provides a streamlined interface for field reporting and a robust administrative backend for verification and data analysis.

## Core Pipeline and Verification

This project implements a hazard reporting and verification pipeline. Users submit incident reports through the mobile application, providing a hazard type, textual description, GPS coordinates, and an image uploaded via Cloudinary. The report is persisted in MongoDB with an initial status of `pending` and an `aiConfidenceScore` of zero, and the client receives an immediate acknowledgement.

An asynchronous AI verification pipeline (`server/services/aiVerification.js`) then processes each report in two stages:

1. **Coastal Location Check**: The submitted GPS coordinates are validated against India's defined coastal bounding box. A report originating from a qualifying coastal region receives 30 confidence points; reports that fail this check are not processed further.

2. **CLIP-Based Image-to-Text Verification**: The backend calls Hugging Face's inference API using the `openai/clip-vit-large-patch14` model in zero-shot image classification mode. The submitted image is evaluated against a set of ocean-hazard candidate labels (e.g., `ocean`, `waves`, `surge`, `flood`). If the top-scoring label exceeds a similarity threshold of 0.70, up to 70 additional confidence points are awarded proportionally to the model's score.

The two checks yield a composite `aiConfidenceScore` out of 100. Reports scoring 85 or above are automatically promoted to `verified` status. Reports below this threshold remain `pending` for manual review by an administrator or analyst, who can update the status via the `PATCH /api/reports/:id/status` endpoint. This multi-stage scoring approach—combining geospatial validation with semantic image-text matching—reduces false positives and ensures only credible ocean hazard reports advance through the system.

## Key Features

- **Mobile Application**: Facilitates real-time hazard reporting with integrated GPS location tracking and image submission capabilities.
- **Administrative Dashboard**: A comprehensive web interface for administrators and analysts to monitor, verify, and manage hazard reports.
- **Backend API**: A RESTful service built with Node.js and Express, utilizing MongoDB for data persistence and integrating AI models for automated verification.
- **Secure Authentication**: User identity management powered by Firebase Authentication.
- **Role-Based Access Control**: Granular permissions for different user roles, including administrators and data analysts.

## Project Architecture

The repository is structured into three primary components:

- **mobile-app**: Developed using React Native and Expo for cross-platform mobile reporting.
- **dashboard**: A React.js based web application for administrative oversight.
- **server**: A Node.js and Express backend handling business logic and AI integration.

## Technical Stack

- **Frontend**: React.js, React Native, Expo
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: Firebase
- **AI/ML**: CLIP (openai/clip-vit-large-patch14) via Hugging Face
- **Media Management**: Cloudinary

---

Developed for **SIH 2025** by **Team 404 Founders** in collaboration with INCOIS (Indian National Centre for Ocean Information Services).
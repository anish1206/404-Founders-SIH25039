# INCOIS Ocean Hazard Reporting Platform

## Project Overview

The INCOIS Ocean Hazard Reporting Platform is a specialized solution developed for SIH 2025 (Problem Statement: SIH25039) to facilitate the monitoring and reporting of ocean-related hazards. The platform provides a streamlined interface for field reporting and a robust administrative backend for verification and data analysis.

## Core Pipeline and Verification

This project implements a hazard reporting and verification pipeline where users submit incident reports consisting of images and detailed descriptions. This workflow mirrors the reporting mechanisms employed in DREAMS (Disaster Risk and Early Action Management System), a broader initiative for hazard monitoring and response.

A critical component of this pipeline is automated report validation. The backend integrates a CLIP-based image-to-text verification module (openai/clip-vit-large-patch14 via Hugging Face) that cross-references submitted hazard images against their textual descriptions, confirming authenticity and relevance before the report reaches an analyst.

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
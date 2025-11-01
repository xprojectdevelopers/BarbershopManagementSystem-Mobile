# Molave Street Barbers - System Diagrams

This document provides comprehensive Data Flow Diagrams (DFD) and Entity-Relationship Diagrams (ERD) for the Molave Street Barbers mobile application.

## 📋 Table of Contents

1. [Data Flow Diagram (DFD)](#data-flow-diagram-dfd)
2. [Entity-Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
3. [System Architecture Overview](#system-architecture-overview)
4. [Key Business Processes](#key-business-processes)

## 📊 Data Flow Diagram (DFD)

### Level 0 - Context Diagram

The system interacts with the following external entities:
- **Customer**: Mobile app users who book appointments
- **Barber Employee**: Staff members who provide services
- **Payment Processor**: External payment gateway
- **Email Service**: Handles OTP and transactional emails
- **Push Notification Service**: Manages real-time notifications

### Level 1 - Main Processes

1. **User Authentication & Profile Management**
   - Handles login/signup, profile updates, OTP verification
   - Manages customer profiles and authentication tokens

2. **Appointment Booking & Management**
   - Processes appointment requests, validates availability
   - Calculates pricing, generates receipts, manages booking lifecycle

3. **Notification Management**
   - Generates and sends notifications via multiple channels
   - Manages push notifications and email communications

4. **Employee Management**
   - Manages barber profiles, schedules, and availability
   - Handles employee authentication and role management

5. **Payment Processing**
   - Processes payments through external gateways
   - Generates receipts and manages transaction records

## 🗄️ Entity-Relationship Diagram (ERD)

### Core Entities

1. **Customer_Profiles**
   - User accounts, contact information, preferences
   - Links to appointments and notifications

2. **Add_Employee**
   - Staff information, roles, schedules, photos
   - Filtered to show only barbers for appointment booking

3. **Appointment_Sched**
   - Booking details, status, payments, receipts
   - Central entity connecting customers, barbers, and services

4. **Notifications**
   - System and user notifications
   - Tracks appointment status and system events

5. **Notification_Loader**
   - Pending notifications queue
   - Manages notification delivery status

### Key Relationships

- **Customer → Appointments**: One-to-Many (1:N)
- **Barber → Appointments**: One-to-Many (1:N)
- **Customer → Notifications**: One-to-Many (1:N)
- **Customer → Notification_Loader**: One-to-Many (1:N)

## 🏗️ System Architecture Overview

### Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Storage**: Supabase Storage (Profile images, barber photos)
- **Notifications**: Expo Push Notifications + Firebase
- **Email**: Supabase Edge Functions for OTP and transactional emails

### Trust Boundaries

1. **Mobile App ↔ Supabase Backend**
   - All client-server communications
   - Authentication and session management

2. **Supabase ↔ External Services**
   - Email service integration
   - Push notification delivery
   - Payment processing

3. **Customer Data ↔ Employee Data**
   - Role-based access control
   - Data segregation for privacy

## 🔄 Key Business Processes

### 1. Customer Registration & Authentication
```
Customer → App → Supabase Auth → OTP Email → Verification → Profile Creation
```

### 2. Appointment Booking
```
Customer → Select Service/Barber/Date → Validate Availability → Calculate Price → Payment → Confirmation → Notifications
```

### 3. Notification System
```
System Event → Generate Notification → Determine Channels → Send Push/Email → Track Delivery
```

### 4. Employee Management
```
Barber Login → Access System → Update Schedule → Manage Appointments → Customer Service
```

## 📁 Files Included

- `DFD_MolaveStreetBarbers.txt` - Complete DFD documentation
- `ERD_MolaveStreetBarbers.txt` - Complete ERD documentation
- `DFD_Level1_Detailed.txt` - Detailed Level 1 process descriptions
- `README_Diagrams.md` - This overview document

## 🔒 Security Considerations

- **Authentication**: Supabase Auth with session management
- **Authorization**: Row Level Security (RLS) policies
- **Data Protection**: TLS encryption for data in transit
- **Input Validation**: Client and server-side validation
- **Audit Logging**: Critical operations tracking

## 📞 Support

For questions about these diagrams or the system architecture, please refer to the development team or project documentation.

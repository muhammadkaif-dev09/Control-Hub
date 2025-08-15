# User Subscription Page

This directory contains the components and logic for the user subscription page of the application.

## Overview

The user subscription page allows users to view and select subscription plans. It is designed to provide a clear and user-friendly interface for managing subscriptions.

## Components

### `page.jsx`

- This file defines the main page component for user subscriptions.
- It imports necessary hooks and components, including `Layout` and `PlanCardPreview`.
- It manages the state for the selected plan and renders the `PlanCardPreview` component to display the selected plan.

### `PlanDisplay.jsx`

- This file contains the `PlanDisplay` component, which is responsible for rendering a list of subscription plans.
- It includes the `PlanCard` component to display individual plans.
- The Delete icon is omitted, and the Update Plan button is replaced with a Select Plan button.

## Usage

To use the user subscription page, navigate to the appropriate route in the application. The page will display available subscription plans, allowing users to select their desired plan.

## Future Enhancements

- Consider adding user feedback mechanisms for plan selection.
- Implement additional features for managing subscriptions, such as viewing past subscriptions or upgrading/downgrading plans.
This file prepares Pocketbase for local development with the AIssistant by executing a data migration script. It does:

- Create a superuser with the credentials:
  - Email address: admin@example.org
  - Password: Pa$$w0rd
- Configure OIDC to work with a local Keycloak instance (setup using ./compose.yml)

This configuration is meant ONLY for development purposes, and should NOT be used in production.

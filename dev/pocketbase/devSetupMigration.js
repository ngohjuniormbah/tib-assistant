migrate(
  (app) => {
    // create provider
    const providers = [
      {
        pkce: true,
        name: 'oidc',
        clientId: 'tib-aissistant',
        clientSecret: '**********',
        authURL:
          'http://keycloak.localhost:8080/realms/orkg/protocol/openid-connect/auth',
        tokenURL:
          'http://keycloak.localhost:8080/realms/orkg/protocol/openid-connect/token',
        userInfoURL:
          'http://keycloak.localhost:8080/realms/orkg/protocol/openid-connect/userinfo',
        displayName: 'ORKG Keycloak',
      },
    ];

    // create superuser
    const users = app.findCollectionByNameOrId('users');
    users.oauth2.providers = providers;
    users.oauth2.enabled = true;
    app.save(users);

    let superusers = app.findCollectionByNameOrId('_superusers');

    let record = new Record(superusers);
    record.set('email', 'admin@example.org');
    record.set('password', 'Pa$$w0rd');
    app.save(record);
  },
  () => {
    return null;
  }
);

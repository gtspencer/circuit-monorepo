# Circuit
### Completing the engagement loop.

This is a websocket server that routes appropriate messages via a router factory and service factory working in tandem.
Each route has the option to use any of the services, injected at runtime.

### Services
Services are created using a factory pattern:
```ts
export function createSettingsService(db: DB, cache: Cache) {
    async function cacheGet(fid: number) {
        return cache.get<Doc>(cache.key.userSettings(fid));
    }
}
```
This is done so all routes can use single instances of services, making it easier to test and debug.

### Routes
Routes are created using a similar factory pattern, where services are injected on startup as needed:
```ts
export function userSetSettingsRoute(deps: { settingsService: SettingsService }): RouteEntry<UserSetSettingsMsg>[] {
  const { settingsService } = deps;

  return [
    ['user.settings.set', async (ws, msg) => {
      // ... do something ...
    }],
  ];
}
```

### Lifecycle
On startup, services are created, injecting any core level dependencies (Database, Redis, etc.), and then services are injected into routes as needed:
```ts
// create services in service factory
const services = createServices({ db, cache });

// register route modules
registerRoutes([
  ...userLoginRoute(),
  ...userGetSettingsRoute({ settingsService: services.settingsService }),
  ...userSetSettingsRoute({ settingsService: services.settingsService }),
]);
```


#### ToDo
- update login flow to create record only *after* the user has meaningfully engaged with the platform
  - display default data in frontend until user "updates" their settings
- post payout limit (first x engagements get a payment)
- 1 payout per post (per person)
  - i.e. don't pay a user for both liking, and recasting
- following only
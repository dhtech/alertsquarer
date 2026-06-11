# Panel images

Drop PNG files here to show them on a panel instead of the alert count + team
name. A panel is 32×32 px; images are scaled to fill it and transparent pixels
stay black.

To use one, map a team to its filename in `src/settings.ts`:

```ts
export const panelImages: Partial<Record<Team, string>> = {
  services: 'logo.png',
}
```

The build script copies this directory to `build/images/`, so add your PNGs
here **before running `npm run build`**.

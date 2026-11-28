# Contributing

Small, focused contributions are welcome.

## Set up and run locally

You need Git, Google Chrome and Node.js 24 or newer with pnpm. The extension itself has no runtime dependencies; run `pnpm install` only if you want to lint. Contributors develop, test and submit pull requests; no release signing key is needed. Never request or distribute the release private key.

1. Clone the repository and enter its directory:

   ```sh
   git clone https://github.com/dongeerts/replacinator.git
   cd replacinator
   ```

2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Select **Load unpacked** and choose the repository directory.
4. Open a regular web page and select Replacinator from Chrome's extensions menu.

Chrome blocks script injection on pages such as `chrome://` URLs and the Chrome Web Store.

## Develop

Edit `popup.html`, `popup.css` and `popup.js` for the popup and replacement logic. Extension settings live in `manifest.json`; icons live in `static/icons/`.

After making changes, reload the extension on `chrome://extensions`, then close and reopen the popup.

Keep changes focused and follow the existing code style. User interface changes must meet WCAG 2.2 AA: preserve labels, keyboard access, visible focus, sufficient contrast and accessible feedback messages.

## Lint

The project uses ESLint. Install the development dependencies once with `pnpm install`, then run the linter:

```sh
pnpm lint
```

Fix all reported problems before opening a pull request. The same check runs on every pull request and must pass before merging into `main`.

## Test

There is currently no automated test suite. Test changes manually in Chrome on a regular web page using non-sensitive test data:

1. Find an input's exact value and replace it. Check that matching inputs change, non-matching inputs stay unchanged and the result count is correct.
2. Check that password inputs remain unchanged and are not included in the count.
3. Try a value with no matches and submit with both fields empty; check the feedback.
4. Try replacing a constrained input, such as a number field, with an invalid value; check that it is skipped and reported.
5. Open the popup on a `chrome://` page and try a replacement; check that an error appears and the submit button becomes available again.
6. Use only the keyboard to navigate, submit and dismiss feedback. Check visible focus and that feedback is announced by a screen reader for interface changes.

Include the checks you performed in your pull request.

## Build and package

Chrome can load the source directory directly for development. Run packaging commands from the repository root.

### Build and test locally (all contributors)

```sh
npm run build
```

Each build creates a clean `dist/extension/` containing only:

- `manifest.json`
- `popup.html`, `popup.css` and `popup.js`
- `static/icons/icon16.png`, `static/icons/icon32.png`, `static/icons/icon48.png` and `static/icons/icon128.png`

For local testing, use **Load unpacked** on `chrome://extensions` and choose `dist/extension`. No signing key is needed.

### Release policy (owner only)

Only the repository owner packages, publishes and distributes releases, after reviewing and merging changes. Only the owner manages and uses the release private key.

## Report bugs and request features

Search the [existing issues](https://github.com/dongeerts/replacinator/issues) first. If there is no matching issue, use the bug report or feature request template when opening a new issue.

For bugs, include reproduction steps, expected and actual behavior, Chrome and extension versions, and relevant errors. For features, explain the problem and the simplest useful solution. Never include passwords, personal data or secrets.

## Branches, commits and pull requests

1. Start from the latest `main` and create a short-lived branch such as `fix/input-matching` or `docs/contributing`. External contributors can fork the repository first.
2. Make focused commits using the existing convention: `feat:`, `fix:`, `docs:` or `chore:` followed by a short description, for example `docs: add contribution guidelines`.
3. Test your changes and open a pull request targeting `main`.
4. Complete the pull request template: explain what changed, link the related issue (for example, `Closes #10`), and describe your manual checks. Include screenshots for visible changes when useful, with a text description.
5. Address review feedback before the pull request is merged.

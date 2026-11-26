# Contributing

Small, focused contributions are welcome.

## Set up and run locally

You need Git and Google Chrome. There are no dependencies to install.

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

## Test

There is no automated test suite, linter or build tooling configured yet. Test
changes manually in Chrome on a regular web page using non-sensitive test data:

1. Find an input's exact value and replace it. Check that matching inputs change,
   non-matching inputs stay unchanged and the result count is correct.
2. Check that password inputs remain unchanged and are not included in the count.
3. Try a value with no matches and submit with both fields empty; check the feedback.
4. Try replacing a constrained input, such as a number field, with an invalid
   value; check that it is skipped and reported.
5. Open the popup on a `chrome://` page and try a replacement; check that an error
   appears and the submit button becomes available again.
6. Use only the keyboard to navigate, submit and dismiss feedback. Check visible
   focus and that feedback is announced by a screen reader for interface changes.

Include the checks you performed in your pull request.

## Build and package

No build step is needed: Chrome loads the source files directly. If you need a
ZIP package, run this from the repository root with the `zip` utility installed:

```sh
zip -r replacinator.zip manifest.json popup.html popup.css popup.js static
```

Do not include the generated ZIP in your pull request.

## Report bugs and request features

Search the [existing issues](https://github.com/dongeerts/replacinator/issues) first. If there is no matching issue, use the bug report or feature request template when opening a new issue.

For bugs, include reproduction steps, expected and actual behavior, Chrome and extension versions, and relevant errors. For features, explain the problem and the simplest useful solution. Never include passwords, personal data or secrets.

## Branches, commits and pull requests

1. Start from the latest `main` and create a short-lived branch such as `fix/input-matching` or `docs/contributing`. External contributors can fork the repository first.
2. Make focused commits using the existing convention: `feat:`, `fix:`, `docs:` or `chore:` followed by a short description, for example `docs: add contribution guidelines`.
3. Test your changes and open a pull request targeting `main`.
4. Complete the pull request template: explain what changed, link the related issue (for example, `Closes #10`), and describe your manual checks. Include screenshots for visible changes when useful, with a text description.
5. Address review feedback before the pull request is merged.

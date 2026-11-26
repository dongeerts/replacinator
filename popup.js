function replaceInputs(search, replacement) {
  let replaced = 0;
  let skipped = 0;

  for (const input of document.querySelectorAll("input")) {
    if (input.value !== search) {
      continue;
    }

    if (input.type === "file" && replacement !== "") {
      skipped++;
      continue;
    }

    input.value = replacement;

    // Number, date and other constrained types may sanitize incompatible values.
    if (input.value !== replacement) {
      input.value = search;
      skipped++;
      continue;
    }

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    replaced++;
  }

  return { replaced, skipped };
}

const form = document.getElementById("replace-form");
const searchInput = document.getElementById("search");
const replacementInput = document.getElementById("replacement");
const status = document.getElementById("status");
const feedback = document.getElementById("feedback");
const feedbackIcons = feedback.querySelectorAll(".alert-icon");
const dismissButton = document.getElementById("dismiss-message");
const button = form.querySelector('button[type="submit"]');

function scrollToFeedback() {
  requestAnimationFrame(() => {
    if (feedback.dataset.variant) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      });
    }
  });
}

// Chrome can resize the popup after the alert has been rendered.
window.addEventListener("resize", scrollToFeedback);

function showFeedback(message, variant = "") {
  feedback.classList.toggle("alert", variant !== "");
  feedback.dataset.variant = variant;

  for (const icon of feedbackIcons) {
    icon.toggleAttribute("hidden", icon.dataset.variant !== variant);
  }

  dismissButton.hidden = variant === "";
  status.textContent = message;

  if (variant !== "") {
    scrollToFeedback();
  }
}

dismissButton.addEventListener("click", () => {
  const restoreFocus = document.activeElement === dismissButton;
  showFeedback("");

  if (restoreFocus) {
    button.focus();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (searchInput.value === "" && replacementInput.value === "") {
    showFeedback("Nothing to replace. Enter a value in Find or Replace with.", "negative");
    return;
  }

  button.disabled = true;
  showFeedback("Replacing...");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab?.id === undefined) {
      throw new Error("No active tab found.");
    }

    const [execution] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: replaceInputs,
      args: [searchInput.value, replacementInput.value],
    });

    if (!execution?.result) {
      throw new Error("No result received from the page.");
    }

    const { replaced, skipped } = execution.result;
    let message = `${replaced} input field(s) replaced.`;

    if (skipped > 0) {
      message += ` ${skipped} skipped: this field type does not accept the replacement value.`;
    }

    showFeedback(message, skipped > 0 || replaced === 0 ? "warning" : "positive");
  } catch (error) {
    showFeedback(
      `Replacement failed. Open a regular web page; Chrome blocks this on pages such as chrome:// URLs. ${error.message}`,
      "negative",
    );
  } finally {
    button.disabled = false;
  }
});

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
const button = form.querySelector("button");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  button.disabled = true;
  status.textContent = "Replacing...";

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
    status.textContent = `${replaced} input field(s) replaced.`;

    if (skipped > 0) {
      status.textContent += ` ${skipped} skipped: this field type does not accept the replacement value.`;
    }
  } catch (error) {
    status.textContent =
      `Replacement failed. Open a regular web page; Chrome blocks this on pages such as chrome:// URLs. ${error.message}`;
  } finally {
    button.disabled = false;
  }
});

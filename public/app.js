const form = document.querySelector("#note-form");
const list = document.querySelector("#note-list");
const error = document.querySelector("#error");
const status = document.querySelector("#status");
let deleteFocusTarget;
let deletedNoteName;
const updateCount = () => {
  const n = list.children.length;
  const noteCount = document.querySelector("#note-count");
  if (noteCount)
    noteCount.textContent = `${n} saved ${n === 1 ? "note" : "notes"}`;
};

document.addEventListener("htmx:beforeRequest", (event) => {
  const deleteButton = event.detail.elt.closest("button[hx-delete]");
  if (!deleteButton) return;

  const item = deleteButton.closest("li");
  deleteFocusTarget =
    item.nextElementSibling?.querySelector("button[hx-delete]") ||
    item.previousElementSibling?.querySelector("button[hx-delete]") ||
    form.querySelector("#query");
  deletedNoteName = item.querySelector("a")?.textContent.trim() || "Note";
});

document.addEventListener("htmx:beforeSwap", (event) => {
  const responseStatus = event.detail.xhr?.status;
  const successful = responseStatus >= 200 && responseStatus < 300;
  if (!deleteFocusTarget || !successful) return;

  deleteFocusTarget.focus();
  status.textContent = deletedNoteName + " deleted.";
  deleteFocusTarget = undefined;
  deletedNoteName = undefined;
});

document.addEventListener("htmx:responseError", () => {
  deleteFocusTarget = undefined;
  deletedNoteName = undefined;
});

document.addEventListener("htmx:afterSettle", () => {
  updateCount();
  if (list.children.length === 0) {
    document.querySelector("#empty-state")?.classList.remove("hidden");
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const note = Object.fromEntries(new FormData(form));
  const response = await fetch("/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  const data = await response.json();
  if (!response.ok) {
    error.textContent = data.error;
    return;
  }
  error.textContent = "";
  const item = document.createElement("li");
  item.tabIndex = -1;
  item.className =
    "flex min-w-0 flex-col border border-gray-200 bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2";
  const link = document.createElement("a");
  link.href = data.searchUrl;
  link.target = "_blank";
  link.rel = "noopener";
  link.className =
    "break-words text-lg font-bold text-teal-700 hover:text-teal-900 hover:underline";
  link.textContent = data.query;
  const text = document.createElement("p");
  text.className =
    "mt-3 flex-1 whitespace-pre-wrap break-words leading-7 text-gray-600";
  text.textContent = data.text;
  const actions = document.createElement("div");
  actions.className =
    "mt-5 flex items-center justify-between border-t border-gray-100 pt-4";
  const indicator = document.createElement("span");
  indicator.className = "htmx-indicator text-sm text-gray-500";
  indicator.id = `indicator-${data.id}`;
  indicator.textContent = "Deleting...";
  const deleteButton = document.createElement("button");
  deleteButton.className =
    "ml-auto rounded px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600";
  deleteButton.setAttribute("hx-delete", `/notes/${data.id}`);
  deleteButton.setAttribute("hx-target", "closest li");
  deleteButton.setAttribute("hx-swap", "outerHTML");
  deleteButton.setAttribute("hx-confirm", "Delete this note?");
  deleteButton.setAttribute("hx-indicator", `#indicator-${data.id}`);
  deleteButton.textContent = "Delete";
  item.append(link);
  item.append(text);
  actions.append(indicator, deleteButton);
  item.append(actions);
  list.append(item);
  document.querySelector("#empty-state")?.classList.add("hidden");
  htmx.process(item);
  form.reset();
  item.focus();
  status.textContent = data.query + " added.";
  updateCount();
});

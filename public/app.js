const form = document.querySelector("#note-form");
const list = document.querySelector("#note-list");
const error = document.querySelector("#error");

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
  const link = document.createElement("a");
  link.href = data.searchUrl;
  link.textContent = data.query;
  const text = document.createElement("p");
  text.textContent = data.text;
  const indicator = document.createElement("span");
  indicator.className = "htmx-indicator";
  indicator.id = `indicator-${data.id}`;
  indicator.textContent = "Deleting...";
  const deleteButton = document.createElement("button");
  deleteButton.setAttribute("hx-delete", `/notes/${data.id}`);
  deleteButton.setAttribute("hx-target", "closest li");
  deleteButton.setAttribute("hx-swap", "outerHTML");
  deleteButton.setAttribute("hx-confirm", "Delete this note?");
  deleteButton.setAttribute("hx-indicator", `#indicator-${data.id}`);
  deleteButton.textContent = "Delete";
  item.append(link);
  item.append(text);
  item.append(indicator);
  item.append(deleteButton);
  list.append(item);
  htmx.process(item);
  form.reset();
});

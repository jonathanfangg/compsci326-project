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
  item.append(link);
  item.append(text);
  list.append(item);
  form.reset();
});

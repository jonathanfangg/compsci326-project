const form = document.querySelector("#login-form");
const error = document.querySelector("#login-error");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  error.textContent = "";

  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(new FormData(form))),
  });

  if (!response.ok) {
    const data = await response.json();
    error.textContent = data.error;
    return;
  }

  window.location.assign("/notes");
});

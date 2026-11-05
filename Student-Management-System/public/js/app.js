// Small progressive enhancement: dismiss transient success messages.
document.querySelectorAll('.alert.success').forEach((alert) => {
  window.setTimeout(() => alert.classList.add('fade-out'), 4500);
});

function showPass() {
  const passwordField = document.getElementById("passwordField");
  const showPasswordCheckbox = document.getElementById("showPasswordCheckbox");

  passwordField.type = showPasswordCheckbox.checked ? "text" : "password";
}

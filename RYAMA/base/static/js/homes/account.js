const $signUpButton = document.getElementById("signUp");
const $signInButton = document.getElementById("signIn");
const $container = document.getElementById("account");

$signUpButton.addEventListener("click", () => {
  $container.classList.add("right-panel-active");
});

$signInButton.addEventListener("click", () => {
  $container.classList.remove("right-panel-active");
});

const $signUpUsername = document.getElementById("up-name");
const $signUpUsernameError = document.getElementById("up-name-invalid");
const $signUpUsernameFeedback = document.getElementById("up-name-feedback");

function ResetSignUpUsername(html = "") {
  $signUpUsername.classList.remove("is-valid");
  $signUpUsername.classList.remove("is-invalid");
  $signUpUsernameFeedback.innerHTML = html;
}

function ValidSignUpUsername() {
  $signUpUsername.classList.add("is-valid");
  $signUpUsername.classList.remove("is-invalid");
}

function InValidSignUpUsername(errorContent = null) {
  if (errorContent != null) {
    $signUpUsernameError.textContent = errorContent;
  }
  $signUpUsername.classList.add("is-invalid");
  $signUpUsername.classList.remove("is-valid");
}

let timeout;
$signUpUsername.addEventListener("input", () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    ResetSignUpUsername();
    username = $signUpUsername.value;
    if (username == "") {
      InValidSignUpUsername("ユーザー名を入力してください");
    } else if (usernames.indexOf(username) == -1) {
      ValidSignUpUsername();
    } else {
      InValidSignUpUsername("このユーザー名は既に使用されています");
    }
  }, 3000);
  ResetSignUpUsername(
    '<span class="spinner-border spinner-border-sm text-danger" role="status"></span>',
  );
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inputForm');
  const outputDiv = document.getElementById('output');
  const captchaContainer = document.getElementById('captchaContainer');
  let captchaResolved = false; // État pour savoir si le CAPTCHA est résolu

  form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const numberInput = document.getElementById('numberInput').value;
      const N = parseInt(numberInput, 10);

      if (isNaN(N) || N < 1 || N > 1000) {
          alert('Please enter a valid number between 1 and 1000.');
          return;
      }

      form.style.display = 'none';
      outputDiv.innerHTML = '<p>Generating sequence...</p>';

      for (let i = 1; i <= N; i++) {
          try {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              const response = await fetch('https://api.prod.jcloudify.com/whoami');
              if (response.ok) {
                  outputDiv.innerHTML += `<p>${i}. Success: ${await response.text()}</p>`;
              } else if (response.status === 405) {
                  outputDiv.innerHTML += `<p>${i}. Captcha required. Solve the captcha to continue.</p>`;
                  await handleCaptcha(); // Attendre que le CAPTCHA soit résolu
              } else {
                  outputDiv.innerHTML += `<p>${i}.Forbidden</p>`;
              }
          } catch (error) {
              outputDiv.innerHTML += `<p>${i}. Request failed: ${error.message}</p>`;
          }
      }

      // Afficher la fin de la séquence
      outputDiv.innerHTML += '<p>Sequence generation complete!</p>';
  });

  // Gérer le CAPTCHA
  function handleCaptcha() {
      captchaResolved = false; // Réinitialiser l'état
      captchaContainer.innerHTML = "<p>Résolvez le CAPTCHA pour continuer :</p>";
      return new Promise((resolve, reject) => {
          try {
              AwsWafCaptcha.renderCaptcha(captchaContainer, {
                  apiKey: "QFYeykBdQKdBtLhvHuK+hlH19ZxKrOLx3L6WUx+qRpfh9vMYAJdYb2oxcpE5KTBfEhmqrrhEvRVeODIZAQEnIOTQqqG/j6FUGLohcKveATIuOWDePxGmPOdcu4NLMCWwCg8dGdatkqKZlUhos2yl3DGIuUL4JVhlpmvPN5Li8WUQXFptUmZqBZupowmVQ+Sb82O/zdObyaLVdjNnlXe02zWpeepFsOxUqk2nVJGN0RCEgH+OG8t5bdeLm4lKFoBQa4wAh5oVpJ8ErwhZNgdkLKqbwYX4cUGWHtOAcjRYcY1wxY/T8CXm6TG3tRwqbWmdGN0jvg9rVqpSPTFI7uwyVDxTtP5PAMBqMh4OZbwbidupU2OAw8wMGiHVj67ekOMI6dfq+7rZq/QcQJYjsEzMMNeA6hkj0Em8f8GUCpSIhSmPcgTqGt/bi3g/bkSwkNNaYQnu+X0GYKHH/fm88SJHUKVxvMb4TFBi7PDTDFH0qoXrbd4Z25D1mveDTjO0D65McMVwyg5CQlifCfGDmlSTSpgEHJ3uRPSYeF6ueJo8JGufYRv9HwAd1zKyHsASV2DmYT/p9dXFrNRqp9OmYM1lmqjdwLLibJ5mKF28B1Ku2sDg93UM1CBTgsDw9lsXOmccYSzVHUfbUL8C+qUJZ1cDZP34kEwbt/q+f9eWtD26vzQ=_0_1",
                  onSuccess: () => {
                      captchaResolved = true; // Le CAPTCHA est résolu
                      captchaContainer.innerHTML = "<p>CAPTCHA résolu avec succès ! Vous pouvez continuer.</p>";
                      resolve(); // Résoudre la promesse
                  },
                  onError: (error) => {
                      captchaContainer.innerHTML += `<p>Erreur lors du rendu du CAPTCHA : ${error.message}</p>`;
                      reject(error); // Rejeter la promesse
                  },
              });
          } catch (error) {
              captchaContainer.innerHTML += `<p>Erreur lors du chargement du CAPTCHA : ${error.message}</p>`;
              reject(error);
          }
      });
  }
});

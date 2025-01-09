document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inputForm');
  const outputDiv = document.getElementById('output');
  const captchaContainer = document.getElementById('captchaContainer');
  let captchaResolved = false;

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
                  await handleCaptcha(); 
              } else {
                  outputDiv.innerHTML += `<p>${i}.Forbidden</p>`;
              }
          } catch (error) {
              outputDiv.innerHTML += `<p>${i}. Request failed: ${error.message}</p>`;
          }
      }

      outputDiv.innerHTML += '<p>Sequence generation complete!</p>';
  });


  function handleCaptcha() {
      captchaResolved = false;
      captchaContainer.innerHTML = "<p>Résolvez le CAPTCHA pour continuer :</p>";
      return new Promise((resolve, reject) => {
          try {
              AwsWafCaptcha.renderCaptcha(captchaContainer, {
                  apiKey: window.WAF_API_KEY,
                  onSuccess: () => {
                      captchaResolved = true;
                      captchaContainer.innerHTML = "<p>CAPTCHA résolu avec succès ! Vous pouvez continuer.</p>";
                      resolve(); 
                  },
                  onError: (error) => {
                      captchaContainer.innerHTML += `<p>Erreur lors du rendu du CAPTCHA : ${error.message}</p>`;
                      reject(error);
                  },
              });
          } catch (error) {
              captchaContainer.innerHTML += `<p>Erreur lors du chargement du CAPTCHA : ${error.message}</p>`;
              reject(error);
          }
      });
  }
});

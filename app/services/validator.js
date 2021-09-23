const { pwnedPassword } = require('hibp');
const passwordStrength = require('owasp-password-strength-test');

/**
 * Check if the password has been in a data breaches listed by https://haveibeenpwned.com/
 * @param plainPassword
 * @returns {Promise<boolean>}
 */
exports.isPasswordInDataBreaches = async (plainPassword) => {
  const breaches = await pwnedPassword(plainPassword);

  if (breaches > 0) {
    throw new Error(`Le mot de passe est répertorié dans ${breaches} fuite(s) de données. Veuillez en choisir un autre`);
  }

  return true;
};

/**
 * Check if the password is quite secure compared to our configuration
 * @param plainPassword
 * @returns {boolean}
 */
exports.isStrongPassword = async (plainPassword) => {
  const strength = passwordStrength.test(plainPassword);
  if (strength.errors.length < 1) {
    return true;
  }

  const errorsTranslation = {
    'The password must be at least 10 characters long.': 'Le mot de passe doit au moins avoir 10 caractères',
    'The password must contain at least one uppercase letter.': 'Le mot de passe doit contenir une lettre majuscule',
    'The password must contain at least one number.': 'Le mot de passe doit contenir au moins un chiffre',
    'The password must contain at least one special character.': 'Le mot de passe doit au moins contenir un caractère spécial',
  };

  strength.errors.map((error, i) => strength.errors[i] = errorsTranslation[error]);

  throw new Error(strength.errors.join(', '));
};

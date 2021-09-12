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
    throw new Error(`The provided password is found in ${breaches} data breaches`);
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

  throw new Error(strength.errors.join(' '));
};

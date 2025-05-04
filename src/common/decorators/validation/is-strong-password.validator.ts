import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as zxcvbn from 'zxcvbn';
import axios from 'axios';
import * as crypto from 'crypto';

@ValidatorConstraint({ async: true })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  async validate(password: string): Promise<boolean> {
    if (typeof password !== 'string') return false;

    // Step 1: zxcvbn strength check
    const zxcvbnScore = zxcvbn(password).score;
    if (zxcvbnScore < 3) return false;

    // Step 2: Check against Have I Been Pwned
    const sha1 = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    try {
      const response = await axios.get(
        `https://api.pwnedpasswords.com/range/${prefix}`,
      );
      const hashes = response.data.split('\r\n');

      const isPwned = hashes.some((line) => line.startsWith(suffix));
      return !isPwned;
    } catch (error) {
      console.error('HIBP API error:', error.message);
      return true;
    }
  }

  defaultMessage(): string {
    return 'Password is too weak or has been found in data breaches.';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsStrongPasswordConstraint,
    });
  };
}

export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const NAME_PATTERN = /^[A-Za-z\s]+$/;

export const VALIDATION_MESSAGES = {
  PASSWORD:
    'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number and one special character',
  NAME: 'Name must contain only letters and spaces',
};

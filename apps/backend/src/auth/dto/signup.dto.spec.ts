import { plainToInstance } from 'class-transformer';
import { SignUpDto } from './signup.dto';

describe('SignUpDto name normalization', () => {
  const transform = (plain: Record<string, unknown>) =>
    plainToInstance(SignUpDto, plain);

  it('coerces blank / whitespace-only names to undefined', () => {
    const dto = transform({
      email: 'a@b.com',
      password: 'x',
      firstName: '',
      lastName: '   ',
    });
    expect(dto.firstName).toBeUndefined();
    expect(dto.lastName).toBeUndefined();
  });

  it('trims surrounding whitespace from provided names', () => {
    const dto = transform({
      email: 'a@b.com',
      password: 'x',
      firstName: '  John  ',
      lastName: 'Doe',
    });
    expect(dto.firstName).toBe('John');
    expect(dto.lastName).toBe('Doe');
  });

  it('leaves omitted names undefined', () => {
    const dto = transform({ email: 'a@b.com', password: 'x' });
    expect(dto.firstName).toBeUndefined();
    expect(dto.lastName).toBeUndefined();
  });
});

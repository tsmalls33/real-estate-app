import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Class-level decorator — attach to any one property in the group.
 * Passes validation if at least one of the listed fields is non-null / non-empty
 * on the incoming request body.
 *
 * Usage:
 *   @AtLeastOneOf(['id_property', 'id_reservation'])
 *   @IsOptional() @IsUUID()
 *   id_property?: string;
 *
 * NOTE: Do NOT use this on UpdateDtos that are validated before the DB record
 * is read (PATCH). For those, handle the invariant in the service layer after
 * merging the incoming body with the existing record.
 */
export function AtLeastOneOf(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'atLeastOneOf',
      target: (object as any).constructor,
      propertyName,
      constraints: fields,
      options: validationOptions,
      validator: {
        validate(_: unknown, args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>;
          return fields.some((f) => obj[f] != null && obj[f] !== '');
        },
        defaultMessage(args: ValidationArguments) {
          return `At least one of [${args.constraints.join(', ')}] must be provided`;
        },
      },
    });
  };
}

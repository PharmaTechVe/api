import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsOlderThan(
  age: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsOlderThan',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [age],
      validator: {
        validate(value: string, args: ValidationArguments) {
          const birthDate = new Date(value);
          const today = new Date();
          const ageLimit = (args.constraints as number[])[0];
          const minAllowedDate = new Date(
            today.getFullYear() - ageLimit,
            today.getMonth(),
            today.getDate(),
          );
          return birthDate <= minAllowedDate;
        },
        defaultMessage(args: ValidationArguments) {
          return `You must be at least ${args.constraints[0]} years old to register.`;
        },
      },
    });
  };
}

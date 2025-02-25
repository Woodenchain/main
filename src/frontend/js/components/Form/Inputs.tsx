import { forwardRef, type ReactNode, useMemo } from 'react';

/**
 * A collection of form input elements
 * - TextField
 * - TextareaField
 * - SelectField
 * - CheckboxField
 * - RadioField
 */

interface FieldProps {
  inputId?: string;
  error?: Boolean;
  message?: ReactNode | string;
  fieldClasses?: string[];
}

// - Field
const Field = ({
  fieldClasses = [],
  inputId,
  error,
  message,
  children,
}: React.PropsWithChildren<FieldProps>) => {
  const classList = useMemo(() => {
    const classes = ['form-field', ...fieldClasses];
    if (error) {
      classes.push('form-field--error');
    }
    return classes.join(' ');
  }, [fieldClasses, error]);

  const iconHref = error ? '#icon-warning' : '#icon-info-rounded';

  return (
    <p className={classList}>
      <span className="form-field__box">{children}</span>
      {message && (
        <span className="form-field__message" {...(!!inputId && { id: `${inputId}-message` })}>
          <svg aria-hidden={true} className="form-field__message__icon">
            <use href={iconHref} />
          </svg>
          {message}
        </span>
      )}
    </p>
  );
};

// - TextField
interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement>, FieldProps {
  id: string;
  label?: string;
  type?:
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'month'
    | 'number'
    | 'password'
    | 'search'
    | 'tel'
    | 'text'
    | 'url'
    | 'week';
}

/**
 * A form input component.
 *
 * It forwards ref to the input element to retrieve easily its value from
 * parent component through useRef.
 *
 * @param {TextFieldProps} TextFieldProps
 * @return {HTMLInputElement} HTMLInputElement
 */

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ fieldClasses = [], label, id, type = 'text', error, message, ...props }, ref) => (
    <Field inputId={id} error={error} message={message} fieldClasses={fieldClasses}>
      <input
        className="form-field__input"
        id={id}
        placeholder={label}
        ref={ref}
        type={type}
        {...props}
        {...(!!message && {
          'aria-describedby': `${id}-message`,
        })}
      />
      {label && (
        <label className="form-field__label" htmlFor={id}>
          {label}
        </label>
      )}
    </Field>
  ),
);

// - TextareaField
interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {
  id: string;
  label?: string;
}

/**
 * A form textarea component.
 *
 * It forwards ref to the textarea element to retrieve easily its value
 * from parent component through useRef.
 *
 * @param {TextareaFieldProps} TextareaFieldProps
 * @return {HTMLTextAreaElement} HTMLTextAreaElement
 */
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ fieldClasses = [], error, message, label, id, ...props }, ref) => (
    <Field inputId={id} error={error} message={message} fieldClasses={fieldClasses}>
      <textarea
        className="form-field__textarea"
        id={id}
        placeholder={label}
        ref={ref}
        {...props}
        {...(!!message && {
          'aria-describedby': `${id}-message`,
        })}
      />
      {label && (
        <label className="form-field__label" htmlFor={id}>
          {label}
        </label>
      )}
    </Field>
  ),
);

// - SelectField
export interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    FieldProps {
  defaultValue?: string;
  id: string;
  label?: string;
}

/**
 * A form select component
 *
 * It forwards ref to the select element to retrieve easily its value
 * from parent component through useRef.
 *
 * @param {SelectFieldProps} SelectFieldProps
 * @return {HTMLSelectElement} HTMLSelectElement
 */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ fieldClasses = [], error, message, label, id, children, ...props }, ref) => (
    <Field inputId={id} error={error} message={message} fieldClasses={fieldClasses}>
      {label && (
        <label className="form-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <span className="form-field__select-container">
        <select
          className="form-field__select-input"
          id={id}
          ref={ref}
          {...props}
          {...(!!message && {
            'aria-describedby': `${id}-message`,
          })}
        >
          {children}
        </select>
        <span className="form-field__select-arrow" />
      </span>
    </Field>
  ),
);

// - CheckboxField
interface CheckboxFieldProps extends Omit<TextFieldProps, 'type'> {
  id: string;
  label: string;
}

/**
 * A checkbox input component
 *
 * It forwards ref to the input element to retrieve easily its value
 * from parent component through useRef.
 *
 * @param {CheckboxFieldProps} CheckboxFieldProps
 * @return {HTMLSelectElement} HTMLSelectElement
 */
export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ fieldClasses = [], error, message, label, id, ...props }, ref) => (
    <Field inputId={id} error={error} message={message} fieldClasses={fieldClasses}>
      <input
        className="form-field__checkbox-input"
        id={id}
        ref={ref}
        type="checkbox"
        {...props}
        {...(!!message && {
          'aria-describedby': `${id}-message`,
        })}
      />
      <label className="form-field__label" htmlFor={id}>
        <span className="form-field__checkbox-control" aria-hidden={true}>
          <svg role="img">
            <use href="#icon-check" />
          </svg>
        </span>
        {label}
      </label>
    </Field>
  ),
);

// - RadioField
interface RadioFieldProps extends CheckboxFieldProps {}

/**
 * A radio input component
 *
 * It forwards ref to the input element to retrieve easily its value
 * from parent component through useRef.
 *
 * @param {RadioFieldProps} RadioFieldProps
 * @return {HTMLSelectElement} HTMLInputElement
 */
export const RadioField = forwardRef<HTMLInputElement, RadioFieldProps>(
  ({ fieldClasses = [], error, label, message, id, onClick, ...props }, ref) => (
    <Field inputId={id} error={error} message={message} fieldClasses={fieldClasses}>
      <input
        className="form-field__radio-input"
        id={id}
        ref={ref}
        type="radio"
        {...props}
        {...(!!message && {
          'aria-describedby': `${id}-message`,
        })}
      />
      <label className="form-field__label" htmlFor={id}>
        <span className="form-field__radio-control" aria-hidden={true} />
        {label}
      </label>
    </Field>
  ),
);
